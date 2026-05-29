import type { Tables } from "./database";

export type Business = Tables<"businesses">;
export type BusinessStatus = "active" | "inactive";
export type LoyaltyType = Business["loyalty_type"];
