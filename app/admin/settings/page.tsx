import { Mail, ShieldCheck, Sparkles } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { requireAdmin, type AdminProfile } from "@/lib/auth/queries";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Réglages",
};

const roleLabels: Record<AdminProfile["role"], { label: string; tone: BadgeTone }> = {
  super_admin: { label: "Super admin", tone: "violet" },
  business_owner: { label: "Owner", tone: "primary" },
  staff: { label: "Staff", tone: "mint" },
};

const roadmap = [
  "Stripe Checkout + abonnement",
  "Apple Wallet & Google Wallet",
  "Notifications email/SMS/WhatsApp",
  "Campagnes marketing",
  "Statistiques avancées",
];

export default async function SettingsPage() {
  const { profile } = await requireAdmin();
  const role = roleLabels[profile.role];

  return (
    <AdminShell profile={profile}>
      <div className="max-w-3xl space-y-6">
        <div>
          <p className="text-xs font-black uppercase tracking-normal text-primary">Configuration</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-ink">Réglages</h1>
          <p className="mt-1 text-muted">
            Base V1. Stripe, Wallet et notifications restent prévus pour la V2.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-ink">Compte admin</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-surface-muted p-3">
              <span className="flex items-center gap-2 font-semibold text-ink">
                <Mail aria-hidden className="h-4 w-4 text-muted" />
                Email
              </span>
              <strong className="truncate">{profile.email}</strong>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-surface-muted p-3">
              <span className="flex items-center gap-2 font-semibold text-ink">
                <ShieldCheck aria-hidden className="h-4 w-4 text-muted" />
                Rôle
              </span>
              <Badge tone={role.tone}>{role.label}</Badge>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-ink p-5 text-white shadow-xl">
          <div className="flex items-center gap-2">
            <Sparkles aria-hidden className="h-4 w-4 text-sun" />
            <p className="text-xs font-black uppercase text-white/60">À venir en V2</p>
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {roadmap.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm font-semibold"
              >
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-sun" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AdminShell>
  );
}
