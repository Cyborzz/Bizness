import type { ComponentType } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";

const accents = {
  primary: "bg-primary text-white shadow-[var(--shadow-glow-primary)]",
  mint: "bg-mint text-white shadow-[var(--shadow-glow-mint)]",
  coral: "bg-coral text-white",
  violet: "bg-violet text-white",
  sun: "bg-sun text-ink",
  dark: "bg-ink text-white",
} as const;

type Accent = keyof typeof accents;

export function StatCard({
  title,
  value,
  hint,
  trend,
  icon: Icon,
  accent = "primary",
}: {
  title: string;
  value: number | string;
  hint?: string;
  /** Variation en % vs période précédente. Affiche un badge coloré ↑/↓. */
  trend?: number | null;
  icon: ComponentType<{ className?: string }>;
  accent?: Accent;
}) {
  const numericValue = typeof value === "number" ? value : null;
  const hasTrend = typeof trend === "number" && Number.isFinite(trend);
  const trendUp = hasTrend && (trend as number) >= 0;

  return (
    <div className="lift relative overflow-hidden rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-primary/15 to-transparent blur-2xl"
      />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-normal text-muted-2">{title}</p>
          <p className="mt-3 text-4xl font-black tracking-tight text-ink tabular-nums">
            {numericValue !== null ? <AnimatedCounter value={numericValue} /> : value}
          </p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-lg ${accents[accent]}`}
        >
          <Icon aria-hidden className="h-5 w-5" />
        </div>
      </div>
      {hint || hasTrend ? (
        <p className="relative mt-4 flex items-center gap-2 text-sm text-muted">
          {hasTrend ? (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-black ${
                trendUp ? "bg-mint-soft text-mint" : "bg-red-100 text-red-600"
              }`}
            >
              {trendUp ? (
                <TrendingUp aria-hidden className="h-3 w-3" />
              ) : (
                <TrendingDown aria-hidden className="h-3 w-3" />
              )}
              {trendUp ? "+" : ""}
              {trend} %
            </span>
          ) : null}
          {hint ? <span>{hint}</span> : null}
        </p>
      ) : null}
    </div>
  );
}
