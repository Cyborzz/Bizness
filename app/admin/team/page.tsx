import { Users } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { InviteMemberForm } from "@/components/admin/InviteMemberForm";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ToastBanner } from "@/components/ui/toast-banner";
import { requireAdmin, type AdminProfile } from "@/lib/auth/queries";
import { getBusinessFilter } from "@/lib/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { removeMemberAction } from "@/app/actions/team";
import { formatDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Équipe",
};

const roleLabels: Record<AdminProfile["role"], { label: string; tone: BadgeTone }> = {
  super_admin: { label: "Super admin", tone: "violet" },
  business_owner: { label: "Owner", tone: "primary" },
  staff: { label: "Staff", tone: "mint" },
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

  if (profile.role === "staff") {
    return (
      <AdminShell profile={profile}>
        <EmptyState title="Accès réservé">
          La gestion d&apos;équipe est réservée à l&apos;owner ou au super admin.
        </EmptyState>
      </AdminShell>
    );
  }

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
            <div className="mt-4 space-y-3">
              {(members ?? []).map((member) => {
                const role =
                  roleLabels[member.role as AdminProfile["role"]] ?? roleLabels.staff;
                const isSelf = member.id === user.id;
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-black text-ink">{member.email}</p>
                        {isSelf ? <Badge tone="primary">Vous</Badge> : null}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                        <Badge tone={role.tone}>{role.label}</Badge>
                        {member.businesses?.name ? (
                          <span>{member.businesses.name}</span>
                        ) : null}
                        <span>· depuis {formatDate(member.created_at)}</span>
                      </div>
                    </div>
                    {!isSelf ? (
                      <form
                        action={removeMemberAction}
                        onSubmit={(event) => {
                          if (!window.confirm(`Retirer ${member.email} de l'équipe ?`)) {
                            event.preventDefault();
                          }
                        }}
                      >
                        <input type="hidden" name="userId" value={member.id} />
                        <Button type="submit" size="sm" variant="ghost">
                          Retirer
                        </Button>
                      </form>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
