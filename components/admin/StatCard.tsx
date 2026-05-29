import type { ComponentType } from "react";
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
  icon: Icon,
  accent = "primary",
}: {
  title: string;
  value: number | string;
  hint?: string;
  icon: ComponentType<{ className?: string }>;
  accent?: Accent;
}) {
  const numericValue = typeof value === "number" ? value : null;

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
      {hint ? <p className="relative mt-4 text-sm text-muted">{hint}</p> : null}
    </div>
  );
}
