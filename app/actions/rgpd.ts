"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/queries";
import { canAccessBusiness } from "@/lib/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { postgresUuid } from "@/lib/validators/uuid";

export type DeletionRequestState = { error?: string; ok?: boolean };

const requestSchema = z.object({
  cardId: postgresUuid("Carte invalide"),
  reason: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((value) => value || null),
});

export async function requestDeletionAction(
  _: DeletionRequestState,
  formData: FormData,
): Promise<DeletionRequestState> {
  const parsed = requestSchema.safeParse({
    cardId: formData.get("cardId"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const supabase = createAdminClient();
  const { data: card } = await supabase
    .from("loyalty_cards")
    .select("id, customer_id, business_id")
    .eq("id", parsed.data.cardId)
    .maybeSingle();

  if (!card) {
    return { error: "Carte introuvable." };
  }

  await supabase.from("deletion_requests").insert({
    customer_id: card.customer_id,
    business_id: card.business_id,
    reason: parsed.data.reason,
  });

  return { ok: true };
}

export async function processDeletionAction(formData: FormData) {
  const requestId = formData.get("requestId")?.toString();
  if (!requestId) redirect("/admin/customers?error=access-denied");

  const { profile } = await requireAdmin();
  if (profile.role !== "super_admin" && profile.role !== "business_owner") {
    redirect("/admin/customers?error=access-denied");
  }

  const supabase = createAdminClient();
  const { data: request } = await supabase
    .from("deletion_requests")
    .select("*")
    .eq("id", requestId)
    .maybeSingle();

  if (!request || !canAccessBusiness(profile, request.business_id)) {
    redirect("/admin/customers?error=access-denied");
  }
  if (request.status === "processed") {
    redirect("/admin/customers?error=access-denied");
  }

  await supabase.from("customers").delete().eq("id", request.customer_id);
  await supabase
    .from("deletion_requests")
    .update({ status: "processed", processed_at: new Date().toISOString() })
    .eq("id", request.id);

  revalidatePath("/admin/customers");
  redirect("/admin/customers?success=customer-deleted");
}
