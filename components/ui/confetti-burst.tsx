"use client";

import { useMemo, type CSSProperties } from "react";

type ConfettiBurstProps = {
  trigger: number;
  colors?: string[];
  count?: number;
};

const DEFAULT_COLORS = ["#2454ff", "#18a77a", "#ff6b4a", "#f5b84b", "#7c3aed"];

// Deterministic pseudo-random in [0, 1) based on a seed.
function rand(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function ConfettiBurst({
  trigger,
  colors = DEFAULT_COLORS,
  count = 18,
}: ConfettiBurstProps) {
  const pieces = useMemo(() => {
    if (!trigger) return [];
    return Array.from({ length: count }).map((_, index) => {
      const seed = trigger * 73 + index * 17;
      const angle = (index / count) * Math.PI * 2 + rand(seed) * 0.4;
      const distance = 60 + rand(seed + 1) * 80;
      const cx = Math.cos(angle) * distance;
      const cy = Math.sin(angle) * distance - 40;
      const color = colors[index % colors.length];
      return {
        key: index,
        style: {
          background: color,
          ["--cx" as string]: `${cx}px`,
          ["--cy" as string]: `${cy}px`,
          animationDelay: `${rand(seed + 2) * 80}ms`,
          transform: "translate(-50%, -50%)",
        } satisfies CSSProperties,
      };
    });
  }, [trigger, count, colors]);

  if (!pieces.length) return null;

  return (
    <div
      key={trigger}
      className="pointer-events-none absolute inset-0 overflow-visible"
      aria-hidden
    >
      {pieces.map((p) => (
        <span key={p.key} className="confetti-dot" style={p.style} />
      ))}
    </div>
  );
}
