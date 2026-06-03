import { Users } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { InviteMemberForm } from "@/components/admin/InviteMemberForm";
import { TeamMemberList } from "@/components/admin/TeamMemberList";
import { ToastBanner } from "@/components/ui/toast-banner";
import { requireAdmin, type AdminProfile } from "@/lib/auth/queries";
import { getBusinessFilter, requireFullPortalAccess } from "@/lib/permissions";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Équipe",
};

export default async function TeamPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const success = typeof params.success === "string" ? params.success : undefined;
  const error = typeof params.error === "string" ? params.error : undefined;

  const { user, profile } = await requireAdmin();
  requireFullPortalAccess(profile);

  const businessFilter = getBusinessFilter(profile);
  const supabase = createAdminClient();

  let teamQuery = supabase
    .from("admin_users")
    .select("*, businesses(name)")
    .order("created_at", { ascending: false });
  if (businessFilter) teamQuery = teamQuery.eq("business_id", businessFilter);
  const { data: members } = await teamQuery;

  let businessesQuery = supabase.from("businesses").select("id,name").order("name");
  if (businessFilter) businessesQuery = businessesQuery.eq("id", businessFilter);
  const { data: businesses } = await businessesQuery;

  return (
    <AdminShell profile={profile}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark">
            <Users aria-hidden className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-normal text-primary">
              Administration
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-ink">Équipe</h1>
          </div>
        </div>
        <ToastBanner success={success} error={error} />
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <h2 className="text-lg font-black text-ink">Inviter un nouveau membre</h2>
            <p className="mt-1 text-sm text-muted">
              L&apos;invitation est envoyée par email. Le destinataire crée son mot de passe en
              cliquant sur le lien.
            </p>
            <div className="mt-4">
              <InviteMemberForm profile={profile} businesses={businesses ?? []} />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-black text-ink">Membres actuels</h2>
            <TeamMemberList
              members={(members ?? []).map((member) => ({
                ...member,
                role: member.role as AdminProfile["role"],
              }))}
              currentUserId={user.id}
            />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
