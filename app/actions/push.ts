"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { pushSubscribeSchema, pushUnsubscribeSchema } from "@/lib/validators/push";

export type PushActionState = { ok: boolean; error?: string };

export async function subscribePushAction(input: {
  cardId: string;
  endpoint: string;
  p256dh: string;
  auth_key: string;
  user_agent?: string | null;
}): Promise<PushActionState> {
  const parsed = pushSubscribeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const supabase = createAdminClient();
  const { data: card } = await supabase
    .from("loyalty_cards")
    .select("id, business_id, customer_id, status")
    .eq("id", parsed.data.cardId)
    .maybeSingle();

  if (!card || card.status !== "active") {
    return { ok: false, error: "Carte introuvable ou inactive." };
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        customer_id: card.customer_id,
        business_id: card.business_id,
        endpoint: parsed.data.endpoint,
        p256dh: parsed.data.p256dh,
        auth_key: parsed.data.auth_key,
        user_agent: parsed.data.user_agent ?? null,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "endpoint" },
    );

  if (error) {
    return { ok: false, error: "Impossible d'enregistrer l'abonnement." };
  }

  return { ok: true };
}

export async function unsubscribePushAction(endpoint: string): Promise<PushActionState> {
  const parsed = pushUnsubscribeSchema.safeParse({ endpoint });
  if (!parsed.success) {
    return { ok: false, error: "Endpoint invalide." };
  }

  const supabase = createAdminClient();
  await supabase.from("push_subscriptions").delete().eq("endpoint", parsed.data.endpoint);
  return { ok: true };
}
