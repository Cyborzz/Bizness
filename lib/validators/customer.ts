import { z } from "zod";

const optionalContact = z.string().trim().optional().transform((value) => value || null);

export const customerSignupSchema = z
  .object({
    business_slug: z.string().trim().min(1),
    first_name: z.string().trim().min(2, "Prénom requis"),
    last_name: z.string().trim().optional().transform((value) => value || null),
    phone: optionalContact,
    email: z
      .string()
      .trim()
      .optional()
      .transform((value) => value || null)
      .pipe(z.string().email("Email invalide").nullable()),
    consent_loyalty: z.coerce.boolean().refine(Boolean, "Consentement requis"),
    consent_marketing: z.coerce.boolean().default(false),
  })
  .refine((value) => Boolean(value.phone || value.email), {
    message: "Téléphone ou email obligatoire",
    path: ["phone"],
  });

export type CustomerSignupValues = z.infer<typeof customerSignupSchema>;
