import { notFound, redirect } from "next/navigation";
import type { AdminProfile } from "@/lib/auth/queries";

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
  return profile.role === "super_admin" || profile.role === "business_owner";
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
  return profile.role === "super_admin" ? null : profile.business_id;
}
