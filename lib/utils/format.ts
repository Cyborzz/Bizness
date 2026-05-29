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
