import { ArrowRight, QrCode, Smartphone, Stamp, Trophy } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

const steps = [
  {
    title: "QR visible en caisse",
    text: "Le commerce affiche son QR code au comptoir, sur un chevalet ou un sticker.",
    icon: QrCode,
    accent: "bg-primary",
  },
  {
    title: "Carte créée en 20 secondes",
    text: "Le client renseigne son prénom et un contact. Pas d'application à télécharger.",
    icon: Smartphone,
    accent: "bg-mint",
  },
  {
    title: "Tampon ajouté par le staff",
    text: "L'employé scanne la carte du client et ajoute uniquement le tampon du passage.",
    icon: Stamp,
    accent: "bg-coral",
  },
  {
    title: "Récompense débloquée",
    text: "La progression est claire et la récompense motive le prochain retour.",
    icon: Trophy,
    accent: "bg-sun",
  },
];

export function HowItWorks() {
  return (
    <section id="fonctionnement" className="section-grid bg-surface-muted py-20">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <p className="text-sm font-black uppercase tracking-normal text-primary">
                Comment ça marche
              </p>
              <h2 className="mt-3 max-w-md text-4xl font-black leading-tight tracking-tight text-ink">
                Un parcours simple au comptoir.
              </h2>
              <p className="mt-4 max-w-md text-muted">
                Le commerçant affiche son QR code. Le client crée sa carte. Le staff ajoute les
                tampons. Le responsable garde le suivi.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black uppercase text-ink ring-1 ring-border">
                <span className="h-2 w-2 animate-pulse rounded-full bg-mint" />
                Déploiement rapide
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
                    <div className="relative rounded-lg border border-border bg-white p-5 shadow-sm">
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
