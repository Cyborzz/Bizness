import QRCode from "qrcode";

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";
}

export function generateBusinessQrUrl(slug: string) {
  return `${getAppUrl()}/c/${slug}`;
}

// QR « inversé » du comptoir : le client valide son passage en self-service.
export function generatePassageQrUrl(slug: string) {
  return `${getAppUrl()}/c/${slug}/passage`;
}

export async function generateQRCodeDataUrl(value: string) {
  return QRCode.toDataURL(value, {
    margin: 1,
    width: 640,
    color: {
      dark: "#111827",
      light: "#ffffff",
    },
  });
}
