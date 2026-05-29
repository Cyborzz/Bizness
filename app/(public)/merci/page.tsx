import { CheckCircle2 } from "lucide-react";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicNav } from "@/components/public/PublicNav";
import { LinkButton } from "@/components/ui/button";

export const metadata = {
  title: "Merci",
};

export default function ThanksPage() {
  return (
    <>
      <PublicNav />
      <main className="section-grid py-16">
        <div className="container-page max-w-2xl text-center">
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mint-soft text-mint shadow-[var(--shadow-glow-mint)] animate-pulse-ring-mint">
            <CheckCircle2 aria-hidden className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-5xl font-black tracking-tight text-ink animate-fade-in-up">
            Demande reçue
          </h1>
          <p className="mt-4 text-muted animate-fade-in-up" style={{ animationDelay: "80ms" }}>
            La demande est enregistrée. Ton associé peut reprendre le contact rapidement.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <LinkButton href="/demo">Voir la démonstration</LinkButton>
            <LinkButton href="/" variant="secondary">
              Retour à l&apos;accueil
            </LinkButton>
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
