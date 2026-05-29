import { AdminShell } from "@/components/admin/AdminShell";
import { TransactionTable } from "@/components/admin/TransactionTable";
import { requireAdmin } from "@/lib/auth/queries";
import { getBusinessFilter } from "@/lib/permissions";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Transactions",
};

export default async function TransactionsPage() {
  const { profile } = await requireAdmin();
  const businessFilter = getBusinessFilter(profile);
  const supabase = createAdminClient();

  let query = supabase
    .from("transactions")
    .select("*, businesses(name), customers(first_name,last_name)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (businessFilter) query = query.eq("business_id", businessFilter);
  const { data: transactions } = await query;

  return (
    <AdminShell profile={profile}>
      <div className="space-y-6">
        <div>
          <p className="text-xs font-black uppercase tracking-normal text-primary">Historique</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-ink">Transactions</h1>
          <p className="mt-1 text-muted">
            Historique des créations, tampons et récompenses (100 dernières).
          </p>
        </div>
        <TransactionTable transactions={transactions ?? []} />
      </div>
    </AdminShell>
  );
}
