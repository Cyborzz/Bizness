"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { allowAction } from "@/lib/security/rate-limit";
import { normalizePhone } from "@/lib/utils/format";
import {
  BIRTHDAY_NOTE,
  isBirthdayDue,
  startOfYearISO,
} from "@/lib/loyalty/milestones";
import {
  customerLookupSchema,
  customerSignupSchema,
  passageSchema,
} from "@/lib/validators/customer";
import { notifyWalletPassUpdate } from "@/lib/wallet/notify";

export type SignupState = {
  error?: string;
  cardId?: string;
};

// Applique un parrainage : +1 récompense pour le parrain ET le filleul.
// Best-effort (ne lève jamais) et « fail-closed » : la table `referrals` sert de
// garde (dédoublonnage + FK). Si la migration n'est pas appliquée, l'insert
// échoue et aucune récompense n'est accordée — l'inscription reste intacte.
async function applyReferral(
  supabase: ReturnType<typeof createAdminClient>,
  businessId: string,
  referrerCardId: string,
  referredCardId: string,
  referredCustomerId: string,
) {
  try {
    if (!referrerCardId || referrerCardId === referredCardId) return;

    const { data: referrer } = await supabase
      .from("loyalty_cards")
      .select("id,business_id,status,customer_id,rewards_available")
      .eq("id", referrerCardId)
      .maybeSingle();
    if (
      !referrer ||
      referrer.status !== "active" ||
      referrer.business_id !== businessId
    ) {
      return;
    }

    // Garde-fou : enregistre le parrainage AVANT de créditer. unique(referred_card_id)
    // + FK empêchent doublon / carte invalide. Échec => on n'accorde rien.
    const { error: refErr } = await supabase.from("referrals").insert({
      business_id: businessId,
      referrer_card_id: referrer.id,
      referred_card_id: referredCardId,
    });
    if (refErr) return;

    await supabase
      .from("loyalty_cards")
      .update({ rewards_available: referrer.rewards_available + 1 })
      .eq("id", referrer.id);
    await supabase
      .from("loyalty_cards")
      .update({ rewards_available: 1 })
      .eq("id", referredCardId);

    await supabase.from("transactions").insert([
      {
        business_id: businessId,
        customer_id: referrer.customer_id,
        card_id: referrer.id,
        type: "reward_earned",
        value: 1,
        note: "Parrainage : un ami a rejoint",
      },
      {
        business_id: businessId,
        customer_id: referredCustomerId,
        card_id: referredCardId,
        type: "reward_earned",
        value: 1,
        note: "Parrainage : récompense de bienvenue",
      },
    ]);

    await notifyWalletPassUpdate(referrer.id);
    await notifyWalletPassUpdate(referredCardId);
  } catch (err) {
    console.error("[referral]", err);
  }
}

export type LookupState = {
  error?: string;
  cardId?: string;
};

