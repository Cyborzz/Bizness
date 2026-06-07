import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { isSmsConfigured } from "@/lib/sms/env";
import { sendSmsBatch, type SmsRecipient } from "@/lib/sms/send";
import { getServerVapid } from "./env";
import { sendPushBatch, type PushPayload, type StoredSubscription } from "./send";

// Anti-spam : on ne relance "plus qu'1 tampon" qu'une fois toutes les 2 semaines.
const ALMOST_THERE_COOLDOWN_DAYS = 14;
// Garde-fou de volume sur le scan des cartes (cf. note d'échelle).
const ALMOST_THERE_SCAN_LIMIT = 2000;
// Une relance "client inactif" au maximum tous les 30 jours par client.
const INACTIVE_COOLDOWN_DAYS = 30;
// Garde-fou de volume par commerce sur le scan des cartes inactives.
const INACTIVE_SCAN_LIMIT = 2000;

function unwrap<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export type ReengagementSummary = {
  // `configured` = Web Push configuré (rétro-compat de l'ancien résumé).
  configured: boolean;
  smsConfigured: boolean;
  birthday: number;
  almostThere: number;
  inactive: number;
  smsSent: number;
  expiredCleaned: number;
};

// Cron quotidien : envoie les push d'anniversaire (jour J), "plus qu'1 tampon",
// et la relance des clients inactifs (push + SMS). Idempotent via notification_log.
// No-op propre si NI Web Push NI SMS ne sont configurés.
export async function runReengagement(
  now: Date = new Date(),
): Promise<ReengagementSummary> {
  const pushConfigured = Boolean(getServerVapid());
  const smsConfigured = isSmsConfigured();

  const summary: ReengagementSummary = {
    configured: pushConfigured,
    smsConfigured,
    birthday: 0,
    almostThere: 0,
    inactive: 0,
    smsSent: 0,
    expiredCleaned: 0,
  };
  if (!pushConfigured && !smsConfigured) return summary;

  const supabase = createAdminClient();
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  const expiredIds: string[] = [];

  async function activeCardId(customerId: string): Promise<string | null> {
    const { data } = await supabase
      .from("loyalty_cards")
      .select("id")
      .eq("customer_id", customerId)
      .eq("status", "active")
      .maybeSingle();
    return data?.id ?? null;
  }

  // Envoi push à un client + journalisation idempotente. No-op si push absent.
  async function notify(
    customerId: string,
    businessId: string,
    kind: "birthday" | "almost_there",
    payload: PushPayload,
  ): Promise<boolean> {
    if (!pushConfigured) return false;
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth_key")
      .eq("customer_id", customerId);

    const list: StoredSubscription[] = subs ?? [];
    if (list.length === 0) return false;

    const result = await sendPushBatch(list, payload);
    if (result.expired.length) expiredIds.push(...result.expired);
    if (result.delivered === 0) return false;

    await supabase
      .from("notification_log")
      .insert({ customer_id: customerId, business_id: businessId, kind });
    return true;
  }

  // ─── Anniversaire (jour J ; le cadeau reste réclamable toute la semaine) ───
  if (pushConfigured) {
    const month = now.getUTCMonth() + 1;
    const day = now.getUTCDate();
    const yearStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1)).toISOString();

    const { data: birthdayCustomers } = await supabase
      .from("customers")
      .select("id, business_id, businesses!inner(name, birthday_reward_enabled)")
      .eq("birth_month", month)
      .eq("birth_day", day)
      .eq("businesses.birthday_reward_enabled", true);

    for (const cust of birthdayCustomers ?? []) {
      const business = unwrap(cust.businesses);
      if (!business) continue;

      const { data: logged } = await supabase
        .from("notification_log")
        .select("id")
        .eq("customer_id", cust.id)
        .eq("kind", "birthday")
        .gte("created_at", yearStart)
        .limit(1);
      if (logged && logged.length) continue;

      const cardId = await activeCardId(cust.id);
      if (!cardId) continue;

      const sent = await notify(cust.id, cust.business_id, "birthday", {
        title: "🎂 Joyeux anniversaire !",
        body: `${business.name} vous offre une récompense. Ouvrez votre carte pour la récupérer.`,
        url: `${appUrl}/card/${cardId}`,
        tag: `birthday-${now.getUTCFullYear()}`,
      });
      if (sent) summary.birthday += 1;
    }
  }

  // ─── "Plus qu'1 tampon" (current_stamps == stamps_required - 1) ───
  if (pushConfigured) {
    const cooldownSince = new Date(
      now.getTime() - ALMOST_THERE_COOLDOWN_DAYS * 86_400_000,
    ).toISOString();

    const { data: cards } = await supabase
      .from("loyalty_cards")
      .select(
        "id, current_stamps, customer_id, business_id, businesses!inner(name, stamps_required)",
      )
      .eq("status", "active")
      .gt("current_stamps", 0)
      .limit(ALMOST_THERE_SCAN_LIMIT);

    for (const card of cards ?? []) {
      const business = unwrap(card.businesses);
      if (!business) continue;
      if (card.current_stamps !== business.stamps_required - 1) continue;

      const { data: recent } = await supabase
        .from("notification_log")
        .select("id")
        .eq("customer_id", card.customer_id)
        .eq("kind", "almost_there")
        .gte("created_at", cooldownSince)
        .limit(1);
      if (recent && recent.length) continue;

      const sent = await notify(card.customer_id, card.business_id, "almost_there", {
        title: "Plus qu'un tampon ! 🎯",
        body: `Encore 1 passage chez ${business.name} et votre récompense est à vous.`,
        url: `${appUrl}/card/${card.id}`,
        tag: `almost-${card.id}`,
      });
      if (sent) summary.almostThere += 1;
    }
  }

  // ─── Relance des clients inactifs (push + SMS) ───
  // Pour chaque commerce ayant activé la relance, on cible les cartes actives
  // dont le client consent au marketing et qui n'ont aucune activité depuis N
  // jours (proxy : loyalty_cards.updated_at, touché à chaque tampon/récompense).
  await runInactiveReengagement();

  // ─── Nettoyage des souscriptions expirées (404/410) ───
  if (expiredIds.length) {
    await supabase.from("push_subscriptions").delete().in("id", expiredIds);
    summary.expiredCleaned = expiredIds.length;
  }

  return summary;

  // ───────────────────────────────────────────────
  async function runInactiveReengagement() {
    const { data: businesses } = await supabase
      .from("businesses")
      .select(
        "id, name, reengage_inactive_enabled, reengage_inactive_days, reengage_offer_label, sms_sender",
      )
      .eq("reengage_inactive_enabled", true)
      .eq("is_active", true);

    const inactiveCooldownSince = new Date(
      now.getTime() - INACTIVE_COOLDOWN_DAYS * 86_400_000,
    ).toISOString();

    for (const biz of businesses ?? []) {
      const days = biz.reengage_inactive_days ?? 45;
      const cutoff = new Date(now.getTime() - days * 86_400_000).toISOString();

      // Cartes inactives du commerce, client consentant au marketing.
      const { data: cards } = await supabase
        .from("loyalty_cards")
        .select("id, customer_id, customers!inner(phone, consent_marketing)")
        .eq("business_id", biz.id)
        .eq("status", "active")
        .eq("customers.consent_marketing", true)
        .lt("updated_at", cutoff)
        .limit(INACTIVE_SCAN_LIMIT);

      if (!cards || cards.length === 0) continue;

      const offer = biz.reengage_offer_label?.trim();
      const pushTitle = `${biz.name}, vous nous manquez ! 👋`;
      const pushBody = offer
        ? `${offer} — c'est le moment de revenir.`
        : `Ça fait un moment ! Revenez profiter de vos avantages fidélité.`;
      const smsContent = offer
        ? `${biz.name} : ${offer}. On vous attend ! Votre carte : ${appUrl}/card/`
        : `${biz.name} : ça fait un moment, revenez profiter de votre fidélité ! Votre carte : ${appUrl}/card/`;

      const smsRecipients: SmsRecipient[] = [];

      for (const card of cards) {
        const customer = unwrap(card.customers);
        if (!customer) continue;

        // Idempotence : pas relancé dans les 30 derniers jours.
        const { data: recent } = await supabase
          .from("notification_log")
          .select("id")
          .eq("customer_id", card.customer_id)
          .eq("kind", "inactive")
          .gte("created_at", inactiveCooldownSince)
          .limit(1);
        if (recent && recent.length) continue;

        let reached = false;

        // Push (si configuré et le client a un abonnement).
        if (pushConfigured) {
          const { data: subs } = await supabase
            .from("push_subscriptions")
            .select("id, endpoint, p256dh, auth_key")
            .eq("customer_id", card.customer_id);
          if (subs && subs.length > 0) {
            const result = await sendPushBatch(subs, {
              title: pushTitle,
              body: pushBody,
              url: `${appUrl}/card/${card.id}`,
              tag: `inactive-${card.id}`,
            });
            if (result.expired.length) expiredIds.push(...result.expired);
            if (result.delivered > 0) reached = true;
          }
        }

        // SMS (si configuré et le client a un téléphone).
        if (smsConfigured && customer.phone) {
          smsRecipients.push({ id: card.customer_id, phone: customer.phone });
          reached = true;
        }

        // Journalise dès qu'au moins un canal a porté la relance (anti-spam).
        if (reached) {
          await supabase.from("notification_log").insert({
            customer_id: card.customer_id,
            business_id: biz.id,
            kind: "inactive",
          });
          summary.inactive += 1;
        }
      }

      // Envoi groupé des SMS du commerce (un seul appel batch).
      if (smsRecipients.length > 0) {
        const result = await sendSmsBatch(smsRecipients, smsContent, biz.sms_sender);
        summary.smsSent += result.delivered;
      }
    }
  }
}
