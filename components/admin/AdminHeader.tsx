import { LogOut, ShieldCheck } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import type { AdminProfile } from "@/lib/auth/queries";

const roleLabels: Record<AdminProfile["role"], { label: string; tone: BadgeTone }> = {
  super_admin: { label: "Super admin", tone: "violet" },
  business_owner: { label: "Owner", tone: "primary" },
  staff: { label: "Staff", tone: "mint" },
};

export function AdminHeader({ profile }: { profile: AdminProfile }) {
  const role = roleLabels[profile.role];

  return (
    <header className="border-b border-border bg-white/85 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 pl-12 lg:pl-0">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-mint-soft text-mint">
            <ShieldCheck aria-hidden className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-normal text-muted">
                Session active
              </p>
              <Badge tone={role.tone}>{role.label}</Badge>
            </div>
            <h1 className="truncate text-base font-black text-ink sm:text-lg">
              {profile.email}
            </h1>
          </div>
        </div>
        <form action={logoutAction}>
          <Button variant="secondary" size="sm">
            <LogOut aria-hidden className="h-4 w-4" />
            Déconnexion
          </Button>
        </form>
      </div>
    </header>
  );
}
