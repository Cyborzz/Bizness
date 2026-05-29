import type { ReactNode } from "react";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";
import type { AdminProfile } from "@/lib/auth/queries";

export function AdminShell({ profile, children }: { profile: AdminProfile; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-muted lg:flex">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <AdminHeader profile={profile} />
        <main className="p-4 pt-16 sm:p-6 lg:p-8 lg:pt-8">{children}</main>
      </div>
    </div>
  );
}
