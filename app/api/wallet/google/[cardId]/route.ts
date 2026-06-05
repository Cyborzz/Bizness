import { NextResponse } from "next/server";
import { buildGoogleWalletSaveUrl } from "@/lib/wallet/google";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  ctx: { params: Promise<{ cardId: string }> },
) {
  const { cardId } = await ctx.params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const back = new URL(`/card/${cardId}`, appUrl);

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("loyalty_cards")
    .select(
      "id, business_id, status, current_stamps, rewards_available, businesses(name, logo_url, primary_color, reward_label, stamps_required, points_required, loyalty_type, is_active, latitude, longitude)",
    )
    .eq("id", cardId)
    .maybeSingle();

  // Le client admin n'est pas typé avec le schéma : une relation to-one renvoie
  // un objet au runtime, mais l'inférence la typerait en tableau — on caste.
  const card = data as {
    id: string;
    business_id: string;
    status: string;
    current_stamps: number;
    rewards_available: number;
    businesses: {
      name: string | null;
      logo_url: string | null;
      primary_color: string | null;
      reward_label: string | null;
      stamps_required: number | null;
      points_required: number | null;
      loyalty_type: string | null;
      is_active: boolean;
      latitude: number | null;
      longitude: number | null;
    } | null;
  } | null;

  if (!card || !card.businesses || card.status !== "active" || !card.businesses.is_active) {
    return NextResponse.redirect(back);
  }

  const saveUrl = buildGoogleWalletSaveUrl({
    card: {
      id: card.id,
      current_stamps: card.current_stamps,
      rewards_available: card.rewards_available,
    },
    business: card.businesses,
    businessId: card.business_id,
    appUrl,
  });

  if (!saveUrl) {
    return NextResponse.redirect(back);
  }

  return NextResponse.redirect(saveUrl);
}
