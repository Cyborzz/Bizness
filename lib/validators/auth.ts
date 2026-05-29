import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Email invalide"),
  password: z.string().min(6, "Mot de passe trop court"),
});
