import { Home, QrCode } from "lucide-react";
import { LinkButton } from "@/components/ui/button";

export const metadata = {
  title: "Page introuvable",
};

export default function NotFoundPage() {
  return (
    <main className="section-grid flex min-h-screen items-center justify-center bg-ink px-4 py-10 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(36,84,255,0.45),transparent_70%)] blur-3xl"
      />
      <div className="relative max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/20 backdrop-blur">
          <QrCode aria-hidden className="h-7 w-7" />
        </div>
        <p className="mt-6 text-sm font-black uppercase tracking-normal text-sun">404</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Page introuvable</h1>
        <p className="mt-3 text-white/70">
          Le lien est cassé ou la carte n&apos;existe plus. Vérifiez l&apos;URL ou retournez à
          l&apos;accueil.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <LinkButton href="/">
            <Home aria-hidden className="h-4 w-4" />
            Retour à l&apos;accueil
          </LinkButton>
          <LinkButton href="/demo" variant="outline">
            Voir la démo
          </LinkButton>
        </div>
      </div>
    </main>
  );
}
