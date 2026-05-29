"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/queries";
import { canAccessBusiness } from "@/lib/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  cardActionSchema,
  deleteCustomerSchema,
  updateMarketingConsentSchema,
} from "@/lib/validators/loyalty";

async function loadCard(cardId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("loyalty_cards")
    .select(
      "*, businesses(stamps_required,stamp_cooldown_minutes,loyalty_type,points_required), customers(id)",
    )
    .eq("id", cardId)
    .single();

  if (error || !data) return null;
  return data;
}

async function assertCardAccess(cardId: string) {
  const { user, profile } = await requireAdmin();
  const card = await loadCard(cardId);

  if (!card || !canAccessBusiness(profile, card.business_id)) {
    return { user, card: null };
  }

  return { user, card };
}

export async function addStampAction(formData: FormData) {
  const parsed = cardActionSchema.safeParse({ cardId: formData.get("cardId") });
  if (!parsed.success) redirect("/admin/cards?error=invalid-card");

  const { user, card } = await assertCardAccess(parsed.data.cardId);
  if (!card || card.status !== "active") redirect("/admin/cards?error=card-unavailable");

  const supabaseGuard = createAdminClient();
  const cooldownMinutes = card.businesses?.stamp_cooldown_minutes ?? 0;
  if (cooldownMinutes > 0) {
    const since = new Date(Date.now() - cooldownMinutes * 60_000).toISOString();
    const { data: recentStamp } = await supabaseGuard
      .from("transactions")
      .select("id")
      .eq("card_id", card.id)
      .eq("type", "stamp_added")
      .gte("created_at", since)
      .limit(1);
    if (recentStamp && recentStamp.length > 0) {
      redirect("/admin/cards?error=stamp-cooldown");
    }
  }

  // Crédit unifié tampons/points : on ajoute `amount` (1 pour un tampon, le
  // montant saisi pour des points), on débloque autant de récompenses que le
  // seuil est franchi, et on reporte le reste (gère aussi le multi-récompense).
  const isPoints = card.businesses?.loyalty_type === "points";
  const threshold = Math.max(
    1,
    isPoints ? card.businesses?.points_required ?? 100 : card.businesses?.stamps_required ?? 10,
  );
  const rawAmount = Number(formData.get("amount"));
  const amount = isPoints
    ? Math.min(1_000_000, Math.max(1, Math.floor(Number.isFinite(rawAmount) ? rawAmount : 1)))
    : 1;

  const totalNow = card.current_stamps + amount;
  const rewardsEarned = Math.floor(totalNow / threshold);
  const current_stamps = totalNow % threshold;
  const rewards_available = card.rewards_available + rewardsEarned;
  const total_stamps = card.total_stamps + amount;
  const supabase = createAdminClient();

  await supabase
    .from("loyalty_cards")
    .update({ current_stamps, total_stamps, rewards_available })
    .eq("id", card.id);

  await supabase.from("transactions").insert([
    {
      business_id: card.business_id,
      customer_id: card.customer_id,
      card_id: card.id,
      type: "stamp_added",
      value: amount,
      created_by: user.id,
    },
    ...(rewardsEarned > 0
      ? [
          {
            business_id: card.business_id,
            customer_id: card.customer_id,
            card_id: card.id,
            type: "reward_earned" as const,
            value: rewardsEarned,
            note: "Récompense débloquée automatiquement",
            created_by: user.id,
          },
        ]
      : []),
  ]);

  revalidatePath("/admin/cards");
  redirect("/admin/cards?success=stamp-added");
}

export async function removeStampAction(formData: FormData) {
  const parsed = cardActionSchema.safeParse({ cardId: formData.get("cardId") });
  if (!parsed.success) redirect("/admin/cards?error=invalid-card");

  const { user, card } = await assertCardAccess(parsed.data.cardId);
  if (!card || card.status !== "active") redirect("/admin/cards?error=card-unavailable");
  if (card.current_stamps <= 0) redirect("/admin/cards?error=no-stamp");

  const supabase = createAdminClient();
  await supabase
    .from("loyalty_cards")
    .update({ current_stamps: card.current_stamps - 1 })
    .eq("id", card.id);

  await supabase.from("transactions").insert({
    business_id: card.business_id,
    customer_id: card.customer_id,
    card_id: card.id,
    type: "stamp_removed",
    value: -1,
    created_by: user.id,
  });

  revalidatePath("/admin/cards");
  redirect("/admin/cards?success=stamp-removed");
}

export async function redeemRewardAction(formData: FormData) {
  const parsed = cardActionSchema.safeParse({ cardId: formData.get("cardId") });
  if (!parsed.success) redirect("/admin/cards?error=invalid-card");

  const { user, card } = await assertCardAccess(parsed.data.cardId);
  if (!card || card.status !== "active") redirect("/admin/cards?error=card-unavailable");
  if (card.rewards_available <= 0) redirect("/admin/cards?error=no-reward");

  const supabase = createAdminClient();
  await supabase
    .from("loyalty_cards")
    .update({ rewards_available: card.rewards_available - 1 })
    .eq("id", card.id);

  await supabase.from("transactions").insert({
    business_id: card.business_id,
    customer_id: card.customer_id,
    card_id: card.id,
    type: "reward_redeemed",
    value: -1,
    created_by: user.id,
  });

  revalidatePath("/admin/cards");
  redirect("/admin/cards?success=reward-redeemed");
}

export async function deleteCustomerAction(formData: FormData) {
  const parsed = deleteCustomerSchema.safeParse({ customerId: formData.get("customerId") });
  if (!parsed.success) redirect("/admin/customers?error=invalid-customer");

  const { user, profile } = await requireAdmin();
  const supabase = createAdminClient();
  const { data: customer } = await supabase
    .from("customers")
    .select("id,business_id,loyalty_cards(id)")
    .eq("id", parsed.data.customerId)
    .single();

  if (!customer || !canAccessBusiness(profile, customer.business_id)) {
    redirect("/admin/customers?error=access-denied");
  }

  if (profile.role !== "super_admin" && profile.role !== "business_owner") {
    redirect("/admin/customers?error=access-denied");
  }

  const cardId = customer.loyalty_cards?.[0]?.id;
  if (cardId) {
    await supabase.from("transactions").insert({
      business_id: customer.business_id,
      customer_id: customer.id,
      card_id: cardId,
      type: "customer_deleted",
      value: 0,
      created_by: user.id,
    });
  }

  await supabase.from("customers").delete().eq("id", customer.id);
  revalidatePath("/admin/customers");
  redirect("/admin/customers?success=customer-deleted");
}

export async function updateMarketingConsentAction(formData: FormData) {
  const parsed = updateMarketingConsentSchema.safeParse({
    customerId: formData.get("customerId"),
    consent_marketing: formData.get("consent_marketing") === "on",
  });
  if (!parsed.success) redirect("/admin/customers?error=invalid-customer");

  const { profile } = await requireAdmin();
  const supabase = createAdminClient();
  const { data: customer } = await supabase
    .from("customers")
    .select("business_id")
    .eq("id", parsed.data.customerId)
    .single();

  if (!customer || !canAccessBusiness(profile, customer.business_id)) {
    redirect("/admin/customers?error=access-denied");
  }

  await supabase
    .from("customers")
    .update({ consent_marketing: parsed.data.consent_marketing })
    .eq("id", parsed.data.customerId);

  revalidatePath("/admin/customers");
  redirect("/admin/customers?success=consent-updated");
}
