import { ArrowRight } from "lucide-react";
import { DemoLoyaltyCard } from "@/components/public/DemoLoyaltyCard";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicNav } from "@/components/public/PublicNav";
import { LinkButton } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export const metadata = {
  title: "Démonstration",
  description:
    "Démonstration interactive d'une carte fidélité digitale : ajoutez des tampons, débloquez une récompense.",
};

export default function DemoPage() {
  return (
    <>
      <PublicNav />
      <main className="section-grid py-14">
        <div className="container-page">
          <Reveal>
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-normal text-primary">
                Démonstration interactive
              </p>
              <h1 className="mt-3 text-5xl font-black leading-tight tracking-tight text-ink">
                Snack Démo,{" "}
                <span className="bg-[linear-gradient(120deg,#2454ff,#7c3aed)] bg-clip-text text-transparent">
                  prêt pour un rendez-vous terrain
                </span>
                .
              </h1>
              <p className="mt-4 text-muted">
                Carte avec progression 4/10, récompense « 10 tampons = 1 menu offert », et actions
                fictives pour montrer la mécanique. Cliquez sur <strong>Ajouter un tampon</strong>{" "}
                jusqu&apos;à 10 pour déclencher la récompense.
              </p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-8">
              <DemoLoyaltyCard />
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-10 flex flex-col gap-4 rounded-2xl bg-ink p-6 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-black">Convaincu par la mécanique ?</p>
                <p className="mt-1 text-sm text-white/70">
                  On crée votre carte personnalisée (couleurs, logo, récompense), prête en 48h.
                </p>
              </div>
              <LinkButton href="/contact" size="lg" className="shimmer">
                Demander une démo
                <ArrowRight aria-hidden className="h-5 w-5" />
              </LinkButton>
            </div>
          </Reveal>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
