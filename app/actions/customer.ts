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
} from "@/lib/validators/customer";

export type SignupState = {
  error?: string;
  cardId?: string;
};

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
