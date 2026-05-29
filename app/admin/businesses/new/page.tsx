import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { BusinessForm } from "@/components/admin/BusinessForm";
import { requireAdmin } from "@/lib/auth/queries";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Nouveau commerce",
};

export default async function NewBusinessPage() {
  const { profile } = await requireAdmin();

  return (
    <AdminShell profile={profile}>
      <div className="max-w-4xl space-y-6">
        <Link
          href="/admin/businesses"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-ink"
        >
          <ArrowLeft aria-hidden className="h-4 w-4" />
          Retour aux commerces
        </Link>
        <div>
          <p className="text-xs font-black uppercase tracking-normal text-primary">
            Nouveau commerce
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-ink">
            Créer un commerce
          </h1>
          <p className="mt-1 text-muted">
            Le slug générera automatiquement l&apos;URL publique et le QR code.
          </p>
        </div>
        <BusinessForm />
      </div>
    </AdminShell>
  );
}
