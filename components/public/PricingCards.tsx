import { CheckCircle2, Package, Rocket, Shield } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

const plans = [
  {
    name: "Starter",
    setup: "149 €",
    monthly: "29 €/mois",
    icon: Package,
    tone: "border-border",
    note: "Pour lancer une première carte fidélité propre dans un commerce.",
    items: [
      "Carte fidélité digitale",
      "QR code prêt à afficher",
      "Design aux couleurs du commerce",
      "Récompense personnalisée",
      "Support de lancement",
    ],
  },
  {
    name: "Pro",
    setup: "299 €",
    monthly: "59 €/mois",
    icon: Rocket,
    featured: true,
    tone: "border-primary",
    note: "Pour un commerce qui veut suivre ses clients et organiser son équipe.",
    items: [
      "Tout Starter",
      "Portail responsable complet",
      "Comptes staff pour scanner",
      "Base clients et consentements",
      "Statistiques mensuelles",
    ],
  },
  {
    name: "Premium",
    setup: "499 €",
    monthly: "99 €/mois",
    icon: Shield,
    tone: "border-ink",
    note: "Pour les commerces qui veulent un accompagnement plus poussé.",
    items: [
      "Tout Pro",
      "Kit affichage personnalisé",
      "Ajustements du programme",
      "Bilan mensuel simple",
      "Support prioritaire",
    ],
  },
];

export function PricingCards({ compact = false }: { compact?: boolean }) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {plans.map((plan, index) => {
        const Icon = plan.icon;
        return (
          <Reveal key={plan.name} delay={index * 90}>
            <div
              className={
                plan.featured
                  ? "relative h-full overflow-hidden rounded-lg border-2 border-primary bg-white p-6 shadow-[0_30px_60px_-18px_rgba(36,84,255,0.32)]"
                  : `relative h-full overflow-hidden rounded-lg border ${plan.tone} bg-white p-6 shadow-sm`
              }
            >
              {plan.featured ? (
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-black text-white shadow-md">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  Le plus choisi
                </span>
              ) : null}
              <div
                className={
                  plan.featured
                    ? "flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white shadow-lg"
                    : "flex h-12 w-12 items-center justify-center rounded-lg bg-ink text-white"
                }
              >
                <Icon aria-hidden className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-2xl font-black text-ink">{plan.name}</h3>
              <p className="mt-2 min-h-12 text-sm leading-6 text-muted">{plan.note}</p>
              <div className="mt-6 border-y border-border py-5">
                <p className="text-4xl font-black tracking-tight text-ink">{plan.setup}</p>
                <p className="mt-1 text-sm font-bold text-muted">
                  installation + {plan.monthly}
                </p>
              </div>
              <ul className="mt-5 space-y-3 text-sm text-ink-2">
                {plan.items.slice(0, compact ? 4 : undefined).map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-mint" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <LinkButton
                href="/contact"
                className="mt-6 w-full"
                variant={plan.featured ? "primary" : "secondary"}
              >
                Demander une démo
              </LinkButton>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
