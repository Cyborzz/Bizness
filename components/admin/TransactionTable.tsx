import { formatDate } from "@/lib/utils/format";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { Transaction } from "@/types/loyalty";

type TransactionRow = Transaction & {
  businesses?: { name: string } | null;
  customers?: { first_name: string; last_name: string | null } | null;
};

const typeLabels: Record<Transaction["type"], { label: string; tone: BadgeTone }> = {
  card_created: { label: "Carte créée", tone: "primary" },
  stamp_added: { label: "Tampon ajouté", tone: "mint" },
  stamp_removed: { label: "Tampon retiré", tone: "neutral" },
  reward_earned: { label: "Récompense gagnée", tone: "sun" },
  reward_redeemed: { label: "Récompense utilisée", tone: "violet" },
  customer_deleted: { label: "Client supprimé", tone: "danger" },
};

export function TransactionTable({ transactions }: { transactions: TransactionRow[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="font-black text-ink">Dernières transactions</h2>
        <p className="text-xs font-bold uppercase text-muted-2">
          {transactions.length} entrée{transactions.length > 1 ? "s" : ""}
        </p>
      </div>
      {transactions.length === 0 ? (
        <div className="p-6">
          <EmptyState title="Aucune transaction">
            Les ajouts de tampons et récompenses s&apos;afficheront ici.
          </EmptyState>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-surface-muted text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Commerce</th>
                <th className="px-4 py-3">Valeur</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions.map((transaction) => {
                const typeMeta = typeLabels[transaction.type] ?? {
                  label: transaction.type,
                  tone: "neutral" as BadgeTone,
                };
                return (
                  <tr key={transaction.id} className="transition hover:bg-surface-muted/60">
                    <td className="px-4 py-3">
                      <Badge tone={typeMeta.tone}>{typeMeta.label}</Badge>
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink">
                      {transaction.customers?.first_name ?? "—"}{" "}
                      {transaction.customers?.last_name ?? ""}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {transaction.businesses?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-bold tabular-nums text-ink">
                      {transaction.value > 0 ? "+" : ""}
                      {transaction.value}
                    </td>
                    <td className="px-4 py-3 text-muted">{formatDate(transaction.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
