import { ArrowRight, BellRing, MapPin, Smartphone } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

const items = [
  {
    badge: "Inclus",
    title: "Notifications push incluses",
    text: "Envoyez une offre directement sur le téléphone de vos clients abonnés — sans SMS payant ni application à installer. La relance qui fait revenir, au bon moment.",
    icon: BellRing,
    accent: "from-primary to-violet",
  },
  {
    badge: "Acquisition",
    title: "« Près de vous »",
    text: "Les clients autour de votre commerce vous découvrent sur la carte Fidélise-moi. Pas seulement de la fidélisation : un vrai canal pour attirer de nouveaux clients.",
    icon: MapPin,
    accent: "from-mint to-primary",
  },
  {
    badge: "Sans friction",
    title: "Zéro app, zéro wallet à configurer",
    text: "Un simple lien : le client n'installe rien et ne paramètre aucun pass. 0 € pour lui, prêt en 48 h pour vous. La simplicité comme avantage.",
    icon: Smartphone,
    accent: "from-coral to-sun",
  },
];

export function Differentiators() {
  return (
    <section className="bg-surface-muted py-20">
      <div className="container-page">
        <Reveal>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-black uppercase tracking-normal text-primary">
                Ce qui nous différencie
              </p>
              <h2 className="mt-3 text-4xl font-black leading-tight tracking-tight text-ink">
                Plus qu&apos;une carte à tampons : un canal qui ramène le client.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-muted">
              Là où la plupart des solutions s&apos;arrêtent à la carte, on ajoute la relance, la
              découverte et une simplicité radicale — sans surcoût pour vos clients.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={index * 90}>
                <div className="lift group relative h-full overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-sm">
                  <div
                    aria-hidden
                    className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${item.accent} opacity-20 blur-2xl transition group-hover:opacity-40`}
                  />
                  <div className="relative flex items-center justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${item.accent} text-white shadow-lg`}
                    >
                      <Icon aria-hidden className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-black uppercase tracking-normal text-ink ring-1 ring-border">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="relative mt-6 text-xl font-black text-ink">{item.title}</h3>
                  <p className="relative mt-2 text-sm leading-7 text-muted">{item.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={120}>
          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <LinkButton href="/nearby" variant="secondary">
              Voir « Près de vous »
              <ArrowRight aria-hidden className="h-5 w-5" />
            </LinkButton>
            <LinkButton href="/demo" variant="ghost">
              Tester le parcours complet
            </LinkButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
