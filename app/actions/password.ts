"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type ForgotPasswordState = { error?: string };

const forgotSchema = z.object({
  email: z.string().trim().email("Email invalide"),
});

const resetSchema = z
  .object({
    password: z.string().min(8, "8 caractères minimum"),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    path: ["confirm"],
    message: "Les mots de passe ne correspondent pas",
  });

export async function forgotPasswordAction(
  _: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const parsed = forgotSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const supabase = await createClient();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${baseUrl}/admin/login/reset`,
  });

  if (error) {
    return { error: "Impossible d'envoyer l'email pour le moment." };
  }

  redirect("/admin/login?success=password-reset-sent");
}

export type ResetPasswordState = { error?: string; ok?: boolean };

export async function resetPasswordAction(
  _: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const parsed = resetSchema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { error: "Impossible de mettre à jour le mot de passe." };
  }

  redirect("/admin/dashboard");
}
