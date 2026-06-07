import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Coffee,
  Scissors,
  Store,
  Wrench,
} from "lucide-react";
import { Differentiators } from "@/components/public/Differentiators";
import { FaqSection } from "@/components/public/FaqSection";
import { FeatureGrid } from "@/components/public/FeatureGrid";
import { HeroSection } from "@/components/public/HeroSection";
import { HowItWorks } from "@/components/public/HowItWorks";
import { MarketProofSection } from "@/components/public/MarketProofSection";
import { PricingCards } from "@/components/public/PricingCards";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicNav } from "@/components/public/PublicNav";
import { RoiCalculator } from "@/components/public/RoiCalculator";
import { Testimonials } from "@/components/public/Testimonials";
import { TrustStrip } from "@/components/public/TrustStrip";
import { LinkButton } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Reveal } from "@/components/ui/reveal";

const reasons = [
  "Carte impossible à perdre",
  "Expérience plus moderne",
  "Suivi client sans tableur",
  "Statistiques simples",
  "Plus de retours en commerce",
  "Fidélisation visible au comptoir",
];

const businesses = [
  { name: "Snacks", icon: Store, color: "bg-primary" },
  { name: "Restaurants", icon: Coffee, color: "bg-mint" },
  { name: "Barbiers", icon: Scissors, color: "bg-ink" },
  { name: "Garages", icon: Wrench, color: "bg-coral" },
];

const stats = [
  { value: 5, prefix: "", suffix: "×", label: "plus cher d'acquérir un client que de le fidéliser*" },
  { value: 25, prefix: "+", suffix: "%", label: "de profits possibles avec seulement +5% de rétention*" },
  { value: 48, prefix: "", suffix: "h", label: "pour lancer votre carte, QR compris" },
  { value: 0, prefix: "", suffix: " €", label: "pour vos clients, sans abonnement de leur côté" },
];

