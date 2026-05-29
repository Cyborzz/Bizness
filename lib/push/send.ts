import "server-only";

import webpush, { type PushSubscription as WebPushSubscription } from "web-push";
import { getServerVapid } from "./env";

let configured = false;

function ensureConfigured() {
  if (configured) return true;
  const vapid = getServerVapid();
  if (!vapid) return false;
  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);
  configured = true;
  return true;
}

export type StoredSubscription = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth_key: string;
};

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  image?: string;
  tag?: string;
};

export type SendResult = {
  delivered: number;
  expired: string[];
  failed: number;
};

export async function sendPushBatch(
  subscriptions: StoredSubscription[],
  payload: PushPayload,
): Promise<SendResult> {
  if (!ensureConfigured()) {
    throw new Error(
      "Web Push n'est pas configuré. Définissez NEXT_PUBLIC_VAPID_PUBLIC_KEY et VAPID_PRIVATE_KEY.",
    );
  }

  const body = JSON.stringify(payload);
  const results = await Promise.allSettled(
    subscriptions.map((sub) => {
      const webSub: WebPushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth_key,
        },
      };
      return webpush
        .sendNotification(webSub, body)
        .then(() => ({ id: sub.id, ok: true as const }))
        .catch((error: { statusCode?: number; message?: string }) => ({
          id: sub.id,
          ok: false as const,
          statusCode: error.statusCode,
        }));
    }),
  );

  let delivered = 0;
  let failed = 0;
  const expired: string[] = [];
  for (const r of results) {
    if (r.status === "rejected") {
      failed += 1;
      continue;
    }
    if (r.value.ok) {
      delivered += 1;
    } else if (r.value.statusCode === 404 || r.value.statusCode === 410) {
      expired.push(r.value.id);
    } else {
      failed += 1;
    }
  }

  return { delivered, expired, failed };
}
