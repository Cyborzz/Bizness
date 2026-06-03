import { Bell, Sparkles } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { OfferForm } from "@/components/admin/OfferForm";
import { OffersList } from "@/components/admin/OffersList";
import { Badge } from "@/components/ui/badge";
import { ToastBanner } from "@/components/ui/toast-banner";
import { requireAdmin } from "@/lib/auth/queries";
import { getBusinessFilter, requireFullPortalAccess } from "@/lib/permissions";
import { getServerVapid } from "@/lib/push/env";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Offres & notifications",
};

export default async function OffersPage({
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
  const vapidConfigured = Boolean(getServerVapid());

  let businessesQuery = supabase.from("businesses").select("id,name").order("name");
  if (businessFilter) businessesQuery = businessesQuery.eq("id", businessFilter);
  const { data: businesses } = await businessesQuery;

  let offersQuery = supabase
    .from("offers")
    .select("*, businesses(name)")
    .order("created_at", { ascending: false })
    .limit(50);
  if (businessFilter) offersQuery = offersQuery.eq("business_id", businessFilter);
  const { data: offers } = await offersQuery;

  let subsQuery = supabase
    .from("push_subscriptions")
    .select("id", { count: "exact", head: true });
  if (businessFilter) subsQuery = subsQuery.eq("business_id", businessFilter);
  const { count: subscriberCount } = await subsQuery;

  const isStaff = profile.role === "staff";

  return (
    <AdminShell profile={profile}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-normal text-primary">
              Engagement
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-ink">
              Offres &amp; notifications
            </h1>
            <p className="mt-1 text-muted">
              Diffusez une offre push à tous vos clients abonnés. Apparaît sur leur écran de
              verrouillage.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-white px-4 py-3 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary-dark">
              <Bell aria-hidden className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-2">Abonnés push</p>
              <p className="text-xl font-black text-ink tabular-nums">
                {subscriberCount ?? 0}
              </p>
            </div>
          </div>
        </div>

        <ToastBanner success={success} error={error} />

        {!vapidConfigured ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            <div className="flex items-start gap-2">
              <Sparkles aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-black">Web Push non configuré</p>
                <p className="mt-1">
                  Générez vos clés VAPID :{" "}
                  <code className="rounded bg-white/60 px-1 py-0.5 font-mono">
                    npx web-push generate-vapid-keys
                  </code>
                  , puis ajoutez{" "}
                  <code className="rounded bg-white/60 px-1 py-0.5 font-mono">
                    NEXT_PUBLIC_VAPID_PUBLIC_KEY
                  </code>{" "}
                  et{" "}
                  <code className="rounded bg-white/60 px-1 py-0.5 font-mono">
                    VAPID_PRIVATE_KEY
                  </code>{" "}
                  dans <code className="font-mono">.env.local</code>.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {!isStaff && (businesses?.length ?? 0) > 0 ? (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <h2 className="text-lg font-black text-ink">Nouvelle offre</h2>
              <p className="mt-1 text-sm text-muted">
                Le brouillon est enregistré, vous validez l&apos;envoi en deux clics.
              </p>
              <div className="mt-4">
                <OfferForm businesses={businesses ?? []} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-ink">Historique</h2>
                <Badge tone="neutral">{offers?.length ?? 0}</Badge>
              </div>
              <div className="mt-4">
                <OffersList offers={offers ?? []} />
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-black text-ink">Historique</h2>
            <div className="mt-4">
              <OffersList offers={offers ?? []} />
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
