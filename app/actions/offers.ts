"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/queries";
import { canAccessBusiness } from "@/lib/permissions";
import { sendPushBatch } from "@/lib/push/send";
import { createAdminClient } from "@/lib/supabase/admin";
import { offerSchema } from "@/lib/validators/push";

export type OfferActionState = { error?: string };

export async function createOfferAction(
  _: OfferActionState,
  formData: FormData,
): Promise<OfferActionState> {
  const { user, profile } = await requireAdmin();

  const parsed = offerSchema.safeParse({
    business_id: formData.get("business_id"),
    title: formData.get("title"),
    body: formData.get("body"),
    image_url: formData.get("image_url"),
    cta_url: formData.get("cta_url"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  if (!canAccessBusiness(profile, parsed.data.business_id)) {
    return { error: "Accès refusé." };
  }

  if (profile.role === "staff") {
    return { error: "Seul l'owner ou le super admin peut créer une offre." };
  }

  const supabase = createAdminClient();
  const { data: offer, error } = await supabase
    .from("offers")
    .insert({
      business_id: parsed.data.business_id,
      title: parsed.data.title,
      body: parsed.data.body,
      image_url: parsed.data.image_url,
      cta_url: parsed.data.cta_url,
      status: "draft",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !offer) {
    return { error: "Impossible d'enregistrer l'offre." };
  }

  revalidatePath("/admin/offers");
  redirect(`/admin/offers?success=offer-created&id=${offer.id}`);
}

export async function sendOfferAction(formData: FormData) {
  const offerId = formData.get("offerId")?.toString();
  if (!offerId) redirect("/admin/offers?error=invalid-offer");

  const { profile } = await requireAdmin();
  const supabase = createAdminClient();

  const { data: offer } = await supabase
    .from("offers")
    .select("*, businesses(name)")
    .eq("id", offerId)
    .maybeSingle();

  if (!offer) redirect("/admin/offers?error=invalid-offer");
  if (!canAccessBusiness(profile, offer.business_id)) {
    redirect("/admin/offers?error=access-denied");
  }
  if (profile.role === "staff") {
    redirect("/admin/offers?error=access-denied");
  }
  if (offer.status === "sent") {
    redirect("/admin/offers?error=already-sent");
  }

  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth_key")
    .eq("business_id", offer.business_id);

  let recipientCount = 0;

  if (subs && subs.length > 0) {
    try {
      const result = await sendPushBatch(subs, {
        title: offer.title,
        body: offer.body,
        url: offer.cta_url ?? "/",
        image: offer.image_url ?? undefined,
        tag: `offer-${offer.id}`,
      });
      recipientCount = result.delivered;
      if (result.expired.length > 0) {
        await supabase.from("push_subscriptions").delete().in("id", result.expired);
      }
    } catch {
      redirect("/admin/offers?error=push-not-configured");
    }
  }

  await supabase
    .from("offers")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
      recipient_count: recipientCount,
    })
    .eq("id", offer.id);

  revalidatePath("/admin/offers");
  redirect(`/admin/offers?success=offer-sent&count=${recipientCount}`);
}

export async function deleteOfferAction(formData: FormData) {
  const offerId = formData.get("offerId")?.toString();
  if (!offerId) redirect("/admin/offers?error=invalid-offer");

  const { profile } = await requireAdmin();
  const supabase = createAdminClient();

  const { data: offer } = await supabase
    .from("offers")
    .select("business_id, status")
    .eq("id", offerId)
    .maybeSingle();

  if (!offer || !canAccessBusiness(profile, offer.business_id)) {
    redirect("/admin/offers?error=access-denied");
  }
  if (profile.role === "staff") {
    redirect("/admin/offers?error=access-denied");
  }

  await supabase.from("offers").delete().eq("id", offerId);
  revalidatePath("/admin/offers");
  redirect("/admin/offers?success=offer-deleted");
}
