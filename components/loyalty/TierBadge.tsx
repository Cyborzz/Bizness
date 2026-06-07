import { getTierStatus } from "@/lib/loyalty/tier";

// Badge de niveau fidélité affiché sur la carte client (statut + progression).
export function TierBadge({ total }: { total: number }) {
  const { current, next, toNext, progress } = getTierStatus(total);

  return (
    <section className="rounded-[24px] bg-white p-5 shadow-xl ring-1 ring-border">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span aria-hidden className="text-3xl">
            {current.emoji}
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-normal text-muted-2">
              Votre niveau
            </p>
            <p className="text-lg font-black text-ink">{current.label}</p>
          </div>
        </div>
        <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-black tabular-nums text-ink">
          {Math.max(0, Math.floor(total))} cumulés
        </span>
      </div>

      {next ? (
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-semibold text-muted">
            Plus que <strong className="text-ink">{toNext}</strong> avant le niveau{" "}
            {next.emoji} {next.label}
          </p>
        </div>
      ) : (
        <p className="mt-4 text-xs font-semibold text-mint">
          🎉 Niveau maximum atteint, merci pour votre fidélité !
        </p>
      )}
    </section>
  );
}
