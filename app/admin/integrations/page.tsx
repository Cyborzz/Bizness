import { Plug } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { PosIntegrationPanel } from "@/components/admin/PosIntegrationPanel";
import { ToastBanner } from "@/components/ui/toast-banner";
import { requireAdmin } from "@/lib/auth/queries";
import { getBusinessFilter, requireFullPortalAccess } from "@/lib/permissions";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Intégration caisse",
};

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const success = typeof params.success === "string" ? params.success : undefined;
  const error = typeof params.error === "string" ? params.error : undefined;

  const { profile } = await requireAdmin();
  requireFullPortalAccess(profile);
  const businessFilter = getBusinessFilter(profile);
  const supabase = createAdminClient();

  let businessesQuery = supabase.from("businesses").select("id,name").order("name");
  if (businessFilter) businessesQuery = businessesQuery.eq("id", businessFilter);
  const { data: businesses } = await businessesQuery;

  let keysQuery = supabase
    .from("pos_api_keys")
    .select(
      "id,label,key_prefix,created_at,last_used_at,revoked_at,business_id,businesses(name)",
    )
    .order("created_at", { ascending: false })
    .limit(100);
  if (businessFilter) keysQuery = keysQuery.eq("business_id", businessFilter);
  const { data: keys } = await keysQuery;

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  const endpoint = `${appUrl}/api/pos/ingest`;

  return (
    <AdminShell profile={profile}>
      <div className="space-y-6">
        <div>
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-normal text-primary">
            <Plug aria-hidden className="h-4 w-4" />
            Automatisation
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-ink">
            Intégration caisse
          </h1>
          <p className="mt-1 text-muted">
            Créditez les passages automatiquement au paiement, via l&apos;API.
            Connectez SumUp, Square, Shopify ou un outil no-code (Zapier, Make).
          </p>
        </div>

        <ToastBanner success={success} error={error} />

        <PosIntegrationPanel
          businesses={businesses ?? []}
          keys={(keys ?? []) as never}
          endpoint={endpoint}
        />
      </div>
    </AdminShell>
  );
}
