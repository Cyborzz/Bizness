import Image from "next/image";
import { QrCode } from "lucide-react";

// Présentationnel : reçoit une data URL générée côté serveur (lib/qr).
export function CardQRCode({ dataUrl }: { dataUrl: string }) {
  return (
    <section className="rounded-[24px] bg-white p-5 text-center shadow-xl ring-1 ring-border">
      <div className="flex items-center justify-center gap-2 text-ink">
        <QrCode aria-hidden className="h-4 w-4" />
        <h2 className="text-sm font-black uppercase tracking-normal">
          Présentez ce code en caisse
        </h2>
      </div>
      <div className="mt-4 flex justify-center">
        <Image
          src={dataUrl}
          alt="QR code de votre carte fidélité"
          width={220}
          height={220}
          unoptimized
          className="rounded-xl bg-white p-2 ring-1 ring-border"
        />
      </div>
      <p className="mt-3 text-xs text-muted">
        Le commerçant le scanne pour créditer vos tampons.
      </p>
    </section>
  );
}
