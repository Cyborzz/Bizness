import { NextResponse, type NextRequest } from "next/server";
import { computeCredit } from "@/lib/loyalty/credit";
import { extractPrefix, hashKey, safeHashEqual } from "@/lib/pos/keys";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizePhone } from "@/lib/utils/format";
import { notifyWalletPassUpdate } from "@/lib/wallet/notify";
import { posIngestSchema } from "@/lib/validators/pos";

export const dynamic = "force-dynamic";

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status });
}

// POST /api/pos/ingest
// Auth : header `Authorization: Bearer fmpos_…`
// Body : { contact | card_id, amount?, external_ref? }
// Crédite automatiquement un passage. Idempotent via external_ref.
export async function POST(request: NextRequest) {
  // ── Authentification par clé API ──
  const auth = request.headers.get("authorization") ?? "";
  const fullKey = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const prefix = extractPrefix(fullKey);
  if (!prefix) {
    return json({ ok: false, error: "Clé API manquante ou invalide." }, 401);
  }

  // Rate-limit par clé (généreux : une caisse encaisse vite mais pas 1000/min).
  if (!(await checkRateLimit(`pos-ingest:${prefix}`, 600, 60))) {
    return json({ ok: false, error: "Trop de requêtes." }, 429);
  }

  const supabase = createAdminClient();
  const { data: keyRow } = await supabase
    .from("pos_api_keys")
    .select("id, business_id, key_hash, revoked_at")
    .eq("key_prefix", prefix)
    .maybeSingle();

  if (
    !keyRow ||
    keyRow.revoked_at ||
    !safeHashEqual(hashKey(fullKey), keyRow.key_hash)
  ) {
    return json({ ok: false, error: "Clé API invalide ou révoquée." }, 401);
  }

  // ── Validation du corps ──
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "JSON invalide." }, 400);
  }
  const parsed = posIngestSchema.safeParse(payload);
  if (!parsed.success) {
    return json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Requête invalide." },
      400,
    );
  }
  const { card_id, contact, amount, external_ref } = parsed.data;

  const businessId = keyRow.business_id;
  void supabase
    .from("pos_api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", keyRow.id);

  const { data: business } = await supabase
    .from("businesses")
    .select("id, is_active, loyalty_type, stamps_required, points_required")
    .eq("id", businessId)
    .maybeSingle();

  if (!business || !business.is_active) {
    return json({ ok: false, error: "Commerce inactif." }, 403);
  }

  // ── Résolution de la carte (card_id prioritaire, sinon contact) ──
  let card: {
    id: string;
    customer_id: string;
    current_stamps: number;
    total_stamps: number;
    rewards_available: number;
  } | null = null;

  if (card_id) {
    const { data } = await supabase
      .from("loyalty_cards")
      .select("id, customer_id, current_stamps, total_stamps, rewards_available, business_id, status")
      .eq("id", card_id)
      .maybeSingle();
    if (data && data.business_id === businessId && data.status === "active") {
      card = data;
    }
  } else if (contact) {
    let query = supabase
      .from("customers")
      .select("id, loyalty_cards(id,status,current_stamps,total_stamps,rewards_available)")
      .eq("business_id", businessId)
      .limit(1);
    if (contact.includes("@")) {
      query = query.ilike("email", contact.replace(/[%_\\]/g, "\\$&"));
    } else {
      query = query.eq("phone", normalizePhone(contact) ?? contact);
    }
    const { data: customer } = await query.maybeSingle();
    const active = customer?.loyalty_cards?.find((c) => c.status === "active");
    if (customer && active) {
      card = { customer_id: customer.id, ...active };
    }
  }

  if (!card) {
    await supabase.from("pos_events").insert({
      business_id: businessId,
      api_key_id: keyRow.id,
      external_ref: external_ref ?? null,
      status: "not_found",
      amount: 0,
      error: "Carte introuvable pour ce contact.",
    });
    return json({ ok: false, error: "Carte fidélité introuvable." }, 404);
  }

  // ── Idempotence : réserve l'external_ref AVANT de créditer ──
  if (external_ref) {
    const { error: reserveError } = await supabase.from("pos_events").insert({
      business_id: businessId,
      api_key_id: keyRow.id,
      external_ref,
      customer_id: card.customer_id,
      card_id: card.id,
      status: "duplicate", // requalifié en 'credited' après succès
      amount: 0,
    });
    if (reserveError) {
      // 23505 = ref déjà traitée → on renvoie un succès idempotent.
      if (reserveError.code === "23505") {
        return json({ ok: true, duplicate: true, card_id: card.id });
      }
      return json({ ok: false, error: "Erreur d'enregistrement." }, 500);
    }
  }

  // ── Crédit ──
  const isPoints = business.loyalty_type === "points";
  const threshold = Math.max(
    1,
    isPoints ? business.points_required ?? 100 : business.stamps_required ?? 10,
  );
  const credited = isPoints ? Math.max(1, amount ?? 1) : 1;
  const next = computeCredit(card, threshold, credited);

  const { error: updateError } = await supabase
    .from("loyalty_cards")
    .update({
      current_stamps: next.current_stamps,
      total_stamps: next.total_stamps,
      rewards_available: next.rewards_available,
    })
    .eq("id", card.id);

  if (updateError) {
    if (external_ref) {
      await supabase
        .from("pos_events")
        .update({ status: "error", error: "Échec de la mise à jour de la carte." })
        .eq("business_id", businessId)
        .eq("external_ref", external_ref);
    }
    return json({ ok: false, error: "Échec du crédit." }, 500);
  }

  await supabase.from("transactions").insert([
    {
      business_id: businessId,
      customer_id: card.customer_id,
      card_id: card.id,
      type: "stamp_added",
      value: credited,
      note: "Passage crédité automatiquement (caisse / API)",
    },
    ...(next.rewardsEarned > 0
      ? [
          {
            business_id: businessId,
            customer_id: card.customer_id,
            card_id: card.id,
            type: "reward_earned" as const,
            value: next.rewardsEarned,
            note: "Récompense débloquée (caisse / API)",
          },
        ]
      : []),
  ]);

  // Finalise le journal d'ingestion.
  if (external_ref) {
    await supabase
      .from("pos_events")
      .update({ status: "credited", amount: credited })
      .eq("business_id", businessId)
      .eq("external_ref", external_ref);
  } else {
    await supabase.from("pos_events").insert({
      business_id: businessId,
      api_key_id: keyRow.id,
      customer_id: card.customer_id,
      card_id: card.id,
      status: "credited",
      amount: credited,
    });
  }

  await notifyWalletPassUpdate(card.id);

  return json({
    ok: true,
    card_id: card.id,
    credited,
    current_stamps: next.current_stamps,
    threshold,
    rewards_available: next.rewards_available,
    reward_unlocked: next.rewardsEarned > 0,
  });
}
