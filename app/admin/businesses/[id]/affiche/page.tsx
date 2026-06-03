import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Gift, QrCode, ScanLine, Stamp } from "lucide-react";
import { PrintButton } from "@/components/admin/PrintButton";
import { BrandMark } from "@/components/brand/BrandMark";
import { BRAND } from "@/lib/brand";
import { requireAdmin } from "@/lib/auth/queries";
import { requireBusinessAccess, requireFullPortalAccess } from "@/lib/permissions";
import { generateBusinessQrUrl, generateQRCodeDataUrl } from "@/lib/qr";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Affiche comptoir",
};

const PRINT_CSS = `
@media print {
  @page { size: A5 portrait; margin: 10mm; }
  html, body { background: #ffffff !important; }
  .no-print { display: none !important; }
  #poster {
    box-shadow: none !important;
    border: none !important;
    margin: 0 auto !important;
    width: 100% !important;
    max-width: none !important;
  }
}
`;

export default async function BusinessPosterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile } = await requireAdmin();
  requireFullPortalAccess(profile);
  requireBusinessAccess(profile, id);

  const supabase = createAdminClient();
  const { data: business } = await supabase.from("businesses").select("*").eq("id", id).single();
  if (!business) notFound();

  const publicUrl = generateBusinessQrUrl(business.slug);
  const qrDataUrl = await generateQRCodeDataUrl(publicUrl);
  const accent = business.primary_color || BRAND.colors.primary;
  const isPoints = business.loyalty_type === "points";
  const threshold = isPoints ? business.points_required ?? 100 : business.stamps_required;

  const steps = [
    {
      icon: ScanLine,
      title: "Scannez",
      text: "Flashez ce QR code avec votre téléphone.",
    },
    {
      icon: Stamp,
      title: "Cumulez",
      text: isPoints
        ? `Gagnez des points à chaque passage (${threshold} pour la récompense).`
        : `Récoltez un tampon à chaque passage (${threshold} au total).`,
    },
    {
      icon: Gift,
      title: "Gagnez",
      text: business.reward_label,
    },
  ];

  return (
    <main className="min-h-screen bg-surface-muted px-4 py-8">
      <style>{PRINT_CSS}</style>

      <div className="no-print mx-auto mb-6 flex max-w-[460px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={`/admin/businesses/${business.id}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-ink"
        >
          <ArrowLeft aria-hidden className="h-4 w-4" />
          Retour au commerce
        </Link>
        <PrintButton />
      </div>

      <p className="no-print mx-auto mb-4 max-w-[460px] text-center text-xs text-muted">
        Format conseillé : A5 ou A6 à poser sur le comptoir. Lance l&apos;impression puis choisis
        « Enregistrer en PDF » si besoin.
      </p>

      <article
        id="poster"
        className="mx-auto flex max-w-[460px] flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_30px_90px_rgba(15,23,42,0.16)] ring-1 ring-border"
      >
        <div
          className="relative px-8 pb-8 pt-9 text-white"
          style={{ background: `linear-gradient(135deg, ${accent}, ${BRAND.colors.ink})` }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/15 ring-1 ring-white/20">
              {business.logo_url ? (
                <Image
                  src={business.logo_url}
                  alt=""
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                <span className="text-2xl font-black">{business.name.slice(0, 1)}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-2xl font-black tracking-tight">{business.name}</p>
              <p className="text-sm font-semibold text-white/75">Carte de fidélité</p>
            </div>
          </div>
          <p className="mt-6 text-3xl font-black leading-tight tracking-tight">
            Votre fidélité,
            <br />
            ça se récompense.
          </p>
        </div>

        <div className="flex flex-col items-center gap-5 px-8 py-8">
          <div className="rounded-3xl bg-white p-4 ring-1 ring-border">
            <Image
              src={qrDataUrl}
              alt={`QR code ${business.name}`}
              width={232}
              height={232}
              unoptimized
              className="h-56 w-56"
            />
          </div>
          <p className="inline-flex items-center gap-2 rounded-full bg-surface-muted px-4 py-2 text-sm font-bold text-ink">
            <QrCode aria-hidden className="h-4 w-4" style={{ color: accent }} />
            Scannez, c&apos;est sans application
          </p>

          <div className="mt-1 grid w-full gap-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="flex items-start gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: accent }}
                  >
                    <Icon aria-hidden className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-ink">
                      {index + 1}. {step.title}
                    </p>
                    <p className="text-sm leading-5 text-muted">{step.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 border-t border-border bg-surface-muted px-8 py-4">
          <BrandMark size={22} />
          <p className="text-xs font-bold text-muted">
            Propulsé par <span className="text-ink">{BRAND.name}</span>
          </p>
        </div>
      </article>
    </main>
  );
}