export default function HomePage() {
  return (
    <>
      <PublicNav />
      <main>
        <HeroSection />

        <TrustStrip />

        <section className="bg-white py-16">
          <div className="container-page">
            <Reveal>
              <div className="mx-auto mb-9 max-w-2xl text-center">
                <p className="text-sm font-black uppercase tracking-normal text-primary">
                  Pourquoi la fidélité paie
                </p>
                <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-ink sm:text-4xl">
                  Garder un client coûte moins cher que d&apos;en trouver un nouveau.
                </h2>
              </div>
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <Reveal key={stat.label} delay={index * 90}>
                  <div className="lift h-full rounded-2xl border border-border bg-surface-muted p-5">
                    <p className="text-4xl font-black tracking-tight text-ink">
                      <AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                    </p>
                    <p className="mt-2 text-sm font-semibold text-muted">{stat.label}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal>
              <p className="mt-6 text-center text-xs text-muted-2">
                * Ordres de grandeur issus des recherches sur la fidélisation client (Bain &amp;
                Company, F.&nbsp;Reichheld). Les valeurs 48&nbsp;h et 0&nbsp;€ correspondent à notre
                offre.
              </p>
            </Reveal>
          </div>
        </section>

        <HowItWorks />

        <RoiCalculator />

        <MarketProofSection />

        <Differentiators />

        <section className="bg-white py-20">
          <div className="container-page grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <Reveal>
              <div>
                <p className="text-sm font-black uppercase tracking-normal text-primary">
                  Pourquoi remplacer la carte papier ?
                </p>
                <h2 className="mt-3 text-4xl font-black leading-tight tracking-tight text-ink">
                  La carte papier finit dans une poche. La carte digitale ramène le client.
                </h2>
                <p className="mt-4 text-muted">
                  On garde la mécanique que les commerçants connaissent déjà, mais on enlève la
                  perte, le flou et le suivi manuel. Le résultat : un outil simple à présenter et
                  facile à adopter.
                </p>
              </div>
            </Reveal>

            <div className="grid gap-4 sm:grid-cols-2">
              {reasons.map((reason, index) => (
                <Reveal key={reason} delay={index * 60}>
                  <div
                    className={
                      index === 0
                        ? "lift rounded-2xl bg-ink p-5 text-white shadow-xl"
                        : "lift rounded-2xl border border-border bg-surface-muted p-5"
                    }
                  >
                    <CheckCircle2
                      aria-hidden
                      className={index === 0 ? "h-5 w-5 text-sun" : "h-5 w-5 text-mint"}
                    />
                    <p
                      className={
                        index === 0
                          ? "mt-4 font-black text-white"
                          : "mt-4 font-black text-ink"
                      }
                    >
                      {reason}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section-grid py-20">
          <div className="container-page">
            <Reveal>
              <div className="mb-9 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-normal text-primary">
                    Pour quels commerces ?
                  </p>
                  <h2 className="mt-3 max-w-2xl text-4xl font-black leading-tight tracking-tight text-ink">
                    Une seule logique, plusieurs métiers de proximité.
                  </h2>
                </div>
                <p className="max-w-md text-sm leading-6 text-muted">
                  Snacks, cafés, instituts, lavages auto, boulangeries ou garages : la logique reste
                  simple à expliquer, puis se personnalise selon la récompense du commerce.
                </p>
              </div>
            </Reveal>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {businesses.map((business, index) => {
                const Icon = business.icon;
                return (
                  <Reveal key={business.name} delay={index * 80}>
                    <div className="lift rounded-2xl border border-border bg-white p-5 shadow-sm">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-lg text-white shadow-lg ${business.color}`}
                      >
                        <Icon aria-hidden className="h-5 w-5" />
                      </div>
                      <h3 className="mt-6 text-xl font-black text-ink">{business.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        Carte personnalisée, QR code en caisse, récompense lisible, suivi dans
                        l&apos;admin.
                      </p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="container-page grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <Reveal>
              <div className="rounded-2xl border border-border bg-surface-muted p-5 shadow-sm">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-border">
                    <BadgeCheck aria-hidden className="h-5 w-5 text-mint" />
                    <p className="mt-6 text-3xl font-black text-ink">+1</p>
                    <p className="text-sm font-bold text-muted">tampon en caisse</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-border">
                    <BarChart3 aria-hidden className="h-5 w-5 text-primary" />
                    <p className="mt-6 text-3xl font-black text-ink">
                      <AnimatedCounter value={126} />
                    </p>
                    <p className="text-sm font-bold text-muted">tampons ce mois</p>
                  </div>
                  <div className="rounded-2xl bg-ink p-4 text-white shadow-md">
                    <Store aria-hidden className="h-5 w-5 text-sun" />
                    <p className="mt-6 text-3xl font-black">
                      <AnimatedCounter value={34} />
                    </p>
                    <p className="text-sm font-bold text-white/60">cartes créées</p>
                  </div>
                </div>
                <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-border">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-black text-ink">Dernière transaction</p>
                      <p className="mt-1 text-sm text-muted">
                        Sarah a débloqué « 1 menu offert »
                      </p>
                    </div>
                    <span className="rounded-full bg-mint-soft px-3 py-1 text-xs font-black text-mint">
                      récompense prête
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <div>
                <p className="text-sm font-black uppercase tracking-normal text-primary">
                  La promesse produit
                </p>
                <h2 className="mt-3 text-4xl font-black leading-tight tracking-tight text-ink">
                  Un outil que le commerçant comprend sans devoir expliquer la tech.
                </h2>
                <p className="mt-4 text-muted">
                  Le design sert la vente : un commerçant voit le QR, la carte, les tampons et les
                  stats en quelques secondes. C&apos;est volontairement direct.
                </p>
                <LinkButton href="/demo" className="mt-7" variant="dark">
                  Tester la démo
                  <ArrowRight aria-hidden className="h-5 w-5" />
                </LinkButton>
              </div>
            </Reveal>
          </div>
        </section>

        <FeatureGrid />

        <Testimonials />

        <section className="bg-surface-muted py-20">
          <div className="container-page">
            <Reveal>
              <div className="mb-9 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-normal text-primary">
                    Tarifs
                  </p>
                  <h2 className="mt-3 text-4xl font-black leading-tight tracking-tight text-ink">
                    Des offres lisibles pour vendre vite.
                  </h2>
                </div>
                <LinkButton href="/tarifs" variant="secondary">
                  Voir tous les tarifs
                </LinkButton>
              </div>
            </Reveal>
            <PricingCards compact />
          </div>
        </section>

        <FaqSection />

        <section className="relative overflow-hidden bg-ink py-20 text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 right-1/4 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(36,84,255,0.35),transparent_70%)] blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-[-160px] left-1/4 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(245,184,75,0.22),transparent_70%)] blur-3xl"
          />
          <div className="container-page relative flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
            <Reveal>
              <div className="max-w-2xl">
                <p className="text-sm font-black uppercase tracking-normal text-sun">
                  Prêt pour le commerce
                </p>
                <h2 className="mt-3 text-4xl font-black leading-tight tracking-tight">
                  Lancer ma carte fidélité digitale
                </h2>
                <p className="mt-4 text-white/70">
                  Un parcours clair, démontrable et prêt pour les commerces de proximité.
                </p>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="flex flex-col gap-3 sm:flex-row">
                <LinkButton href="/demo" size="lg" className="shimmer">
                  Essayer la démo en direct
                  <ArrowRight aria-hidden className="h-5 w-5" />
                </LinkButton>
                <LinkButton href="/contact" variant="outline" size="lg">
                  Demander une démo
                </LinkButton>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
