import "server-only";

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

// Clés API caisse. Format : `fmpos_<prefix8>_<secret>`.
// On ne stocke jamais la clé en clair : seuls le préfixe (lookup/affichage) et
// le hash SHA-256 du secret complet sont persistés.

const KEY_PREFIX = "fmpos";

export type GeneratedKey = {
  // La clé complète à afficher UNE seule fois au commerçant.
  fullKey: string;
  // Préfixe public stocké en base (identification + lookup).
  prefix: string;
  // Hash SHA-256 de la clé complète (stocké en base).
  hash: string;
};

export function hashKey(fullKey: string): string {
  return createHash("sha256").update(fullKey).digest("hex");
}

export function generateApiKey(): GeneratedKey {
  const prefixPart = randomBytes(6).toString("hex").slice(0, 8);
  const secret = randomBytes(24).toString("base64url");
  const fullKey = `${KEY_PREFIX}_${prefixPart}_${secret}`;
  return { fullKey, prefix: prefixPart, hash: hashKey(fullKey) };
}

// Extrait le préfixe d'une clé fournie (pour le lookup en base).
export function extractPrefix(fullKey: string): string | null {
  const parts = fullKey.split("_");
  if (parts.length < 3 || parts[0] !== KEY_PREFIX) return null;
  return parts[1] || null;
}

// Comparaison à temps constant des hash (anti-timing).
export function safeHashEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
