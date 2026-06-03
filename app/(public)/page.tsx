import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Coffee,
  QrCode,
  Scissors,
  Smartphone,
  Store,
  Wrench,
} from "lucide-react";
import { FeatureGrid } from "@/components/public/FeatureGrid";
import { HeroSection } from "@/components/public/HeroSection";
import { HowItWorks } from "@/components/public/HowItWorks";
import { PricingCards } from "@/components/public/PricingCards";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicNav } from "@/components/public/PublicNav";
import { LinkButton } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Reveal } from "@/components/ui/reveal";

const stats = [
  { value: 20, suffix: " sec", label: "pour créer une carte client" },
  { value: 48, suffix: " h", label: "pour lancer un commerce" },
  { value: 0, suffix: " appli", label: "à installer côté client" },
  { value: 3, suffix: " rôles", label: "admin, responsable, staff" },
];

const comparisons = [
  {
    paper: "La carte papier se perd, s'oublie et ne donne aucune donnée.",
    digital: "La carte mobile reste accessible et garde la progression claire.",
  },
  {
    paper: "Le commerçant tamponne sans savoir qui revient vraiment.",
    digital: "Chaque passage laisse un historique lisible dans le portail.",
  },
  {
    paper: "Impossible de gérer proprement les employés et les responsables.",
    digital: "Le staff peut scanner, le responsable garde le contrôle complet.",
  },
  {
    paper: "Les récompenses sont difficiles à suivre quand le commerce grandit.",
    digital: "Les tampons, récompenses et clients sont centralisés au même endroit.",
  },
];

const businesses = [
  {
    name: "Restaurants & snacks",
    icon: Coffee,
    color: "bg-primary",
    text: "Un QR au comptoir, un tampon après le passage, une récompense simple à comprendre.",
    example: "10 menus = 1 offert",
  },
  {
    name: "Barbiers & coiffeurs",
    icon: Scissors,
    color: "bg-ink",
    text: "Le client suit ses visites, l'équipe valide en quelques secondes après la prestation.",
    example: "6 coupes = 1 remise",
  },
  {
    name: "Instituts & beauté",
    icon: Store,
    color: "bg-mint",
    text: "Un programme propre pour encourager les retours sans multiplier les cartes papier.",
    example: "5 soins = 1 avantage",
  },
  {
    name: "Garages & services",
    icon: Wrench,
    color: "bg-coral",
    text: "Un suivi clair pour les clients réguliers, même quand plusieurs employés interviennent.",
    example: "4 passages = 1 contrôle",
  },
];

const productViews = [
  {
    title: "Carte client",
    text: "Le client voit ses tampons, sa récompense et son historique depuis son téléphone.",
    icon: Smartphone,
    items: ["Progression claire", "Lien personnel", "Aucune application"],
  },
  {
    title: "Mode staff",
    text: "L'employé scanne le QR du client et ajoute uniquement le tampon, sans accéder au reste.",
    icon: QrCode,
    items: ["Scan rapide", "Action limitée", "Historique automatique"],
  },
  {
    title: "Portail responsable",
    text: "Le commerce pilote ses clients, son équipe, ses statistiques et son programme fidélité.",
    icon: BarChart3,
    items: ["Clients", "Statistiques", "Gestion équipe"],
  },
];

const faqs = [
  {
    question: "Le client doit-il installer une application ?",
    answer:
      "Non. Il scanne un QR code, crée sa carte depuis son téléphone et peut revenir avec son lien personnel.",
  },
  {
    question: "Un employé peut-il accéder à tout le portail ?",
    answer:
      "Non. Le rôle staff sert uniquement au scan et à l'ajout de tampons. Le responsable garde l'accès complet au commerce.",
  },
  {
    question: "Combien de temps faut-il pour lancer un commerce ?",
    answer:
      "Le commerce peut être configuré rapidement avec son logo, ses couleurs, son QR code et sa règle de récompense.",
  },
  {
    question: "Les données clients sont-elles protégées ?",
    answer:
      "Oui. Chaque commerce voit uniquement ses données, avec des accès séparés et un suivi des actions importantes.",
  },
];

