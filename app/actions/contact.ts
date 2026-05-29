"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { contactSchema } from "@/lib/validators/contact";

export type ContactState = {
  error?: string;
};

export async function createLeadAction(_: ContactState, formData: FormData): Promise<ContactState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    business_name: formData.get("business_name"),
    business_type: formData.get("business_type"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("leads").insert(parsed.data);

  if (error) {
    return { error: "Impossible d'enregistrer la demande pour le moment." };
  }

  redirect("/merci");
}
