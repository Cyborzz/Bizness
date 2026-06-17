import "server-only";

import { getEmailConfig } from "./env";

// Envoi d'emails transactionnels via l'API Brevo.
// API : POST https://api.brevo.com/v3/smtp/email
// Auth : header `api-key`. L'expéditeur doit être une adresse vérifiée dans Brevo.

const BREVO_EMAIL_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

export type EmailRecipient = {
  // Identifiant interne (customer_id) pour le suivi des résultats.
  id: string;
  // Adresse email du destinataire.
  email: string;
};

export type EmailMessage = {
  subject: string;
  // Corps HTML (affiché). Le textContent est dérivé automatiquement si absent.
  html: string;
  text?: string;
};

export type EmailSendResult = {
  configured: boolean;
  delivered: number;
  failed: number;
  failedIds: string[];
};

function emptyResult(configured: boolean): EmailSendResult {
  return { configured, delivered: 0, failed: 0, failedIds: [] };
}

// Brevo accepte un envoi par requête : on parallélise avec un plafond de
// concurrence, comme pour le SMS.
const CONCURRENCY = 10;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendEmailBatch(
  recipients: EmailRecipient[],
  message: EmailMessage,
): Promise<EmailSendResult> {
  const config = getEmailConfig();
  if (!config) return emptyResult(false);
  if (recipients.length === 0) return emptyResult(true);

  const result = emptyResult(true);
  const textContent = message.text ?? message.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  for (let i = 0; i < recipients.length; i += CONCURRENCY) {
    const chunk = recipients.slice(i, i + CONCURRENCY);
    const settled = await Promise.allSettled(
      chunk.map(async (r) => {
        if (!EMAIL_RE.test(r.email)) throw new Error("invalid-email");

        const res = await fetch(BREVO_EMAIL_ENDPOINT, {
          method: "POST",
          headers: {
            "api-key": config.apiKey,
            "content-type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({
            sender: { name: config.senderName, email: config.senderEmail },
            to: [{ email: r.email }],
            subject: message.subject,
            htmlContent: message.html,
            textContent,
          }),
        });

        if (!res.ok) {
          const detail = await res.text().catch(() => "");
          throw new Error(`brevo-${res.status}:${detail.slice(0, 120)}`);
        }
        return r.id;
      }),
    );

    for (let j = 0; j < settled.length; j += 1) {
      if (settled[j].status === "fulfilled") {
        result.delivered += 1;
      } else {
        result.failed += 1;
        result.failedIds.push(chunk[j].id);
      }
    }
  }

  return result;
}
