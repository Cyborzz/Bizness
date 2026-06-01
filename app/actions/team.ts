"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/queries";
import { canAccessBusiness } from "@/lib/permissions";
import { createAdminClient } from "@/lib/supabase/admin";

export type InviteState = {
  error?: string;
  success?: string;
  email?: string;
  temporaryPassword?: string;
};

const inviteSchema = z.object({
  email: z.string().trim().email("Email invalide"),
  role: z.enum(["super_admin", "business_owner", "staff"]),
  business_id: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || null)
    .pipe(z.string().uuid("Commerce invalide").nullable()),
});

export async function inviteMemberAction(
  _: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const { profile } = await requireAdmin();

  if (profile.role !== "super_admin" && profile.role !== "business_owner") {
    return { error: "Seul un owner ou super admin peut inviter." };
  }

  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
    business_id: formData.get("business_id"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  if (profile.role === "business_owner") {
    if (parsed.data.role !== "staff") {
      return { error: "Un owner ne peut inviter que du staff." };
    }
    if (parsed.data.business_id && parsed.data.business_id !== profile.business_id) {
      return { error: "Vous ne pouvez inviter que dans votre commerce." };
    }
  }

  const businessId = parsed.data.business_id ?? profile.business_id ?? null;
  if (parsed.data.role !== "super_admin" && !businessId) {
    return { error: "Un commerce est requis pour ce role." };
  }
  if (businessId && !canAccessBusiness(profile, businessId)) {
    return { error: "Acces au commerce refuse." };
  }

  const supabase = createAdminClient();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const roleBusinessId = parsed.data.role === "super_admin" ? null : businessId;

  const { data: inviteResult, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
    parsed.data.email,
    {
      redirectTo: `${baseUrl}/admin/login/reset`,
    },
  );

  if (!inviteError && inviteResult?.user) {
    const profileError = await upsertMemberProfile(
      inviteResult.user.id,
      parsed.data.email,
      parsed.data.role,
      roleBusinessId,
    );

    if (profileError) {
      return { error: "Invitation envoyee mais l'attribution du role a echoue." };
    }

    revalidatePath("/admin/team");
    redirect("/admin/team?success=staff-invited");
  }

  if (inviteError?.message?.toLowerCase().includes("already")) {
    return {
      error: "Cet email existe deja dans Auth. Connectez-vous avec ce compte ou utilisez un autre email.",
    };
  }

  const temporaryPassword = generateTemporaryPassword();
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: parsed.data.email,
    password: temporaryPassword,
    email_confirm: true,
  });
  let userId = created?.user?.id ?? null;

  if (!userId && createError?.message?.toLowerCase().includes("already")) {
    const { data: users } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existing = users.users.find(
      (user) => user.email?.toLowerCase() === parsed.data.email.toLowerCase(),
    );
    if (existing) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(existing.id, {
        password: temporaryPassword,
        email_confirm: true,
      });
      if (!updateError) {
        userId = existing.id;
      }
    }
  }

  if (!userId) {
    return {
      error:
        "Invitation email impossible et creation manuelle impossible. Verifiez la configuration Auth.",
    };
  }

  const profileError = await upsertMemberProfile(
    userId,
    parsed.data.email,
    parsed.data.role,
    roleBusinessId,
  );

  if (profileError) {
    return { error: "Compte cree mais l'attribution du role a echoue." };
  }

  revalidatePath("/admin/team");
  return {
    success: "SMTP non configure : le compte a ete cree avec un mot de passe temporaire.",
    email: parsed.data.email,
    temporaryPassword,
  };
}

function generateTemporaryPassword() {
  return `${crypto.randomUUID().replaceAll("-", "")}${crypto
    .randomUUID()
    .replaceAll("-", "")}`.slice(0, 24);
}

async function upsertMemberProfile(
  id: string,
  email: string,
  role: "super_admin" | "business_owner" | "staff",
  businessId: string | null,
) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("admin_users").upsert(
    {
      id,
      email,
      role,
      business_id: businessId,
    },
    { onConflict: "id" },
  );
  return error;
}

export async function removeMemberAction(formData: FormData) {
  const userId = formData.get("userId")?.toString();
  if (!userId) redirect("/admin/team?error=access-denied");

  const { user, profile } = await requireAdmin();
  if (user.id === userId) redirect("/admin/team?error=access-denied");

  const supabase = createAdminClient();
  const { data: target } = await supabase
    .from("admin_users")
    .select("id,business_id,role")
    .eq("id", userId)
    .maybeSingle();

  if (!target) redirect("/admin/team?error=access-denied");
  if (profile.role !== "super_admin") {
    if (profile.role !== "business_owner") redirect("/admin/team?error=access-denied");
    if (target.business_id !== profile.business_id || target.role !== "staff") {
      redirect("/admin/team?error=access-denied");
    }
  }

  await supabase.from("admin_users").delete().eq("id", userId);
  // The auth user remains in supabase.auth.users; deletion there is a destructive op.
  // We leave the auth account intact to avoid orphaning data unintentionally.
  revalidatePath("/admin/team");
  redirect("/admin/team?success=staff-invited");
}
