import {
  BarChart3,
  History,
  LayoutDashboard,
  QrCode,
  Settings2,
  ShieldCheck,
  Smartphone,
  Users,
} from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

const features = [
  {
    title: "QR code caisse",
    text: "Lien public par commerce, prêt pour impression ou affichage.",
    icon: QrCode,
    accent: "from-primary to-violet",
  },
  {
    title: "Carte mobile",
    text: "Une carte élégante, consultable depuis le lien du client.",
    icon: Smartphone,
    accent: "from-mint to-primary",
  },
  {
    title: "Récompenses",
    text: "Tampons requis, libellé et couleur personnalisables.",
    icon: Settings2,
    accent: "from-coral to-sun",
  },
  {
    title: "Gestion client",
    text: "Recherche par prénom, téléphone ou email avec consentements.",
    icon: Users,
    accent: "from-violet to-coral",
  },
  {
    title: "Dashboard",
    text: "Les chiffres essentiels pour piloter sans complexité.",
    icon: LayoutDashboard,
    accent: "from-primary to-mint",
  },
  {
    title: "Historique",
    text: "Chaque action laisse une trace lisible pour le commerçant.",
    icon: History,
    accent: "from-sun to-primary",
  },
  {
    title: "RLS Supabase",
    text: "Données isolées par commerce, rôle super admin, owner et staff.",
    icon: ShieldCheck,
    accent: "from-mint to-violet",
  },
  {
    title: "Stats MVP",
    text: "Cartes créées, tampons distribués, récompenses disponibles.",
    icon: BarChart3,
    accent: "from-coral to-primary",
  },
];

export function FeatureGrid() {
  return (
    <section className="relative overflow-hidden bg-ink py-20 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.30),transparent_70%)] blur-3xl"
      />
      <div className="container-page relative">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-sm font-black uppercase tracking-normal text-sun">
                Fonctionnalités
              </p>
              <h2 className="mt-3 text-4xl font-black leading-tight tracking-tight">
                Le kit complet pour lancer un commerce en une après-midi.
              </h2>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <p className="max-w-sm text-sm leading-6 text-white/60">
              La V1 reste volontairement serrée : tout ce qui aide à vendre et démontrer, rien qui
              ralentit la sortie.
            </p>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Reveal key={feature.title} delay={(index % 4) * 70}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:bg-white hover:text-ink">
                  <div
                    aria-hidden
                    className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${feature.accent} opacity-30 blur-2xl transition group-hover:opacity-70`}
                  />
                  <div
                    className={`relative flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br ${feature.accent} text-white shadow-lg`}
                  >
                    <Icon aria-hidden className="h-5 w-5" />
                  </div>
                  <h3 className="relative mt-5 text-lg font-black">{feature.title}</h3>
                  <p className="relative mt-2 text-sm leading-6 text-white/60 group-hover:text-muted">
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
