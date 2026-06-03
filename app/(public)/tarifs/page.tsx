import { CheckCircle2, HelpCircle } from "lucide-react";
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

const tips = [
  {
    title: "Starter",
    text: "Pour tester rapidement une carte digitale dans un petit commerce avec une règle simple.",
  },
  {
    title: "Pro",
    text: "Pour un commerce qui a une équipe, veut scanner en caisse et suivre ses clients.",
  },
  {
    title: "Premium",
    text: "Pour un commerce qui veut un accompagnement plus régulier et un kit visuel plus complet.",
  },
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
                Des offres simples, avec installation comprise.
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
            <div className="mt-12 rounded-lg border border-border bg-white p-6 shadow-sm">
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

          <Reveal delay={260}>
            <section className="mt-12">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-primary shadow-sm ring-1 ring-border">
                  <HelpCircle aria-hidden className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-normal text-primary">
                    Comment choisir
                  </p>
                  <h2 className="text-2xl font-black text-ink">
                    La bonne formule dépend surtout de l&apos;équipe.
                  </h2>
                </div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {tips.map((tip) => (
                  <div
                    key={tip.title}
                    className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-border"
                  >
                    <h3 className="font-black text-ink">{tip.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted">{tip.text}</p>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
