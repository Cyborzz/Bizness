import { Bell, Mail, MessageSquare, ShieldCheck, Sparkles } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { requireAdmin, type AdminProfile } from "@/lib/auth/queries";
import { requireFullPortalAccess } from "@/lib/permissions";
import { getVapidPublicKey } from "@/lib/push/env";
import { isSmsConfigured } from "@/lib/sms/env";

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
  "Apple Wallet (pass natif iOS)",
  "Connexion aux caisses (SumUp, Square…)",
  "Notifications WhatsApp",
  "Statistiques avancées",
];

export default async function SettingsPage() {
  const { profile } = await requireAdmin();
  requireFullPortalAccess(profile);
  const role = roleLabels[profile.role];

  const pushConfigured = Boolean(getVapidPublicKey());
  const smsConfigured = isSmsConfigured();
  const channels: {
    label: string;
    icon: typeof Bell;
    configured: boolean;
    hint: string;
  }[] = [
    {
      label: "Notifications Push",
      icon: Bell,
      configured: pushConfigured,
      hint: "Clés VAPID (NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY).",
    },
    {
      label: "SMS (Brevo)",
      icon: MessageSquare,
      configured: smsConfigured,
      hint: "Clé API Brevo (BREVO_API_KEY) + expéditeur SMS_SENDER.",
    },
  ];

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

        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-ink">Canaux de relance</h2>
          <p className="mt-1 text-sm text-muted">
            État de configuration côté serveur. La relance automatique des
            clients inactifs et les campagnes utilisent ces canaux.
          </p>
          <div className="mt-4 grid gap-3">
            {channels.map((channel) => {
              const Icon = channel.icon;
              return (
                <div
                  key={channel.label}
                  className="flex items-start justify-between gap-3 rounded-lg bg-surface-muted p-3"
                >
                  <span className="flex items-start gap-2 text-sm">
                    <Icon aria-hidden className="mt-0.5 h-4 w-4 text-muted" />
                    <span>
                      <strong className="block font-semibold text-ink">
                        {channel.label}
                      </strong>
                      <span className="text-xs text-muted">{channel.hint}</span>
                    </span>
                  </span>
                  <Badge tone={channel.configured ? "mint" : "neutral"}>
                    {channel.configured ? "Actif" : "Non configuré"}
                  </Badge>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted">
            La relance inactifs s&apos;active par commerce dans{" "}
            <strong>Commerces → Modifier → Relance &amp; marketing</strong>.
          </p>
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
