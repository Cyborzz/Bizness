"use client";

import { removeMemberAction } from "@/app/actions/team";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdminProfile } from "@/lib/auth/queries";
import { formatDate } from "@/lib/utils/format";

type TeamMember = {
  id: string;
  email: string;
  role: AdminProfile["role"];
  created_at: string;
  businesses?: { name: string } | null;
};

const roleLabels: Record<AdminProfile["role"], { label: string; tone: BadgeTone }> = {
  super_admin: { label: "Super admin", tone: "violet" },
  business_owner: { label: "Owner", tone: "primary" },
  staff: { label: "Staff", tone: "mint" },
};

export function TeamMemberList({
  members,
  currentUserId,
}: {
  members: TeamMember[];
  currentUserId: string;
}) {
  return (
    <div className="mt-4 space-y-3">
      {members.map((member) => {
        const role = roleLabels[member.role] ?? roleLabels.staff;
        const isSelf = member.id === currentUserId;
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
                {member.businesses?.name ? <span>{member.businesses.name}</span> : null}
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
  );
}