export async function createCustomerCardAction(
  _: SignupState,
  formData: FormData,
): Promise<SignupState> {
  if (!(await allowAction("signup", 5, 600))) {
    return {
      error: "Trop de tentatives. Patientez quelques minutes avant de réessayer.",
    };
  }

  const parsed = customerSignupSchema.safeParse({
    business_slug: formData.get("business_slug"),
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    birthdate: formData.get("birthdate"),
    consent_loyalty: formData.get("consent_loyalty") === "on",
    consent_marketing: formData.get("consent_marketing") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const supabase = createAdminClient();
  const { business_slug, ...customerInput } = parsed.data;
  // Canonicalise le téléphone pour la déduplication et la recherche ultérieure.
  customerInput.phone = normalizePhone(customerInput.phone);

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id,is_active")
    .eq("slug", business_slug)
    .maybeSingle();

  if (businessError || !business || !business.is_active) {
    return { error: "Commerce introuvable ou inactif." };
  }

  let existingQuery = supabase
    .from("customers")
    .select("id, loyalty_cards(id,status)")
    .eq("business_id", business.id)
    .limit(1);

  if (customerInput.phone) {
    existingQuery = existingQuery.eq("phone", customerInput.phone);
  } else if (customerInput.email) {
    existingQuery = existingQuery.eq("email", customerInput.email);
  }

  const { data: existing } = await existingQuery.maybeSingle();
  const existingCard = existing?.loyalty_cards?.find((card) => card.status === "active");

  if (existingCard) {
    return { cardId: existingCard.id };
  }

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .insert({
      ...customerInput,
      business_id: business.id,
    })
    .select("id")
    .single();

  if (customerError || !customer) {
    if (customerError?.code === "23505") {
      return {
        error: "Un compte existe déjà avec ce téléphone ou cet email pour ce commerce.",
      };
    }
    return { error: "Impossible de créer le client." };
  }

  const { data: card, error: cardError } = await supabase
    .from("loyalty_cards")
    .insert({
      business_id: business.id,
      customer_id: customer.id,
    })
    .select("id")
    .single();

  if (cardError || !card) {
    return { error: "Impossible de créer la carte fidélité." };
  }

  await supabase.from("transactions").insert({
    business_id: business.id,
    customer_id: customer.id,
    card_id: card.id,
    type: "card_created",
    value: 0,
    note: "Carte créée depuis le QR code",
  });

  // Parrainage (si lien ?ref=<carte du parrain>). Best-effort.
  const ref = formData.get("ref");
  if (typeof ref === "string" && ref.trim()) {
    await applyReferral(supabase, business.id, ref.trim(), card.id, customer.id);
  }

  return { cardId: card.id };
}

export async function findCustomerCardAction(
  _: LookupState,
  formData: FormData,
): Promise<LookupState> {
  if (!(await allowAction("lookup", 10, 600))) {
    return {
      error: "Trop de recherches. Patientez quelques minutes avant de réessayer.",
    };
  }

  const parsed = customerLookupSchema.safeParse({
    business_slug: formData.get("business_slug"),
    contact: formData.get("contact"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const supabase = createAdminClient();
  const { contact, business_slug } = parsed.data;

  const { data: business } = await supabase
    .from("businesses")
    .select("id,is_active")
    .eq("slug", business_slug)
    .maybeSingle();

  if (!business || !business.is_active) {
    return { error: "Commerce introuvable ou inactif." };
  }

  let query = supabase
    .from("customers")
    .select("id, loyalty_cards(id,status)")
    .eq("business_id", business.id)
    .limit(1);

  if (contact.includes("@")) {
    // ilike = insensible à la casse ; on échappe les jokers SQL (_ et %).
    query = query.ilike("email", contact.replace(/[%_\\]/g, "\\$&"));
  } else {
    // Même canonicalisation qu'à l'inscription pour que la recherche matche.
    query = query.eq("phone", normalizePhone(contact) ?? contact);
  }

  const { data: existing } = await query.maybeSingle();
  const cardId = existing?.loyalty_cards?.find(
    (card) => card.status === "active",
  )?.id;

  if (!cardId) {
    return {
      error:
        "Aucune carte active trouvée avec ce contact. Vérifiez la saisie ou créez votre carte.",
    };
  }

  return { cardId };
}

export type PassageState = {
  error?: string;
  ok?: boolean;
  cardId?: string;
  businessName?: string;
  current?: number;
  threshold?: number;
  added?: number;
  rewardEarned?: boolean;
  isPoints?: boolean;
};

// Plancher anti-abus pour le self-service (non supervisé) : même si le commerce
// règle un cooldown plus court pour le scan staff, on impose au moins ce délai
// entre deux validations en libre-service.
const SELF_PASSAGE_MIN_COOLDOWN_MIN = 60;

// Validation de passage en self-service via le QR fixe du comptoir.
// Le client s'identifie (téléphone/email), on crédite +1 tampon (ou le montant
// en points), avec garde-fous : rate-limit IP, cooldown plancher, et la
// transaction est tracée comme « QR comptoir » pour l'historique commerçant.
export async function validatePassageAction(
  _: PassageState,
  formData: FormData,
): Promise<PassageState> {
  if (!(await allowAction("passage", 8, 600))) {
    return { error: "Trop de tentatives. Patientez quelques minutes." };
  }

  const parsed = passageSchema.safeParse({
    business_slug: formData.get("business_slug"),
    contact: formData.get("contact"),
    amount: formData.get("amount"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const supabase = createAdminClient();
  const { business_slug, contact } = parsed.data;

  const { data: business } = await supabase
    .from("businesses")
    .select(
      "id,name,is_active,loyalty_type,stamps_required,points_required,stamp_cooldown_minutes",
    )
    .eq("slug", business_slug)
    .maybeSingle();

  if (!business || !business.is_active) {
    return { error: "Commerce introuvable ou inactif." };
  }

  let query = supabase
    .from("customers")
    .select("id, loyalty_cards(id,status,current_stamps,total_stamps,rewards_available)")
    .eq("business_id", business.id)
    .limit(1);

  if (contact.includes("@")) {
    query = query.ilike("email", contact.replace(/[%_\\]/g, "\\$&"));
  } else {
    query = query.eq("phone", normalizePhone(contact) ?? contact);
  }

  const { data: existing } = await query.maybeSingle();
  const card = existing?.loyalty_cards?.find((c) => c.status === "active");

  if (!existing || !card) {
    return {
      error: "Aucune carte active trouvée avec ce contact. Créez d'abord votre carte.",
    };
  }

  // Cooldown : plancher self-service appliqué.
  const cooldown = Math.max(
    business.stamp_cooldown_minutes ?? 0,
    SELF_PASSAGE_MIN_COOLDOWN_MIN,
  );
  const since = new Date(Date.now() - cooldown * 60_000).toISOString();
  const { data: recent } = await supabase
    .from("transactions")
    .select("id")
    .eq("card_id", card.id)
    .eq("type", "stamp_added")
    .gte("created_at", since)
    .limit(1);
  if (recent && recent.length > 0) {
    return { error: "Passage déjà validé récemment. Réessayez plus tard." };
  }

  const isPoints = business.loyalty_type === "points";
  const threshold = Math.max(
    1,
    isPoints ? business.points_required ?? 100 : business.stamps_required ?? 10,
  );
  const rawAmount = Number(parsed.data.amount);
  const amount = isPoints
    ? Math.min(100_000, Math.max(1, Math.floor(Number.isFinite(rawAmount) ? rawAmount : 1)))
    : 1;

  const totalNow = card.current_stamps + amount;
  const rewardsEarned = Math.floor(totalNow / threshold);
  const current_stamps = totalNow % threshold;
  const rewards_available = card.rewards_available + rewardsEarned;
  const total_stamps = card.total_stamps + amount;

  await supabase
    .from("loyalty_cards")
    .update({ current_stamps, total_stamps, rewards_available })
    .eq("id", card.id);

  await supabase.from("transactions").insert([
    {
      business_id: business.id,
      customer_id: existing.id,
      card_id: card.id,
      type: "stamp_added",
      value: amount,
      note: "Passage validé au comptoir (QR)",
    },
    ...(rewardsEarned > 0
      ? [
          {
            business_id: business.id,
            customer_id: existing.id,
            card_id: card.id,
            type: "reward_earned" as const,
            value: rewardsEarned,
            note: "Récompense débloquée (QR comptoir)",
          },
        ]
      : []),
  ]);

  await notifyWalletPassUpdate(card.id);

  return {
    ok: true,
    cardId: card.id,
    businessName: business.name,
    current: current_stamps,
    threshold,
    added: amount,
    rewardEarned: rewardsEarned > 0,
    isPoints,
  };
}

export type BirthdayState = {
  ok?: boolean;
  error?: string;
};

// Réclame le cadeau d'anniversaire. Re-vérifie TOUT côté serveur — ne fait
// jamais confiance au client — et reste idempotent (1 cadeau / an / carte).
export async function claimBirthdayRewardAction(
  cardId: string,
): Promise<BirthdayState> {
  if (typeof cardId !== "string" || !cardId) {
    return { error: "Carte invalide." };
  }

  const supabase = createAdminClient();
  const { data: card } = await supabase
    .from("loyalty_cards")
    .select(
      "*, businesses(birthday_reward_enabled), customers(birthdate)",
    )
    .eq("id", cardId)
    .maybeSingle();

  if (!card || card.status !== "active") {
    return { error: "Carte introuvable ou inactive." };
  }
  if (!card.businesses?.birthday_reward_enabled) {
    return { error: "Cadeau d'anniversaire non proposé par ce commerce." };
  }
  if (!isBirthdayDue(card.customers?.birthdate)) {
    return { error: "Ce n'est pas votre semaine d'anniversaire." };
  }

  // Idempotence : déjà attribué cette année ?
  const { data: already } = await supabase
    .from("transactions")
    .select("id")
    .eq("card_id", card.id)
    .eq("note", BIRTHDAY_NOTE)
    .gte("created_at", startOfYearISO())
    .limit(1);

  if (already && already.length > 0) {
    return { ok: true };
  }

  await supabase
    .from("loyalty_cards")
    .update({ rewards_available: card.rewards_available + 1 })
    .eq("id", card.id);

  await supabase.from("transactions").insert({
    business_id: card.business_id,
    customer_id: card.customer_id,
    card_id: card.id,
    type: "reward_earned",
    value: 1,
    note: BIRTHDAY_NOTE,
  });

  revalidatePath(`/card/${card.id}`);
  return { ok: true };
}
