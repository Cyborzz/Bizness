import type { Tables } from "./database";

export type Customer = Tables<"customers">;

export type CustomerWithBusiness = Customer & {
  businesses?: {
    name: string;
    slug: string;
  } | null;
};
