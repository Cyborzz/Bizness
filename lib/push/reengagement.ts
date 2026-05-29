import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getServerVapid } from "./env";
import { sendPushBatch, type PushPayload, type StoredSubscription } from "./send";

// Anti-spam : on ne relance "plus qu'1 tampon" qu'une fois toutes les 2 semaines.
const ALMOST_THERE_COOLDOWN_DAYS = 14;
// Garde-fou de volume sur le scan des cartes (cf. note d'échelle).
const ALMOST_THERE_SCAN_LIMIT = 2000;

function unwrap<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export type ReengagementSummary = {
  configured: boolean;
  birthday: number;
  almostThere: number;
  expiredCleaned: number;
};

// Cron quotidien : envoie les push d'anniversaire (jour J) et "plus qu'1 tampon".
// Idempotent via notification_log. No-op propre si VAPID n'est pas configuré.
export async function runReengagement(
  now: Date = new Date(),
): Promise<ReengagementSummary> {
  const summary: ReengagementSummary = {
    configured: Boolean(getServerVapid()),
    birthday: 0,
    almostThere: 0,
    expiredCleaned: 0,
  };
  if (!summary.configured) return summary;

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

  async function notify(
    customerId: string,
    businessId: string,
    kind: "birthday" | "almost_there",
    payload: PushPayload,
  ): Promise<boolean> {
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

  // ─── "Plus qu'1 tampon" (current_stamps == stamps_required - 1) ───
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

  // ─── Nettoyage des souscriptions expirées (404/410) ───
  if (expiredIds.length) {
    await supabase.from("push_subscriptions").delete().in("id", expiredIds);
    summary.expiredCleaned = expiredIds.length;
  }

  return summary;
}
