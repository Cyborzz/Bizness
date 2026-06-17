// Config email centralisée. Provider : Brevo (ex-Sendinblue) — même compte que
// le SMS, via la même clé API. Emails transactionnels via l'API HTTP.
// Si la clé OU l'expéditeur sont absents, l'envoi devient un no-op propre
// (aucun crash) — même pattern que le SMS et le Web Push.

export type EmailConfig = {
  apiKey: string;
  // Adresse d'expéditeur vérifiée dans Brevo (ex. contact@fidelise-moi.fr).
  senderEmail: string;
  // Nom d'expéditeur affiché (ex. "Fidélise-moi").
  senderName: string;
};

export function getEmailConfig(): EmailConfig | null {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_EMAIL_SENDER?.trim();
  // L'email exige une adresse d'expéditeur vérifiée : sans elle, no-op.
  if (!apiKey || !senderEmail) return null;

  const senderName = process.env.BREVO_EMAIL_SENDER_NAME?.trim() || "Fidélise-moi";
  return { apiKey, senderEmail, senderName };
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.BREVO_API_KEY && process.env.BREVO_EMAIL_SENDER);
}
