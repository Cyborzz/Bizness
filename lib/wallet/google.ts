import "server-only";

import crypto from "node:crypto";
import { getGoogleWalletConfig, type GoogleWalletConfig } from "./env";

// ── Données minimales attendues (le client Supabase admin n'est pas typé) ──
type WalletCard = {
  id: string;
  current_stamps: number;
  rewards_available: number;
};

type WalletBusiness = {
  name?: string | null;
  logo_url?: string | null;
  primary_color?: string | null;
  reward_label?: string | null;
  stamps_required?: number | null;
  points_required?: number | null;
  loyalty_type?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

const SCOPE = "https://www.googleapis.com/auth/wallet_object.issuer";
const WALLET_API = "https://walletobjects.googleapis.com/walletobjects/v1";

// ── Helpers JWT (RS256) via crypto natif, sans dépendance externe ──
function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function signRs256(payload: Record<string, unknown>, privateKey: string): string {
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const body = base64url(JSON.stringify(payload));
  const data = `${header}.${body}`;
  const signature = crypto.createSign("RSA-SHA256").update(data).sign(privateKey);
  return `${data}.${base64url(signature)}`;
}

// ── Identifiants déterministes (pas besoin de table de correspondance) ──
function sanitizeId(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]/g, "_");
}

function objectId(config: GoogleWalletConfig, cardId: string): string {
  return `${config.issuerId}.fm_card_${sanitizeId(cardId)}`;
}

function classId(config: GoogleWalletConfig, businessId: string): string {
  return `${config.issuerId}.fm_biz_${sanitizeId(businessId)}`;
}

function validHexColor(value?: string | null): string | undefined {
  if (value && /^#[0-9a-fA-F]{6}$/.test(value)) return value;
  return undefined;
}

function progressThreshold(business: WalletBusiness): { isPoints: boolean; threshold: number } {
  const isPoints = business.loyalty_type === "points";
  const threshold = Math.max(
    1,
    isPoints ? business.points_required ?? 100 : business.stamps_required ?? 10,
  );
  return { isPoints, threshold };
}

function buildLoyaltyPoints(card: WalletCard, business: WalletBusiness) {
  const { isPoints, threshold } = progressThreshold(business);
  if (isPoints) {
    return { label: "Points", balance: { int: card.current_stamps } };
  }
  return { label: "Tampons", balance: { string: `${card.current_stamps}/${threshold}` } };
}

function buildTextModules(card: WalletCard, business: WalletBusiness) {
  if ((card.rewards_available ?? 0) > 0) {
    const label = business.reward_label || "Récompense";
    return [
      {
        id: "reward",
        header: "Récompense prête",
        body: `${card.rewards_available} × ${label}`,
      },
    ];
  }
  return [];
}

// ── Échange JWT (compte de service) -> jeton d'accès OAuth ──
async function getAccessToken(config: GoogleWalletConfig): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const assertion = signRs256(
    {
      iss: config.clientEmail,
      scope: SCOPE,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    },
    config.privateKey,
  );

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!res.ok) {
    throw new Error(`Google token endpoint: ${res.status}`);
  }
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("Google token endpoint: pas d'access_token");
  return json.access_token;
}

/**
 * Construit le lien « Ajouter à Google Wallet » (fat JWT : la classe et l'objet
 * sont embarqués, Google les crée à la première sauvegarde). Renvoie null si
 * Google Wallet n'est pas configuré.
 */
export function buildGoogleWalletSaveUrl(params: {
  card: WalletCard;
  business: WalletBusiness;
  businessId: string;
  appUrl: string;
}): string | null {
  const config = getGoogleWalletConfig();
  if (!config) return null;

  const { card, business, businessId, appUrl } = params;
  const cardUrl = `${appUrl}/card/${card.id}`;

  const loyaltyClass: Record<string, unknown> = {
    id: classId(config, businessId),
    issuerName: business.name || "Commerce",
    programName: "Carte de fidélité",
    reviewStatus: "UNDER_REVIEW",
    programLogo: {
      sourceUri: { uri: business.logo_url || `${appUrl}/icon-512.png` },
    },
  };
  const hex = validHexColor(business.primary_color);
  if (hex) loyaltyClass.hexBackgroundColor = hex;

  const loyaltyObject: Record<string, unknown> = {
    id: objectId(config, card.id),
    classId: classId(config, businessId),
    state: "ACTIVE",
    accountId: card.id,
    accountName: `Carte ${business.name || ""}`.trim(),
    loyaltyPoints: buildLoyaltyPoints(card, business),
    textModulesData: buildTextModules(card, business),
    barcode: { type: "QR_CODE", value: cardUrl, alternateText: "Carte fidélité" },
  };

  // Géolocalisation : la carte remonte sur l'écran de verrouillage quand le
  // client est à proximité du commerce (Google Wallet gère le déclenchement).
  if (typeof business.latitude === "number" && typeof business.longitude === "number") {
    loyaltyObject.locations = [
      { latitude: business.latitude, longitude: business.longitude },
    ];
  }

  const claims = {
    iss: config.clientEmail,
    aud: "google",
    typ: "savetowallet",
    iat: Math.floor(Date.now() / 1000),
    origins: [appUrl],
    payload: {
      loyaltyClasses: [loyaltyClass],
      loyaltyObjects: [loyaltyObject],
    },
  };

  return `https://pay.google.com/gp/v/save/${signRs256(claims, config.privateKey)}`;
}

/**
 * Met à jour l'objet Wallet d'une carte (tampons + récompense). Si le client
 * n'a jamais ajouté le pass (objet inexistant -> 404), on ignore en silence.
 * Lève sinon (le wrapper notify capture l'erreur).
 */
export async function updateGoogleWalletObject(params: {
  card: WalletCard;
  business: WalletBusiness;
}): Promise<void> {
  const config = getGoogleWalletConfig();
  if (!config) return;

  const { card, business } = params;
  const patch = {
    loyaltyPoints: buildLoyaltyPoints(card, business),
    textModulesData: buildTextModules(card, business),
  };

  const token = await getAccessToken(config);
  const res = await fetch(
    `${WALLET_API}/loyaltyObject/${encodeURIComponent(objectId(config, card.id))}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patch),
    },
  );

  // 404 = le client n'a pas (encore) ajouté la carte à son Wallet : rien à faire.
  if (res.status === 404) return;
  if (!res.ok) {
    throw new Error(`Google Wallet PATCH: ${res.status}`);
  }
}
