import { z } from "zod";

export const posKeyLabelSchema = z
  .string()
  .trim()
  .min(1, "Nom requis")
  .max(60, "Maximum 60 caractères");

// Corps de la requête d'ingestion caisse. Le client est identifié soit par
// `card_id`, soit par `contact` (téléphone ou email). `external_ref` (id de la
// transaction caisse) garantit l'idempotence ; `amount` n'est lu qu'en mode points.
export const posIngestSchema = z
  .object({
    card_id: z.string().uuid().optional(),
    contact: z.string().trim().min(3).max(120).optional(),
    amount: z.coerce.number().int().min(1).max(1_000_000).optional(),
    external_ref: z.string().trim().min(1).max(120).optional(),
  })
  .refine((v) => Boolean(v.card_id || v.contact), {
    message: "Fournir card_id ou contact",
    path: ["contact"],
  });

export type PosIngestInput = z.infer<typeof posIngestSchema>;
