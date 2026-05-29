import {
  Activity,
  Building2,
  CreditCard,
  Download,
  Gift,
  Percent,
  Repeat,
  Stamp,
  Users,
} from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatCard } from "@/components/admin/StatCard";
import { StatsChart } from "@/components/admin/StatsChart";
import { TransactionTable } from "@/components/admin/TransactionTable";
import { LinkButton } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/queries";
import { getBusinessFilter } from "@/lib/permissions";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Dashboard admin",
};

const DAYS = 14;
const ACTIVE_DAYS = 30;

export default async function DashboardPage() {
  const { profile } = await requireAdmin();
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

  if (businessFilter) {
    businessesQuery = businessesQuery.eq("id", businessFilter);
    customersQuery = customersQuery.eq("business_id", businessFilter);
    cardsQuery = cardsQuery.eq("business_id", businessFilter);
    transactionsQuery = transactionsQuery.eq("business_id", businessFilter);
    recentTransactionsQuery = recentTransactionsQuery.eq("business_id", businessFilter);
    rewardsEarnedQuery = rewardsEarnedQuery.eq("business_id", businessFilter);
    rewardsRedeemedQuery = rewardsRedeemedQuery.eq("business_id", businessFilter);
    activeEventsQuery = activeEventsQuery.eq("business_id", businessFilter);
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
  ] = await Promise.all([
    businessesQuery,
    customersQuery,
    cardsQuery,
    transactionsQuery,
    recentTransactionsQuery,
    rewardsEarnedQuery,
    rewardsRedeemedQuery,
    activeEventsQuery,
  ]);

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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Commerces"
            value={businessCount ?? 0}
            icon={Building2}
            accent="primary"
          />
          <StatCard title="Clients" value={customerCount ?? 0} icon={Users} accent="violet" />
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
