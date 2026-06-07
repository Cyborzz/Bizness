// Config SMS centralisée. Provider : Brevo (ex-Sendinblue) — opérateur français,
// compatible RGPD, SMS transactionnels + marketing via une simple clé API.
// Si la clé est absente, tout l'envoi SMS devient un no-op propre (aucun crash) —
// même pattern que le Web Push (VAPID).

export type SmsConfig = {
  apiKey: string;
  // Expéditeur alphanumérique par défaut (3-11 car.). Surchargé par commerce.
  defaultSender: string;
};

export function getSmsConfig(): SmsConfig | null {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return null;

  const defaultSender = sanitizeSender(process.env.SMS_SENDER) ?? "Fidelise";
  return { apiKey, defaultSender };
}

export function isSmsConfigured(): boolean {
  return Boolean(process.env.BREVO_API_KEY);
}

// Normalise un expéditeur alphanumérique : retire les caractères interdits et
// tronque à 11 caractères. Renvoie null si rien d'exploitable.
export function sanitizeSender(raw?: string | null): string | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[^A-Za-z0-9 ]/g, "").trim().slice(0, 11);
  return cleaned.length >= 3 ? cleaned : null;
}
