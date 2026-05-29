import "server-only";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

// Récupère l'IP cliente derrière le proxy Vercel.
export async function getClientIp(): Promise<string> {
  const store = await headers();
  const forwarded = store.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return store.get("x-real-ip") ?? "unknown";
}

// Renvoie true si l'action est autorisée. Fail-open : si le limiteur est
// indisponible (fonction absente, erreur DB), on n'empêche pas un vrai client.
export async function checkRateLimit(
  bucket: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_bucket: bucket,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) return true;
  return data !== false;
}

// Helper combiné : limite par action + IP. Renvoie true si autorisé.
export async function allowAction(
  action: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const ip = await getClientIp();
  return checkRateLimit(`${action}:${ip}`, limit, windowSeconds);
}
