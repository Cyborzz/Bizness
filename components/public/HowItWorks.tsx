import { ArrowRight, QrCode, Smartphone, Stamp, Trophy } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

const steps = [
  {
    title: "Scan en caisse",
    text: "Le QR code reste visible au comptoir, sur chevalet ou sticker.",
    icon: QrCode,
    accent: "bg-primary",
  },
  {
    title: "Carte en 20 secondes",
    text: "Le client renseigne son prénom et un contact. Pas de téléchargement.",
    icon: Smartphone,
    accent: "bg-mint",
  },
  {
    title: "Tampon immédiat",
    text: "Le staff retrouve la carte, ajoute un tampon et l'historique se met à jour.",
    icon: Stamp,
    accent: "bg-coral",
  },
  {
    title: "Retour motivé",
    text: "La progression est claire, la récompense devient tangible.",
    icon: Trophy,
    accent: "bg-sun",
  },
];

export function HowItWorks() {
  return (
    <section className="section-grid bg-surface-muted py-20">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <p className="text-sm font-black uppercase tracking-normal text-primary">
                Comment ça marche
              </p>
              <h2 className="mt-3 max-w-md text-4xl font-black leading-tight tracking-tight text-ink">
                Un parcours terrain, pas un tunnel SaaS abstrait.
              </h2>
              <p className="mt-4 max-w-md text-muted">
                Tout doit se comprendre en face d&apos;un commerçant pressé : QR, carte, tampon,
                récompense. Pas de jargon, pas d&apos;app à installer.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black uppercase text-ink ring-1 ring-border">
                <span className="h-2 w-2 animate-pulse rounded-full bg-mint" />
                Déploiement en 48h
              </div>
            </div>
          </Reveal>

          <div className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute left-6 top-8 hidden h-[calc(100%-64px)] w-px bg-[linear-gradient(180deg,var(--color-primary),var(--color-mint),var(--color-coral),var(--color-sun))] opacity-50 sm:block"
            />
            <div className="space-y-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <Reveal key={step.title} delay={index * 90}>
                    <div className="lift relative rounded-lg border border-border bg-white p-5 shadow-sm">
                      <div className="flex gap-4">
                        <div
                          className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-white shadow-lg ${step.accent}`}
                        >
                          <Icon aria-hidden className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-black text-muted">
                              0{index + 1}
                            </span>
                            <h3 className="text-xl font-black text-ink">{step.title}</h3>
                          </div>
                          <p className="mt-2 text-muted">{step.text}</p>
                        </div>
                        {index < steps.length - 1 ? (
                          <ArrowRight aria-hidden className="mt-3 hidden h-5 w-5 text-border-strong lg:block" />
                        ) : null}
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