export default function HomePage() {
  return (
    <>
      <PublicNav />
      <main>
        <HeroSection />

        <section className="bg-white py-12">
          <div className="container-page grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <Reveal key={stat.label} delay={index * 80}>
                <div className="rounded-lg border border-border bg-surface-muted p-5">
                  <p className="text-4xl font-black tracking-tight text-ink">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="mt-2 text-sm font-semibold text-muted">{stat.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <HowItWorks />

        <section className="bg-white py-20">
          <div className="container-page">
            <Reveal>
              <div className="max-w-3xl">
                <p className="text-sm font-black uppercase tracking-normal text-primary">
                  Papier ou digital
                </p>
                <h2 className="mt-3 text-4xl font-black leading-tight tracking-tight text-ink">
                  Gardez la simplicité de la carte à tampons, retirez tout ce qui ralentit.
                </h2>
                <p className="mt-4 text-muted">
                  Fidélise-moi parle le langage du comptoir : un QR code visible, une carte mobile,
                  des tampons faciles à valider et un suivi clair pour le responsable.
                </p>
              </div>
            </Reveal>

            <div className="mt-10 grid gap-4 lg:grid-cols-2">
              <Reveal>
                <div className="rounded-lg border border-border bg-surface-muted p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-muted shadow-sm">
                      <ClipboardCheck aria-hidden className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-black text-ink">Carte papier</h3>
                  </div>
                  <ul className="mt-5 space-y-3">
                    {comparisons.map((item) => (
                      <li key={item.paper} className="flex gap-3 text-sm leading-6 text-muted">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-2" />
                        {item.paper}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              <Reveal delay={120}>
                <div className="rounded-lg border border-primary bg-white p-5 shadow-[0_24px_55px_-24px_rgba(36,84,255,0.45)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white shadow-lg">
                      <BadgeCheck aria-hidden className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-black text-ink">Fidélise-moi</h3>
                  </div>
                  <ul className="mt-5 space-y-3">
                    {comparisons.map((item) => (
                      <li key={item.digital} className="flex gap-3 text-sm leading-6 text-ink">
                        <CheckCircle2
                          aria-hidden
                          className="mt-0.5 h-4 w-4 shrink-0 text-mint"
                        />
                        {item.digital}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section id="cas-metiers" className="section-grid py-20">
          <div className="container-page">
            <Reveal>
              <div className="mb-9 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-normal text-primary">
                    Cas métiers
                  </p>
                  <h2 className="mt-3 max-w-2xl text-4xl font-black leading-tight tracking-tight text-ink">
                    Un programme adapté aux commerces de proximité.
                  </h2>
                </div>
                <p className="max-w-md text-sm leading-6 text-muted">
                  Le même socle fonctionne pour plusieurs métiers : on personnalise le nom, les
                  couleurs, le seuil de tampons et la récompense.
                </p>
              </div>
            </Reveal>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {businesses.map((business, index) => {
                const Icon = business.icon;
                return (
                  <Reveal key={business.name} delay={index * 80}>
                    <div className="h-full rounded-lg border border-border bg-white p-5 shadow-sm">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-lg text-white shadow-lg ${business.color}`}
                      >
                        <Icon aria-hidden className="h-5 w-5" />
                      </div>
                      <h3 className="mt-6 text-xl font-black text-ink">{business.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted">{business.text}</p>
                      <p className="mt-5 rounded-lg bg-surface-muted px-3 py-2 text-sm font-black text-ink">
                        {business.example}
                      </p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="container-page">
            <Reveal>
              <div className="max-w-3xl">
                <p className="text-sm font-black uppercase tracking-normal text-primary">
                  Produit
                </p>
                <h2 className="mt-3 text-4xl font-black leading-tight tracking-tight text-ink">
                  Trois vues, trois usages, un seul outil.
                </h2>
                <p className="mt-4 text-muted">
                  Le client garde sa carte. Le staff valide les passages. Le responsable pilote le
                  commerce sans donner trop d&apos;accès à son équipe.
                </p>
              </div>
            </Reveal>

            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {productViews.map((view, index) => {
                const Icon = view.icon;
                return (
                  <Reveal key={view.title} delay={index * 90}>
                    <div className="h-full rounded-lg border border-border bg-surface-muted p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-primary shadow-sm">
                          <Icon aria-hidden className="h-5 w-5" />
                        </div>
                        <h3 className="text-xl font-black text-ink">{view.title}</h3>
                      </div>
                      <p className="mt-4 text-sm leading-6 text-muted">{view.text}</p>
                      <ul className="mt-5 space-y-2">
                        {view.items.map((item) => (
                          <li key={item} className="flex items-center gap-2 text-sm font-semibold text-ink">
                            <CheckCircle2 aria-hidden className="h-4 w-4 text-mint" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <FeatureGrid />

        <section id="tarifs" className="bg-surface-muted py-20">
          <div className="container-page">
            <Reveal>
              <div className="mb-9 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-normal text-primary">
                    Tarifs
                  </p>
                  <h2 className="mt-3 text-4xl font-black leading-tight tracking-tight text-ink">
                    Des offres claires, installation comprise.
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

        <section id="faq" className="bg-white py-20">
          <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <Reveal>
              <div>
                <p className="text-sm font-black uppercase tracking-normal text-primary">
                  Questions fréquentes
                </p>
                <h2 className="mt-3 text-4xl font-black leading-tight tracking-tight text-ink">
                  Les réponses que les commerces demandent avant de signer.
                </h2>
                <p className="mt-4 text-muted">
                  Le site doit rassurer rapidement sur l&apos;installation, les rôles, la donnée client
                  et l&apos;usage en caisse.
                </p>
              </div>
            </Reveal>

            <div className="grid gap-3">
              {faqs.map((faq, index) => (
                <Reveal key={faq.question} delay={index * 70}>
                  <div className="rounded-lg border border-border bg-surface-muted p-5">
                    <h3 className="font-black text-ink">{faq.question}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted">{faq.answer}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-ink py-20 text-white">
          <div className="container-page flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
            <Reveal>
              <div className="max-w-2xl">
                <p className="text-sm font-black uppercase tracking-normal text-sun">
                  Lancement commerce
                </p>
                <h2 className="mt-3 text-4xl font-black leading-tight tracking-tight">
                  Transformez une carte papier en expérience mobile.
                </h2>
                <p className="mt-4 text-white/70">
                  On configure le commerce, le QR code, les rôles équipe et la récompense. Le
                  responsable peut ensuite suivre l&apos;activité depuis son portail.
                </p>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <LinkButton href="/contact" size="lg" className="shimmer">
                Demander une démo
                <ArrowRight aria-hidden className="h-5 w-5" />
              </LinkButton>
            </Reveal>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
