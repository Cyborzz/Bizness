import {
  Activity,
  Building2,
  CreditCard,
  Download,
  Gift,
  Percent,
  Repeat,
  Stamp,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatCard } from "@/components/admin/StatCard";
import { StatsChart } from "@/components/admin/StatsChart";
import { TransactionTable } from "@/components/admin/TransactionTable";
import { LinkButton } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/queries";
import { getBusinessFilter, requireFullPortalAccess } from "@/lib/permissions";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Dashboard admin",
};

const DAYS = 14;
const ACTIVE_DAYS = 30;

export default async function DashboardPage() {
  const { profile } = await requireAdmin();
  requireFullPortalAccess(profile);
  const businessFilter = getBusinessFilter(profile);
  const supabase = createAdminClient();

  const since = new Date();
  since.setDate(since.getDate() - DAYS);

  const since30 = new Date();
  since30.setDate(since30.getDate() - ACTIVE_DAYS);

  let businessesQuery = supabase.from("businesses").select("id", { count: "exact", head: true });
  let customersQuery = supabase.from("customers").select("id", { count: "exact", head: true });
  let cardsQuery = supabase.from("loyalty_cards").select("id,rewards_available,total_stamps");
  let transactionsQuery = supabase
    .from("transactions")
    .select("*, businesses(name), customers(first_name,last_name)")
    .order("created_at", { ascending: false })
    .limit(8);
  let recentTransactionsQuery = supabase
    .from("transactions")
    .select("type,created_at")
    .gte("created_at", since.toISOString());
  let rewardsEarnedQuery = supabase
    .from("transactions")
    .select("id", { count: "exact", head: true })
    .eq("type", "reward_earned");
  let rewardsRedeemedQuery = supabase
    .from("transactions")
    .select("id", { count: "exact", head: true })
    .eq("type", "reward_redeemed");
  let activeEventsQuery = supabase
    .from("transactions")
    .select("customer_id")
    .eq("type", "stamp_added")
    .gte("created_at", since30.toISOString());
  let topCardsQuery = supabase
    .from("loyalty_cards")
    .select("id,total_stamps,rewards_available,customers(first_name,last_name)")
    .eq("status", "active")
    .order("total_stamps", { ascending: false })
    .limit(10);

  if (businessFilter) {
    businessesQuery = businessesQuery.eq("id", businessFilter);
    customersQuery = customersQuery.eq("business_id", businessFilter);
    cardsQuery = cardsQuery.eq("business_id", businessFilter);
    transactionsQuery = transactionsQuery.eq("business_id", businessFilter);
    recentTransactionsQuery = recentTransactionsQuery.eq("business_id", businessFilter);
    rewardsEarnedQuery = rewardsEarnedQuery.eq("business_id", businessFilter);
    rewardsRedeemedQuery = rewardsRedeemedQuery.eq("business_id", businessFilter);
    activeEventsQuery = activeEventsQuery.eq("business_id", businessFilter);
    topCardsQuery = topCardsQuery.eq("business_id", businessFilter);
  }

  const [
    { count: businessCount },
    { count: customerCount },
    { data: cards },
    { data: transactions },
    { data: recent },
    { count: rewardsEarned },
    { count: rewardsRedeemed },
    { data: activeEvents },
    { data: topCards },
  ] = await Promise.all([
    businessesQuery,
    customersQuery,
    cardsQuery,
    transactionsQuery,
    recentTransactionsQuery,
    rewardsEarnedQuery,
    rewardsRedeemedQuery,
    activeEventsQuery,
    topCardsQuery,
  ]);

  // Top 10 clients (par tampons/points cumulés)
  const topClients = (topCards ?? [])
    .map((row) => {
      const c = Array.isArray(row.customers) ? row.customers[0] : row.customers;
      const name = `${c?.first_name ?? ""} ${c?.last_name ?? ""}`.trim() || "Client";
      return {
        id: row.id as string,
        name,
        total: (row.total_stamps as number) ?? 0,
        rewards: (row.rewards_available as number) ?? 0,
      };
    })
    .filter((c) => c.total > 0);

  const totalStamps = cards?.reduce((sum, card) => sum + card.total_stamps, 0) ?? 0;
  const rewardsAvailable = cards?.reduce((sum, card) => sum + card.rewards_available, 0) ?? 0;

  // ─── KPIs de rétention (calculés sur l'existant) ───
  const customers = customerCount ?? 0;
  const visits30 = activeEvents?.length ?? 0;
  const activeCustomers = new Set((activeEvents ?? []).map((row) => row.customer_id)).size;
  const activeRate = customers > 0 ? Math.round((activeCustomers / customers) * 100) : 0;
  const visitsPerActive = activeCustomers > 0 ? visits30 / activeCustomers : 0;
  const earned = rewardsEarned ?? 0;
  const redeemed = rewardsRedeemed ?? 0;
  const redemptionRate = earned > 0 ? Math.round((redeemed / earned) * 100) : 0;

  // ─── Croissance : nouveaux clients sur 7j vs 7j précédents ───
  const day7 = new Date();
  day7.setDate(day7.getDate() - 7);
  let newCustomers7 = 0;
  let newCustomersPrev7 = 0;
  for (const row of recent ?? []) {
    if (row.type !== "card_created") continue;
    if (new Date(row.created_at) >= day7) newCustomers7 += 1;
    else newCustomersPrev7 += 1;
  }
  const newCustomersTrend =
    newCustomersPrev7 > 0
      ? Math.round(((newCustomers7 - newCustomersPrev7) / newCustomersPrev7) * 100)
      : newCustomers7 > 0
        ? 100
        : null;

  const buckets = buildDailyBuckets(DAYS);
  for (const row of recent ?? []) {
    const day = bucketKey(new Date(row.created_at));
    if (!buckets[day]) continue;
    if (row.type === "stamp_added") buckets[day].stamps += 1;
    if (row.type === "card_created") buckets[day].cards += 1;
    if (row.type === "reward_redeemed") buckets[day].rewards += 1;
  }

  const bucketEntries = Object.entries(buckets).sort(([a], [b]) => a.localeCompare(b));
  const stampsSeries = bucketEntries.map(([key, val]) => ({
    label: formatShort(key),
    value: val.stamps,
  }));
  const cardsSeries = bucketEntries.map(([key, val]) => ({
    label: formatShort(key),
    value: val.cards,
  }));
  const rewardsSeries = bucketEntries.map(([key, val]) => ({
    label: formatShort(key),
    value: val.rewards,
  }));

  return (
    <AdminShell profile={profile}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-normal text-primary">
              Aperçu général
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-ink">Dashboard</h1>
            <p className="mt-1 text-muted">Vue rapide sur l&apos;activité fidélité.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <LinkButton href="/admin/export/customers" variant="secondary" size="sm">
              <Download aria-hidden className="h-4 w-4" />
              Export clients CSV
            </LinkButton>
            <LinkButton href="/admin/export/transactions" variant="secondary" size="sm">
              <Download aria-hidden className="h-4 w-4" />
              Export transactions CSV
            </LinkButton>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard
            title="Commerces"
            value={businessCount ?? 0}
            icon={Building2}
            accent="primary"
          />
          <StatCard title="Clients" value={customerCount ?? 0} icon={Users} accent="violet" />
          <StatCard
            title="Nouveaux clients (7j)"
            value={newCustomers7}
            trend={newCustomersTrend}
            hint="vs 7 jours précédents"
            icon={UserPlus}
            accent="dark"
          />
          <StatCard
            title="Cartes créées"
            value={cards?.length ?? 0}
            icon={CreditCard}
            accent="coral"
          />
          <StatCard
            title="Tampons distribués"
            value={totalStamps}
            icon={Stamp}
            accent="mint"
          />
          <StatCard
            title="Récompenses dispo."
            value={rewardsAvailable}
            icon={Gift}
            accent="sun"
          />
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-normal text-primary">
            Rétention
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Clients actifs (30j)"
              value={activeCustomers}
              hint={`${activeRate} % de votre base de clients`}
              icon={Activity}
              accent="mint"
            />
            <StatCard
              title="Taux de rédemption"
              value={`${redemptionRate} %`}
              hint={`${redeemed} utilisée(s) sur ${earned} gagnée(s)`}
              icon={Percent}
              accent="violet"
            />
            <StatCard
              title="Visites moy. / client actif"
              value={visitsPerActive.toFixed(1)}
              hint="passages sur les 30 derniers jours"
              icon={Repeat}
              accent="primary"
            />
            <StatCard
              title="Récompenses utilisées"
              value={redeemed}
              hint="depuis le lancement"
              icon={Gift}
              accent="sun"
            />
          </div>
        </div>

        <div>
          <p className="flex items-center gap-1.5 text-xs font-black uppercase tracking-normal text-primary">
            <Trophy aria-hidden className="h-4 w-4" />
            Top 10 clients
          </p>
          <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
            {topClients.length === 0 ? (
              <p className="p-5 text-sm text-muted">
                Pas encore d&apos;activité client à classer.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {topClients.map((client, index) => (
                  <li
                    key={client.id}
                    className="flex items-center justify-between gap-4 px-5 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={
                          index < 3
                            ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sun-soft text-xs font-black text-[#9a5b00]"
                            : "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-muted text-xs font-black text-muted"
                        }
                      >
                        {index + 1}
                      </span>
                      <span className="truncate text-sm font-semibold text-ink">
                        {client.name}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-xs">
                      {client.rewards > 0 ? (
                        <span className="rounded-full bg-mint-soft px-2 py-0.5 font-black text-mint">
                          {client.rewards} récomp.
                        </span>
                      ) : null}
                      <span className="font-black tabular-nums text-ink">
                        {client.total}
                        <span className="ml-1 font-semibold text-muted">cumulés</span>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <StatsChart title="Tampons (14j)" points={stampsSeries} accent="#18a77a" />
          <StatsChart title="Inscriptions (14j)" points={cardsSeries} accent="#2454ff" />
          <StatsChart
            title="Récompenses utilisées (14j)"
            points={rewardsSeries}
            accent="#f5b84b"
          />
        </div>
        <TransactionTable transactions={transactions ?? []} />
      </div>
    </AdminShell>
  );
}

function buildDailyBuckets(days: number) {
  const out: Record<string, { stamps: number; cards: number; rewards: number }> = {};
  const today = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out[bucketKey(d)] = { stamps: 0, cards: 0, rewards: 0 };
  }
  return out;
}

function bucketKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function formatShort(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit" }).format(d);
}
