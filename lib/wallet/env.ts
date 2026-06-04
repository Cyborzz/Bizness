// Configuration Google Wallet, centralisée et tolérante :
// si les secrets ne sont pas renseignés, la fonctionnalité se désactive
// proprement (le bouton « Ajouter à Google Wallet » n'apparaît pas, et la
// mise à jour des pass est ignorée) — aucun crash.
//
// Variables d'environnement (côté serveur uniquement) :
//   GOOGLE_WALLET_ISSUER_ID         Issuer ID (console Google Pay & Wallet)
//   GOOGLE_WALLET_SERVICE_ACCOUNT   clé du compte de service, JSON brut OU base64

export type GoogleWalletConfig = {
  issuerId: string;
  clientEmail: string;
  privateKey: string;
};

export function getGoogleWalletConfig(): GoogleWalletConfig | null {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
  const raw = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT;
  if (!issuerId || !raw) return null;

  try {
    const trimmed = raw.trim();
    const json = trimmed.startsWith("{")
      ? trimmed
      : Buffer.from(trimmed, "base64").toString("utf8");
    const parsed = JSON.parse(json) as {
      client_email?: string;
      private_key?: string;
    };
    const clientEmail = parsed.client_email;
    // Les clés stockées en .env ont souvent les sauts de ligne échappés.
    const privateKey = (parsed.private_key ?? "").replace(/\\n/g, "\n");
    if (!clientEmail || !privateKey) return null;
    return { issuerId, clientEmail, privateKey };
  } catch {
    return null;
  }
}

export function isGoogleWalletConfigured(): boolean {
  return getGoogleWalletConfig() !== null;
}
