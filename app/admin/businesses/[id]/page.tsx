import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CreditCard, ExternalLink, Printer, Stamp, Users } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { BusinessForm } from "@/components/admin/BusinessForm";
import { QRCodeCard } from "@/components/admin/QRCodeCard";
import { StatCard } from "@/components/admin/StatCard";
import { TransactionTable } from "@/components/admin/TransactionTable";
import { Badge } from "@/components/ui/badge";
import { ToastBanner } from "@/components/ui/toast-banner";
import { requireAdmin } from "@/lib/auth/queries";
import { requireBusinessAccess, requireFullPortalAccess } from "@/lib/permissions";
import { generateBusinessQrUrl } from "@/lib/qr";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Détail commerce",
};

export default async function BusinessDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const success = typeof sp.success === "string" ? sp.success : undefined;
  const error = typeof sp.error === "string" ? sp.error : undefined;
  const { profile } = await requireAdmin();
  requireFullPortalAccess(profile);
  requireBusinessAccess(profile, id);

  const supabase = createAdminClient();
  const { data: business } = await supabase.from("businesses").select("*").eq("id", id).single();
  if (!business) notFound();

  const [{ count: customerCount }, { data: cards }, { data: transactions }] =
    await Promise.all([
      supabase
        .from("customers")
        .select("id", { count: "exact", head: true })
        .eq("business_id", business.id),
      supabase
        .from("loyalty_cards")
        .select("id,total_stamps,rewards_available")
        .eq("business_id", business.id),
      supabase
        .from("transactions")
        .select("*, businesses(name), customers(first_name,last_name)")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

  const publicUrl = generateBusinessQrUrl(business.slug);

  return (
    <AdminShell profile={profile}>
      <div className="space-y-6">
        <Link
          href="/admin/businesses"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-ink"
        >
          <ArrowLeft aria-hidden className="h-4 w-4" />
          Retour aux commerces
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge tone={business.is_active ? "mint" : "neutral"}>
                {business.is_active ? "Actif" : "Inactif"}
              </Badge>
              <span className="font-mono text-xs text-muted">/c/{business.slug}</span>
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-ink">
              {business.name}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/admin/businesses/${business.id}/affiche`}
              className="focus-ring btn-press inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-white transition hover:bg-ink/90"
            >
              <Printer aria-hidden className="h-4 w-4" />
              Affiche comptoir
            </Link>
            <Link
              href={`/c/${business.slug}`}
              target="_blank"
              className="focus-ring btn-press inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-ink ring-1 ring-border transition hover:bg-surface-muted"
            >
              <ExternalLink aria-hidden className="h-4 w-4" />
              Ouvrir la page publique
            </Link>
          </div>
        </div>
        <ToastBanner success={success} error={error} />
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            title="Clients inscrits"
            value={customerCount ?? 0}
            icon={Users}
            accent="primary"
          />
          <StatCard
            title="Cartes actives"
            value={cards?.length ?? 0}
            icon={CreditCard}
            accent="mint"
          />
          <StatCard
            title="Tampons distribués"
            value={cards?.reduce((sum, card) => sum + card.total_stamps, 0) ?? 0}
            icon={Stamp}
            accent="sun"
          />
        </div>
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <BusinessForm business={business} />
          <div id="qr">
            <QRCodeCard url={publicUrl} title={`QR — ${business.name}`} />
          </div>
        </div>
        <TransactionTable transactions={transactions ?? []} />
      </div>
    </AdminShell>
  );
}
