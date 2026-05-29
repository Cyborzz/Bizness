import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type AdminProfile = Tables<"admin_users">;
export type CurrentAdmin = {
  user: User;
  profile: AdminProfile;
};

export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("admin_users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return null;

  return { user, profile: profile as AdminProfile };
}

export async function requireAdmin(): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}

export async function getUserRole() {
  const admin = await getCurrentAdmin();
  return admin?.profile.role ?? null;
}

export async function getUserBusinessId() {
  const admin = await getCurrentAdmin();
  return admin?.profile.business_id ?? null;
}
