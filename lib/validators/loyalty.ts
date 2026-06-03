import { z } from "zod";
import { postgresUuid } from "@/lib/validators/uuid";

export const cardActionSchema = z.object({
  cardId: postgresUuid("Carte invalide"),
});

export const deleteCustomerSchema = z.object({
  customerId: postgresUuid("Client invalide"),
});

export const updateMarketingConsentSchema = z.object({
  customerId: postgresUuid("Client invalide"),
  consent_marketing: z.coerce.boolean(),
});
