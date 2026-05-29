import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Nom requis"),
  email: z.string().trim().email("Email invalide"),
  phone: z.string().trim().optional().transform((value) => value || null),
  business_name: z.string().trim().optional().transform((value) => value || null),
  business_type: z.string().trim().optional().transform((value) => value || null),
  message: z.string().trim().optional().transform((value) => value || null),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
