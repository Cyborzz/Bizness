import "server-only";

import { getSmsConfig, sanitizeSender } from "./env";

// Envoi de SMS transactionnels via l'API Brevo.
// API : POST https://api.brevo.com/v3/transactionalSMS/sms
// Auth : header `api-key`. Le destinataire doit être au format E.164 (+33…),
// ce que `normalizePhone` garantit déjà à l'inscription.

const BREVO_SMS_ENDPOINT = "https://api.brevo.com/v3/transactionalSMS/sms";

export type SmsRecipient = {
  // Identifiant interne (customer_id) pour le suivi des résultats.
  id: string;
  // Téléphone au format E.164 (+33…).
  phone: string;
};

export type SmsSendResult = {
  configured: boolean;
  delivered: number;
  failed: number;
  // ids des destinataires en échec définitif (numéro invalide, etc.).
  failedIds: string[];
};

function emptyResult(configured: boolean): SmsSendResult {
  return { configured, delivered: 0, failed: 0, failedIds: [] };
}

// Brevo n'a pas d'endpoint « batch » : on envoie un SMS par destinataire en
// parallèle (Promise.allSettled), avec un plafond de concurrence raisonnable.
const CONCURRENCY = 10;

export async function sendSmsBatch(
  recipients: SmsRecipient[],
  content: string,
  sender?: string | null,
): Promise<SmsSendResult> {
  const config = getSmsConfig();
  if (!config) return emptyResult(false);
  if (recipients.length === 0) return emptyResult(true);

  const from = sanitizeSender(sender) ?? config.defaultSender;
  const result = emptyResult(true);

  // E.164 sans le « + » : Brevo attend le numéro international sans signe plus.
  const toBrevoNumber = (phone: string) => phone.replace(/^\+/, "").replace(/\D/g, "");

  for (let i = 0; i < recipients.length; i += CONCURRENCY) {
    const chunk = recipients.slice(i, i + CONCURRENCY);
    const settled = await Promise.allSettled(
      chunk.map(async (r) => {
        const number = toBrevoNumber(r.phone);
        if (!number) throw new Error("invalid-number");

        const res = await fetch(BREVO_SMS_ENDPOINT, {
          method: "POST",
          headers: {
            "api-key": config.apiKey,
            "content-type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({
            type: "transactional",
            sender: from,
            recipient: number,
            content,
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
      const outcome = settled[j];
      if (outcome.status === "fulfilled") {
        result.delivered += 1;
      } else {
        result.failed += 1;
        result.failedIds.push(chunk[j].id);
      }
    }
  }

  return result;
}
