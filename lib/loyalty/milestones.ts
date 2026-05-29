// Logique partagée des "milestones" : anniversaire + statut client.
// Réutilisée par la page carte (lecture seule) et l'action de réclamation.

// Marqueur stable stocké dans transactions.note pour identifier un cadeau
// d'anniversaire déjà attribué sur l'année en cours (idempotence).
export const BIRTHDAY_NOTE = "🎂 Cadeau d'anniversaire";

// Nombre de jours après la date d'anniversaire pendant lesquels le cadeau
// reste réclamable (la "semaine d'anniversaire").
export const BIRTHDAY_WINDOW_DAYS = 6;

// Vrai si on est dans la fenêtre d'anniversaire (jour J → J+6), heure serveur.
export function isBirthdayDue(
  birthdate: string | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!birthdate) return false;
  const bd = new Date(birthdate);
  if (Number.isNaN(bd.getTime())) return false;

  const thisYear = new Date(now.getFullYear(), bd.getMonth(), bd.getDate());
  const diffDays = Math.floor(
    (now.getTime() - thisYear.getTime()) / 86_400_000,
  );
  return diffDays >= 0 && diffDays <= BIRTHDAY_WINDOW_DAYS;
}

// Début de l'année civile courante en ISO (pour scoper "déjà réclamé cette année").
export function startOfYearISO(now: Date = new Date()): string {
  return new Date(now.getFullYear(), 0, 1).toISOString();
}

export type LoyaltyTier = {
  label: string;
  emoji: string;
  threshold: number;
};

// Paliers de statut dérivés de total_stamps. Renvoie null en dessous du 1er palier.
const TIERS: LoyaltyTier[] = [
  { label: "Légende locale", emoji: "👑", threshold: 50 },
  { label: "VIP", emoji: "⭐", threshold: 25 },
  { label: "Habitué·e", emoji: "💛", threshold: 10 },
];

export function getLoyaltyTier(totalStamps: number): LoyaltyTier | null {
  return TIERS.find((tier) => totalStamps >= tier.threshold) ?? null;
}
