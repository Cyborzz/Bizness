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
  "Hébergement sécurisé Supabase",
  "QR code haute résolution prêt à imprimer",
  "Mises à jour produit incluses",
  "Sans engagement de durée",
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
                Stripe est prévu pour une V2. Pour le MVP, chaque offre déclenche une demande de
                démo et un suivi commercial personnalisé.
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
