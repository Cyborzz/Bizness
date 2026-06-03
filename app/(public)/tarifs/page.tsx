import { CheckCircle2 } from "lucide-react";
import { PricingCards } from "@/components/public/PricingCards";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicNav } from "@/components/public/PublicNav";
import { Reveal } from "@/components/ui/reveal";

export const metadata = {
  title: "Tarifs",
  description:
    "Trois offres simples pour démarrer une carte fidélité digitale dans votre commerce local.",
};

const includes = [
  "QR code haute résolution prêt à imprimer",
  "Configuration du commerce et de la récompense",
  "Accès responsable et comptes staff",
  "Mises à jour produit incluses",
];

export default function PricingPage() {
  return (
    <>
      <PublicNav />
      <main className="section-grid py-14">
        <div className="container-page">
          <Reveal>
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-normal text-primary">Tarifs</p>
              <h1 className="mt-3 text-5xl font-black leading-tight tracking-tight text-ink">
                Trois offres simples pour démarrer.
              </h1>
              <p className="mt-4 text-muted">
                Chaque formule inclut la création du commerce, la carte digitale, le QR code et les
                accès nécessaires pour utiliser le programme au comptoir.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="mt-8">
              <PricingCards />
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-12 rounded-2xl border border-border bg-white p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-normal text-primary">
                Inclus dans chaque offre
              </p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {includes.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm font-semibold text-ink">
                    <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-mint" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
