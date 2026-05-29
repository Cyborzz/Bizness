import { CircleDot, Gift, Minus, Plus, UserPlus } from "lucide-react";
import type { ComponentType } from "react";
import { formatDate } from "@/lib/utils/format";
import type { Transaction } from "@/types/loyalty";

const labels: Record<Transaction["type"], string> = {
  card_created: "Carte créée",
  stamp_added: "Tampon ajouté",
  stamp_removed: "Tampon retiré",
  reward_earned: "Récompense gagnée",
  reward_redeemed: "Récompense utilisée",
  customer_deleted: "Client supprimé",
};

const icons: Record<Transaction["type"], ComponentType<{ className?: string }>> = {
  card_created: UserPlus,
  stamp_added: Plus,
  stamp_removed: Minus,
  reward_earned: Gift,
  reward_redeemed: Gift,
  customer_deleted: CircleDot,
};

const accents: Record<Transaction["type"], string> = {
  card_created: "bg-primary-soft text-primary-dark",
  stamp_added: "bg-mint-soft text-mint",
  stamp_removed: "bg-gray-100 text-gray-600",
  reward_earned: "bg-sun-soft text-[#9a5b00]",
  reward_redeemed: "bg-violet-soft text-violet",
  customer_deleted: "bg-red-100 text-red-700",
};

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  if (!transactions.length) {
    return (
      <p className="rounded-lg bg-surface-muted p-4 text-sm text-muted">
        Aucun historique pour le moment.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((transaction, index) => {
        const Icon = icons[transaction.type];
        return (
          <div
            key={transaction.id}
            className="animate-fade-in-up flex items-center gap-3 rounded-lg border border-border bg-white p-3 shadow-sm"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accents[transaction.type]}`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">
                {labels[transaction.type]}
              </p>
              <p className="text-xs text-muted">{formatDate(transaction.created_at)}</p>
            </div>
            {transaction.value !== 0 ? (
              <span className="text-sm font-bold tabular-nums text-ink">
                {transaction.value > 0 ? "+" : ""}
                {transaction.value}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
