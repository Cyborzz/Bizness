import {
  BarChart3,
  History,
  LayoutDashboard,
  QrCode,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Users,
} from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

const features = [
  {
    title: "QR code commerce",
    text: "Un lien public par commerce, prêt pour affichage au comptoir ou partage direct.",
    icon: QrCode,
    accent: "from-primary to-violet",
  },
  {
    title: "Carte mobile",
    text: "Une carte consultable depuis le téléphone du client, avec progression et récompense.",
    icon: Smartphone,
    accent: "from-mint to-primary",
  },
  {
    title: "Scan staff",
    text: "Un accès limité pour ajouter des tampons sans ouvrir tout le portail commerce.",
    icon: ScanLine,
    accent: "from-coral to-sun",
  },
  {
    title: "Base clients",
    text: "Recherche par prénom, téléphone ou email, avec consentement marketing visible.",
    icon: Users,
    accent: "from-violet to-coral",
  },
  {
    title: "Portail responsable",
    text: "Le responsable suit son commerce, son équipe, ses clients et son programme.",
    icon: LayoutDashboard,
    accent: "from-primary to-mint",
  },
  {
    title: "Historique",
    text: "Chaque tampon, récompense et action importante reste traçable.",
    icon: History,
    accent: "from-sun to-primary",
  },
  {
    title: "Données protégées",
    text: "Les accès sont séparés par rôle et par commerce pour éviter les mauvaises surprises.",
    icon: ShieldCheck,
    accent: "from-mint to-violet",
  },
  {
    title: "Statistiques utiles",
    text: "Cartes créées, tampons distribués et récompenses disponibles en un coup d'oeil.",
    icon: BarChart3,
    accent: "from-coral to-primary",
  },
];

export function FeatureGrid() {
  return (
    <section className="bg-ink py-20 text-white">
      <div className="container-page">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-sm font-black uppercase tracking-normal text-sun">
                Fonctionnalités
              </p>
              <h2 className="mt-3 text-4xl font-black leading-tight tracking-tight">
                Tout ce qu&apos;il faut pour faire tourner une carte fidélité en commerce.
              </h2>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <p className="max-w-sm text-sm leading-6 text-white/60">
              L&apos;outil reste volontairement simple : un client, une carte, des tampons, une équipe
              et des chiffres que le responsable comprend vite.
            </p>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Reveal key={feature.title} delay={(index % 4) * 70}>
                <div className="group h-full rounded-lg border border-white/10 bg-white/[0.04] p-5 transition hover:bg-white hover:text-ink">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br ${feature.accent} text-white shadow-lg`}
                  >
                    <Icon aria-hidden className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-black">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/60 group-hover:text-muted">
                    {feature.text}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
