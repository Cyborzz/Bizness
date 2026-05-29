"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { customerSignupSchema } from "@/lib/validators/customer";

export type SignupState = {
  error?: string;
  cardId?: string;
};

export async function createCustomerCardAction(
  _: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const parsed = customerSignupSchema.safeParse({
    business_slug: formData.get("business_slug"),
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    consent_loyalty: formData.get("consent_loyalty") === "on",
    consent_marketing: formData.get("consent_marketing") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const supabase = createAdminClient();
  const { business_slug, ...customerInput } = parsed.data;

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
