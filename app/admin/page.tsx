import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/queries";
import { getDefaultAdminPath } from "@/lib/permissions";

export default async function AdminIndexPage() {
  const { profile } = await requireAdmin();
  redirect(getDefaultAdminPath(profile));
}
