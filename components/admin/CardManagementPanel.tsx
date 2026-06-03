"use client";

import { Gift, Minus, Plus, Trophy } from "lucide-react";
import {
  addStampAction,
  redeemRewardAction,
  removeStampAction,
} from "@/app/actions/loyalty";
import { Button, LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/field";

type CardRow = {
  id: string;
  current_stamps: number;
  total_stamps: number;
  rewards_available: number;
  status: string;
  businesses?: {
    name: string;
    stamps_required: number;
    loyalty_type?: "stamps" | "points" | null;
    points_required?: number | null;
  } | null;
  customers?: {
    first_name: string;
    last_name: string | null;
    phone: string | null;
    email: string | null;
  } | null;
};

export function CardManagementPanel({
  cards,
  role,
}: {
  cards: CardRow[];
  role?: "super_admin" | "business_owner" | "staff";
}) {
  const isStaff = role === "staff";

  return (
    <div className="grid gap-4">
      {cards.map((card) => {
        const isPoints = card.businesses?.loyalty_type === "points";
        const required = isPoints
          ? card.businesses?.points_required ?? 100
          : card.businesses?.stamps_required ?? 10;
        const progressPercent = Math.min((card.current_stamps / required) * 100, 100);
        const hasReward = card.rewards_available > 0;

        return (
          <div
            key={card.id}
            className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition hover:shadow-md"
          >
            <div className="grid gap-4 p-4 lg:grid-cols-[1fr_320px] lg:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-black text-ink">
                    {card.customers?.first_name} {card.customers?.last_name ?? ""}
                  </h2>
                  <Badge tone={card.status === "active" ? "mint" : "neutral"}>
                    {card.status}
                  </Badge>
                  {hasReward ? (
                    <Badge tone="sun">
                      <Trophy aria-hidden className="h-3 w-3" />
                      {card.rewards_available} récompense(s)
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted">
                  {card.businesses?.name ?? "Commerce"} ·{" "}
                  {card.customers?.phone ?? card.customers?.email ?? "contact absent"}
                </p>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs font-bold text-muted">
                    <span>Progression</span>
                    <span className="tabular-nums">
                      {card.current_stamps}/{required}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-muted">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#2454ff,#18a77a)] transition-[width] duration-700 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-surface-muted p-3">
                  <p className="text-xs font-bold uppercase text-muted-2">Actuels</p>
                  <p className="text-xl font-black tabular-nums text-ink">
                    {card.current_stamps}
                  </p>
                </div>
                <div className="rounded-lg bg-surface-muted p-3">
                  <p className="text-xs font-bold uppercase text-muted-2">Total</p>
                  <p className="text-xl font-black tabular-nums text-ink">
                    {card.total_stamps}
                  </p>
                </div>
                <div className="rounded-lg bg-surface-muted p-3">
                  <p className="text-xs font-bold uppercase text-muted-2">Récomp.</p>
                  <p className="text-xl font-black tabular-nums text-ink">
                    {card.rewards_available}
                  </p>
                </div>
              </div>
            </div>
            <div
              className={
                isStaff
                  ? "grid gap-2 border-t border-border bg-surface-muted/40 p-4 sm:grid-cols-1"
                  : "grid gap-2 border-t border-border bg-surface-muted/40 p-4 sm:grid-cols-[1fr_1fr_1fr_auto]"
              }
            >
              <form action={addStampAction} className={isPoints ? "flex gap-2" : ""}>
                <input type="hidden" name="cardId" value={card.id} />
                {isPoints ? (
                  <Input
                    name="amount"
                    type="number"
                    min={1}
                    defaultValue={10}
                    aria-label="Points à créditer"
                    className="w-24"
                    disabled={card.status !== "active"}
                  />
                ) : null}
                <Button type="submit" className="w-full" disabled={card.status !== "active"}>
                  <Plus aria-hidden className="h-4 w-4" />
                  {isPoints ? "Créditer" : "+1 tampon"}
                </Button>
              </form>
              {!isStaff ? (
                <>
                  <form action={removeStampAction}>
                    <input type="hidden" name="cardId" value={card.id} />
                    <Button
                      type="submit"
                      variant="secondary"
                      className="w-full"
                      disabled={card.status !== "active" || card.current_stamps === 0}
                    >
                      <Minus aria-hidden className="h-4 w-4" />
                      {isPoints ? "-1 point" : "-1 tampon"}
                    </Button>
                  </form>
                  <form action={redeemRewardAction}>
                    <input type="hidden" name="cardId" value={card.id} />
                    <Button
                      type="submit"
                      variant={hasReward ? "mint" : "dark"}
                      className="w-full"
                      disabled={!hasReward}
                    >
                      <Gift aria-hidden className="h-4 w-4" />
                      Utiliser récompense
                    </Button>
                  </form>
                  <LinkButton href={`/card/${card.id}`} variant="ghost" size="md">
                    Carte client
                  </LinkButton>
                </>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
