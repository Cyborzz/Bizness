import type { LoyaltyCard } from "@/types/loyalty";

export function generateSlug(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function formatPhone(phone?: string | null) {
  if (!phone) return null;
  const trimmed = phone.replace(/\s+/g, " ").trim();
  return trimmed.length ? trimmed : null;
}

// Canonicalise un numéro de téléphone pour garantir l'unicité et la recherche.
// FR-centré (0X XX… → +33…) avec repli sur les chiffres bruts si non reconnu,
// ce qui collapse au minimum les variations d'espacement/ponctuation.
// Ex. "06 12 34 56 78", "0612345678", "+33 6 12 34 56 78", "0033612345678"
//     → tous "+33612345678".
export function normalizePhone(phone?: string | null): string | null {
  if (!phone) return null;
  const trimmed = phone.trim();
  if (!trimmed) return null;

  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;

  if (hasPlus) return `+${digits}`;
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  if (digits.length === 10 && digits.startsWith("0")) {
    return `+33${digits.slice(1)}`;
  }
  return digits;
}

export function normalizeOptional(value?: FormDataEntryValue | string | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export function calculateRemainingStamps(current: number, required: number) {
  return Math.max(required - current, 0);
}

export function canRedeemReward(card: Pick<LoyaltyCard, "rewards_available" | "status">) {
  return card.status === "active" && card.rewards_available > 0;
}

export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatShortDate(value: string | Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}
