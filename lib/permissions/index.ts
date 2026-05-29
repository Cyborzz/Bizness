import { notFound } from "next/navigation";
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

export function getBusinessFilter(profile: AdminProfile) {
  return profile.role === "super_admin" ? null : profile.business_id;
}
