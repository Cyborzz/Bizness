"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/queries";
import { canAccessBusiness } from "@/lib/permissions";
import { businessSchema } from "@/lib/validators/business";
import { generateSlug } from "@/lib/utils/format";

type BusinessActionState = {
  error?: string;
};

const MAX_LOGO_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_LOGO_MIMES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
]);
const ALLOWED_LOGO_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp", "svg"]);

async function uploadLogo(file: File | null, businessSlug: string) {
  if (!file || file.size === 0) return null;
  if (!ALLOWED_LOGO_MIMES.has(file.type)) {
    throw new Error("Format non supporté. Utilisez PNG, JPG, WEBP ou SVG.");
  }
  if (file.size > MAX_LOGO_BYTES) {
    throw new Error("Logo trop volumineux. 2 Mo maximum.");
  }

  const supabase = createAdminClient();
  const rawExtension = (file.name.split(".").pop() ?? "png").toLowerCase();
  const extension = ALLOWED_LOGO_EXTENSIONS.has(rawExtension) ? rawExtension : "png";
  const path = `${businessSlug}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("business-logos").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    throw new Error("Upload du logo impossible. Réessayez ou changez de fichier.");
  }

  const { data } = supabase.storage.from("business-logos").getPublicUrl(path);
  return data.publicUrl;
}

export async function saveBusinessAction(_: BusinessActionState, formData: FormData): Promise<BusinessActionState> {
  const { profile } = await requireAdmin();
  const businessId = formData.get("business_id")?.toString() || null;
  let redirectTo: string | null = null;

  if (businessId && !canAccessBusiness(profile, businessId)) {
    return { error: "Accès refusé." };
  }

  if (!businessId && profile.role !== "super_admin") {
    return { error: "Seul un super admin peut créer un commerce." };
  }

  if (businessId && profile.role === "staff") {
    return {
      error:
        "Les paramètres du commerce ne peuvent être modifiés que par l'owner ou le super admin.",
    };
  }

  const name = formData.get("name")?.toString() ?? "";
  const slugInput = formData.get("slug")?.toString() || generateSlug(name);

  const parsed = businessSchema.safeParse({
    name,
    slug: slugInput,
    primary_color: formData.get("primary_color") || "#2454ff",
    secondary_color: formData.get("secondary_color") || "#7c3aed",
    card_style: formData.get("card_style") || "gradient",
    welcome_message: formData.get("welcome_message"),
    address: formData.get("address"),
    latitude: formData.get("latitude")?.toString() || undefined,
    longitude: formData.get("longitude")?.toString() || undefined,
    phone: formData.get("phone"),
    email: formData.get("email"),
    business_type: formData.get("business_type"),
    loyalty_type: formData.get("loyalty_type") || "stamps",
    stamps_required: formData.get("stamps_required") || 10,
    points_required: formData.get("points_required") || 100,
    stamp_cooldown_minutes: formData.get("stamp_cooldown_minutes") || 0,
    birthday_reward_enabled: formData.get("birthday_reward_enabled") === "on",
    reward_label: formData.get("reward_label") || "1 récompense offerte",
    is_active: formData.get("is_active") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const supabase = createAdminClient();

  try {
    const logo = formData.get("logo");
    const logoUrl = await uploadLogo(logo instanceof File ? logo : null, parsed.data.slug);

    const payload = {
      ...parsed.data,
      ...(logoUrl ? { logo_url: logoUrl } : {}),
    };

    if (businessId) {
      const { error } = await supabase.from("businesses").update(payload).eq("id", businessId);
      if (error) return { error: "Impossible de modifier le commerce." };
      redirectTo = `/admin/businesses/${businessId}?success=business-updated`;
    } else {
      const { data, error } = await supabase.from("businesses").insert(payload).select("id").single();
      if (error || !data) return { error: "Impossible de créer le commerce. Vérifie le slug." };
      revalidatePath("/admin/businesses");
      redirectTo = `/admin/businesses/${data.id}?success=business-created`;
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erreur inattendue." };
  }

  revalidatePath("/admin/businesses");
  revalidatePath(`/admin/businesses/${businessId}`);
  redirect(redirectTo ?? "/admin/businesses");
}

export async function deleteBusinessAction(formData: FormData) {
  const { profile } = await requireAdmin();
  if (profile.role !== "super_admin") {
    redirect("/admin/businesses?error=access-denied");
  }

  const businessId = formData.get("businessId")?.toString();
  const isUuid =
    businessId &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      businessId,
    );
  if (!isUuid) {
    redirect("/admin/businesses?error=invalid-business");
  }

  const supabase = createAdminClient();
  const { data: business } = await supabase
    .from("businesses")
    .select("id,slug")
    .eq("id", businessId)
    .maybeSingle();

  if (!business) {
    redirect("/admin/businesses?error=invalid-business");
  }

  await supabase
    .from("admin_users")
    .delete()
    .eq("business_id", business.id)
    .neq("role", "super_admin");

  const { error } = await supabase.from("businesses").delete().eq("id", business.id);
  if (error) {
    redirect(`/admin/businesses/${business.id}?error=business-delete-failed`);
  }

  const { data: logoObjects } = await supabase.storage.from("business-logos").list(business.slug);
  if (logoObjects?.length) {
    await supabase.storage
      .from("business-logos")
      .remove(logoObjects.map((object) => `${business.slug}/${object.name}`));
  }

  revalidatePath("/admin/businesses");
  revalidatePath("/admin/dashboard");
  redirect("/admin/businesses?success=business-deleted");
}
