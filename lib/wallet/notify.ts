import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { isGoogleWalletConfigured } from "./env";
import { updateGoogleWalletObject } from "./google";

/**
 * Pousse l'état à jour d'une carte vers le pass Google Wallet (si configuré et
 * si le client a ajouté la carte). Conçu pour être appelé après chaque mutation
 * de tampons/récompense : ne lève JAMAIS, pour ne pas casser l'action métier.
 */
export async function notifyWalletPassUpdate(cardId: string): Promise<void> {
  if (!isGoogleWalletConfigured()) return;

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("loyalty_cards")
      .select(
        "id, current_stamps, rewards_available, businesses(name, reward_label, stamps_required, points_required, loyalty_type)",
      )
      .eq("id", cardId)
      .maybeSingle();

    // Client admin non typé : on caste vers la forme réelle (businesses = objet).
    const card = data as {
      id: string;
      current_stamps: number;
      rewards_available: number;
      businesses: {
        name: string | null;
        reward_label: string | null;
        stamps_required: number | null;
        points_required: number | null;
        loyalty_type: string | null;
      } | null;
    } | null;

    if (!card || !card.businesses) return;

    await updateGoogleWalletObject({
      card: {
        id: card.id,
        current_stamps: card.current_stamps,
        rewards_available: card.rewards_available,
      },
      business: card.businesses,
    });
  } catch (err) {
    console.error("[wallet] échec de mise à jour du pass", err);
  }
}
