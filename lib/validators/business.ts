import { z } from "zod";

const optionalEmail = z
  .string()
  .trim()
  .transform((value) => value || null)
  .pipe(z.string().email("Email invalide").nullable());

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || null);

const optionalNumber = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === undefined || value === "" ? null : Number(value)))
  .pipe(z.number().nullable());

export const businessSchema = z.object({
  name: z.string().trim().min(2, "Nom requis"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug invalide"),
  primary_color: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Couleur hex invalide"),
  secondary_color: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Couleur secondaire invalide"),
  card_style: z.enum(["gradient", "solid", "glass"]).default("gradient"),
  welcome_message: optionalString,
  address: optionalString,
  latitude: optionalNumber.refine(
    (v) => v === null || (v >= -90 && v <= 90),
    "Latitude invalide",
  ),
  longitude: optionalNumber.refine(
    (v) => v === null || (v >= -180 && v <= 180),
    "Longitude invalide",
  ),
  phone: optionalString,
  email: optionalEmail,
  business_type: optionalString,
  loyalty_type: z.enum(["stamps", "points"]).default("stamps"),
  stamps_required: z.coerce.number().int().min(1).max(50),
  points_required: z.coerce.number().int().min(1).max(1_000_000).default(100),
  stamp_cooldown_minutes: z.coerce.number().int().min(0).max(1440).default(0),
  birthday_reward_enabled: z.coerce.boolean().default(false),
  reward_label: z.string().trim().min(2, "Récompense requise"),
  is_active: z.coerce.boolean().default(false),
});

export type BusinessFormValues = z.infer<typeof businessSchema>;
