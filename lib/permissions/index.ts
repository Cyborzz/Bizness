import { notFound, redirect } from "next/navigation";
import type { AdminProfile } from "@/lib/auth/queries";

const NO_BUSINESS_FILTER = "00000000-0000-0000-0000-000000000000";

export function canAccessBusiness(profile: AdminProfile, businessId: string) {
  if (profile.role === "super_admin") return true;
  return profile.business_id === businessId;
}

export function requireBusinessAccess(profile: AdminProfile, businessId: string) {
  if (!canAccessBusiness(profile, businessId)) {
    notFound();
  }
}

export function isSuperAdmin(profile: AdminProfile) {
  return profile.role === "super_admin";
}

export function canUseFullPortal(profile: AdminProfile) {
  return (
    profile.role === "super_admin" ||
    (profile.role === "business_owner" && Boolean(profile.business_id))
  );
}

export function requireFullPortalAccess(profile: AdminProfile) {
  if (!canUseFullPortal(profile)) {
    redirect("/admin/scan");
  }
}

export function getDefaultAdminPath(profile: AdminProfile) {
  return profile.role === "staff" ? "/admin/scan" : "/admin/dashboard";
}

export function getBusinessFilter(profile: AdminProfile) {
  if (profile.role === "super_admin") return null;
  return profile.business_id ?? NO_BUSINESS_FILTER;
}
