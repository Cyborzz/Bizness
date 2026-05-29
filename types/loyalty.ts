import type { Tables } from "./database";

export type LoyaltyCard = Tables<"loyalty_cards">;
export type Transaction = Tables<"transactions">;

export type LoyaltyCardStatus = LoyaltyCard["status"];
export type TransactionType = Transaction["type"];
