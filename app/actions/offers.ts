"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/queries";
import { canAccessBusiness } from "@/lib/permissions";
import { sendPushBatch } from "@/lib/push/send";
import { isSmsConfigured } from "@/lib/sms/env";
import { sendSmsBatch, type SmsRecipient } from "@/lib/sms/send";
import { isEmailConfigured } from "@/lib/email/env";
import { sendEmailBatch, type EmailRecipient } from "@/lib/email/send";
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

  const wantsSms = formData.get("sms") === "on";
  const wantsEmail = formData.get("email") === "on";

  const { data: offer } = await supabase
    .from("offers")
    .select("*, businesses(name, sms_sender)")
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

  // Diffusion SMS optionnelle aux clients consentant au marketing (avec tel).
  let smsCount = 0;
  if (wantsSms && isSmsConfigured()) {
    const { data: customers } = await supabase
      .from("customers")
      .select("id, phone")
      .eq("business_id", offer.business_id)
      .eq("consent_marketing", true)
      .not("phone", "is", null);

    const recipients: SmsRecipient[] = (customers ?? [])
      .filter((c): c is { id: string; phone: string } => Boolean(c.phone))
      .map((c) => ({ id: c.id, phone: c.phone }));

    if (recipients.length > 0) {
      const content = `${offer.title} : ${offer.body}`.slice(0, 300);
      const sender = offer.businesses?.sms_sender ?? null;
      const smsResult = await sendSmsBatch(recipients, content, sender);
      smsCount = smsResult.delivered;
    }
  }

  // Diffusion email optionnelle aux clients consentant au marketing (avec email).
  let emailCount = 0;
  if (wantsEmail && isEmailConfigured()) {
    const { data: customers } = await supabase
      .from("customers")
      .select("id, email")
      .eq("business_id", offer.business_id)
      .eq("consent_marketing", true)
      .not("email", "is", null);

    const recipients: EmailRecipient[] = (customers ?? [])
      .filter((c): c is { id: string; email: string } => Boolean(c.email))
      .map((c) => ({ id: c.id, email: c.email }));

    if (recipients.length > 0) {
      const html = offerEmailHtml({
        title: offer.title,
        body: offer.body,
        ctaUrl: offer.cta_url ?? null,
        imageUrl: offer.image_url ?? null,
      });
      const emailResult = await sendEmailBatch(recipients, {
        subject: offer.title,
        html,
      });
      emailCount = emailResult.delivered;
    }
  }

  await supabase
    .from("offers")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
      recipient_count: recipientCount + smsCount + emailCount,
    })
    .eq("id", offer.id);

  revalidatePath("/admin/offers");
  redirect(
    `/admin/offers?success=offer-sent&count=${recipientCount}&sms=${smsCount}&email=${emailCount}`,
  );
}

// Gabarit HTML d'une offre envoyée par email.
function offerEmailHtml(args: {
  title: string;
  body: string;
  ctaUrl: string | null;
  imageUrl: string | null;
}): string {
  const { title, body, ctaUrl, imageUrl } = args;
  const image = imageUrl
    ? `<img src="${imageUrl}" alt="" style="width:100%;border-radius:12px;margin-bottom:16px;" />`
    : "";
  const cta = ctaUrl
    ? `<a href="${ctaUrl}" style="display:inline-block;background:#111827;color:#fff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:999px;margin-top:8px;">En profiter</a>`
    : "";
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#eef2f7;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
  <div style="max-width:480px;margin:0 auto;padding:24px;">
    <div style="background:#fff;border-radius:16px;padding:28px;text-align:center;">
      ${image}
      <h1 style="font-size:20px;margin:0 0 12px;">${title}</h1>
      <p style="font-size:15px;line-height:1.5;margin:0 0 8px;">${body}</p>
      ${cta}
    </div>
  </div></body></html>`;
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
