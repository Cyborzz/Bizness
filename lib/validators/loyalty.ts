import { z } from "zod";

export const cardActionSchema = z.object({
  cardId: z.string().uuid("Carte invalide"),
});

export const deleteCustomerSchema = z.object({
  customerId: z.string().uuid("Client invalide"),
});

export const updateMarketingConsentSchema = z.object({
  customerId: z.string().uuid("Client invalide"),
  consent_marketing: z.coerce.boolean(),
});
