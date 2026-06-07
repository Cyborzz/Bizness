"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/queries";
import { canAccessBusiness } from "@/lib/permissions";
import { generateApiKey } from "@/lib/pos/keys";
import { createAdminClient } from "@/lib/supabase/admin";
import { posKeyLabelSchema } from "@/lib/validators/pos";

export type CreateKeyState = {
  error?: string;
  // Clé complète renvoyée UNE seule fois (jamais re-consultable ensuite).
  fullKey?: string;
  label?: string;
};

export async function createPosKeyAction(
  _: CreateKeyState,
  formData: FormData,
): Promise<CreateKeyState> {
  const { user, profile } = await requireAdmin();

  const businessId = formData.get("business_id")?.toString() ?? "";
  const parsedLabel = posKeyLabelSchema.safeParse(formData.get("label"));
  if (!parsedLabel.success) {
    return { error: parsedLabel.error.issues[0]?.message ?? "Nom invalide." };
  }
  if (!businessId || !canAccessBusiness(profile, businessId)) {
    return { error: "Accès refusé." };
  }
  if (profile.role === "staff") {
    return { error: "Seul l'owner ou le super admin peut créer une clé." };
  }

  const { fullKey, prefix, hash } = generateApiKey();
  const supabase = createAdminClient();
  const { error } = await supabase.from("pos_api_keys").insert({
    business_id: businessId,
    label: parsedLabel.data,
    key_prefix: prefix,
    key_hash: hash,
    created_by: user.id,
  });

  if (error) {
    return { error: "Impossible de créer la clé." };
  }

  revalidatePath("/admin/integrations");
  return { fullKey, label: parsedLabel.data };
}

export async function revokePosKeyAction(formData: FormData) {
  const keyId = formData.get("keyId")?.toString();
  if (!keyId) redirect("/admin/integrations?error=invalid-key");

  const { profile } = await requireAdmin();
  const supabase = createAdminClient();

  const { data: key } = await supabase
    .from("pos_api_keys")
    .select("id, business_id")
    .eq("id", keyId)
    .maybeSingle();

  if (!key || !canAccessBusiness(profile, key.business_id)) {
    redirect("/admin/integrations?error=access-denied");
  }
  if (profile.role === "staff") {
    redirect("/admin/integrations?error=access-denied");
  }

  await supabase
    .from("pos_api_keys")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", keyId);

  revalidatePath("/admin/integrations");
  redirect("/admin/integrations?success=key-revoked");
}
