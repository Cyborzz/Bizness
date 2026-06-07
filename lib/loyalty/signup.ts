import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { normalizePhone } from "@/lib/utils/format";
import { notifyWalletPassUpdate } from "@/lib/wallet/notify";

type SupabaseAdmin = ReturnType<typeof createAdminClient>;

// Applique un parrainage : +1 récompense pour le parrain ET le filleul.
// Best-effort (ne lève jamais) et « fail-closed » : la table `referrals` sert de
// garde (dédoublonnage + FK). Si la migration n'est pas appliquée, l'insert
// échoue et aucune récompense n'est accordée — l'inscription reste intacte.
export async function applyReferral(
  supabase: SupabaseAdmin,
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

export type CreateCardInput = {
  businessId: string;
  first_name: string;
  last_name?: string | null;
  phone?: string | null;
  email?: string | null;
  birthdate?: string | null;
  consent_loyalty?: boolean;
  consent_marketing?: boolean;
  // Carte du parrain (lien ?ref=…), best-effort.
  ref?: string | null;
};

export type CreateCardResult = { cardId?: string; error?: string };

// Crée — ou retrouve — la carte fidélité active d'un client pour un commerce.
// Source de vérité partagée par l'inscription formulaire et la connexion Google.
// Le téléphone est canonicalisé pour la déduplication et la recherche.
export async function getOrCreateCard(
  input: CreateCardInput,
): Promise<CreateCardResult> {
  const supabase = createAdminClient();

  const phone = normalizePhone(input.phone ?? null);
  const email = input.email?.trim() || null;
  if (!phone && !email) {
    return { error: "Téléphone ou email obligatoire." };
  }

  // Déduplication : une carte active existe-t-elle déjà pour ce contact ?
  let existingQuery = supabase
    .from("customers")
    .select("id, loyalty_cards(id,status)")
    .eq("business_id", input.businessId)
    .limit(1);

  if (phone) {
    existingQuery = existingQuery.eq("phone", phone);
  } else if (email) {
    existingQuery = existingQuery.ilike("email", email.replace(/[%_\\]/g, "\\$&"));
  }

  const { data: existing } = await existingQuery.maybeSingle();
  const existingCard = existing?.loyalty_cards?.find(
    (card) => card.status === "active",
  );
  if (existingCard) {
    return { cardId: existingCard.id };
  }

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .insert({
      business_id: input.businessId,
      first_name: input.first_name,
      last_name: input.last_name ?? null,
      phone,
      email,
      birthdate: input.birthdate ?? null,
      consent_loyalty: input.consent_loyalty ?? true,
      consent_marketing: input.consent_marketing ?? false,
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
    .insert({ business_id: input.businessId, customer_id: customer.id })
    .select("id")
    .single();

  if (cardError || !card) {
    return { error: "Impossible de créer la carte fidélité." };
  }

  await supabase.from("transactions").insert({
    business_id: input.businessId,
    customer_id: customer.id,
    card_id: card.id,
    type: "card_created",
    value: 0,
    note: "Carte créée depuis le QR code",
  });

  if (input.ref?.trim()) {
    await applyReferral(supabase, input.businessId, input.ref.trim(), card.id, customer.id);
  }

  return { cardId: card.id };
}
