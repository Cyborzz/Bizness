// Niveaux de fidélité dérivés du cumul (total_stamps) — gamification pure,
// aucune colonne supplémentaire. Donne au client un statut qui progresse,
// ce qui incite à revenir.

export type TierKey = "bronze" | "argent" | "or" | "platine";

export type Tier = {
  key: TierKey;
  label: string;
  emoji: string;
  min: number;
};

export const TIERS: Tier[] = [
  { key: "bronze", label: "Bronze", emoji: "🥉", min: 0 },
  { key: "argent", label: "Argent", emoji: "🥈", min: 10 },
  { key: "or", label: "Or", emoji: "🥇", min: 30 },
  { key: "platine", label: "Platine", emoji: "💎", min: 60 },
];

export type TierStatus = {
  current: Tier;
  next: Tier | null;
  // Cumul restant pour atteindre le niveau suivant (0 si déjà au max).
  toNext: number;
  // Progression vers le niveau suivant, 0..1 (1 si au max).
  progress: number;
};

export function getTierStatus(total: number): TierStatus {
  const value = Math.max(0, Math.floor(total));
  let currentIndex = 0;
  for (let i = 0; i < TIERS.length; i += 1) {
    if (value >= TIERS[i].min) currentIndex = i;
  }
  const current = TIERS[currentIndex];
  const next = TIERS[currentIndex + 1] ?? null;
  if (!next) {
    return { current, next: null, toNext: 0, progress: 1 };
  }
  const span = next.min - current.min;
  const done = value - current.min;
  return {
    current,
    next,
    toNext: Math.max(0, next.min - value),
    progress: span > 0 ? Math.min(1, done / span) : 1,
  };
}
