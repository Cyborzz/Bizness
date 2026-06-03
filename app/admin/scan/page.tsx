import { ScanLine } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { CardScanner } from "@/components/admin/CardScanner";
import { requireAdmin } from "@/lib/auth/queries";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Scanner une carte",
};

export default async function ScanPage() {
  const { profile } = await requireAdmin();

  return (
    <AdminShell profile={profile}>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark">
            <ScanLine aria-hidden className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-normal text-primary">
              Caisse
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-ink">
              Scanner une carte client
            </h1>
          </div>
        </div>
        <p className="text-muted">
          Le client présente son QR (depuis sa carte sauvegardée). Pointez la caméra vers le code,
          la page s&apos;ouvre automatiquement et vous pouvez ajouter un tampon.
        </p>
        <CardScanner allowManualSearch={profile.role !== "staff"} />
        <div className="rounded-lg border border-border bg-surface-muted p-4 text-sm text-muted">
          <p className="font-black text-ink">Astuce</p>
          {profile.role === "staff" ? (
            <p className="mt-1">
              Compatible Chrome / Edge / Samsung Internet sur Android. Si la caméra ne démarre pas,
              demandez au responsable d&apos;ouvrir la carte depuis la recherche.
            </p>
          ) : (
            <p className="mt-1">
              Compatible Chrome / Edge / Samsung Internet sur Android. Sur iPhone, le scanner natif
              est limité : utilisez plutôt la recherche par téléphone ou nom dans{" "}
              <strong>Cartes</strong>.
            </p>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
