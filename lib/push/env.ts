export function getVapidPublicKey() {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null;
}

export function getServerVapid() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:hello@fidelise-moi.fr";

  if (!publicKey || !privateKey) {
    return null;
  }

  return { publicKey, privateKey, subject };
}
