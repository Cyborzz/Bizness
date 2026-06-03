import { z } from "zod";
import { postgresUuid } from "@/lib/validators/uuid";

export const pushSubscribeSchema = z.object({
  cardId: postgresUuid("Carte invalide"),
  endpoint: z.string().url("Endpoint invalide"),
  p256dh: z.string().min(1),
  auth_key: z.string().min(1),
  user_agent: z.string().max(500).optional().nullable(),
});

export const pushUnsubscribeSchema = z.object({
  endpoint: z.string().url(),
});

export const offerSchema = z.object({
  business_id: postgresUuid("Commerce invalide"),
  title: z.string().trim().min(2, "Titre requis").max(80, "Maximum 80 caractères"),
  body: z.string().trim().min(2, "Message requis").max(280, "Maximum 280 caractères"),
  image_url: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : null))
    .pipe(z.string().url("URL image invalide").nullable()),
  cta_url: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : null))
    .pipe(z.string().url("URL CTA invalide").nullable()),
});

export type OfferInput = z.infer<typeof offerSchema>;
