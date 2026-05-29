"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { allowAction } from "@/lib/security/rate-limit";
import { contactSchema } from "@/lib/validators/contact";

export type ContactState = {
  error?: string;
};

export async function createLeadAction(_: ContactState, formData: FormData): Promise<ContactState> {
  if (!(await allowAction("lead", 3, 600))) {
    return {
      error: "Trop d'envois. Patientez quelques minutes avant de réessayer.",
    };
  }

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
