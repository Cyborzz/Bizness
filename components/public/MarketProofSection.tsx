import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardX,
  QrCode,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Stamp,
} from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

const painPoints = [
  {
    title: "Cartes papier perdues",
    text: "Le client oublie sa carte, le commerce perd une occasion de le faire revenir.",
    icon: ClipboardX,
  },
  {
    title: "Aucune donnée exploitable",
    text: "Impossible de savoir qui revient, qui décroche, ou quelles récompenses circulent.",
    icon: BarChart3,
  },
  {
    title: "Gestion équipe floue",
    text: "Un employé doit pouvoir tamponner sans accéder aux réglages du commerce.",
    icon: ShieldCheck,
  },
];

const journey = [
  { label: "QR au comptoir", icon: QrCode },
  { label: "Carte mobile", icon: Smartphone },
  { label: "Scan staff", icon: ScanLine },
  { label: "Tampon validé", icon: Stamp },
];

const comparison = [
  { label: "Aucune app client", paper: false, digital: true },
  { label: "Carte impossible à perdre", paper: false, digital: true },
  { label: "Historique des passages", paper: false, digital: true },
  { label: "Accès staff limité", paper: false, digital: true },
  { label: "QR imprimable", paper: true, digital: true },
];

export function MarketProofSection() {
  return (
    <section className="bg-white py-20">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <div>
              <p className="text-sm font-black uppercase tracking-normal text-primary">
                Pourquoi changer
              </p>
              <h2 className="mt-3 text-4xl font-black leading-tight tracking-tight text-ink">
                Le papier garde l&apos;habitude. Le digital ajoute le suivi.
              </h2>
              <p className="mt-4 text-muted">
                Les meilleurs outils du marché montrent la même chose : le commerçant veut un
                parcours simple au comptoir, une carte que le client garde vraiment et des données
                lisibles sans se compliquer la vie.
              </p>

              <div className="mt-7 grid gap-3">
                {painPoints.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Reveal key={item.title} delay={index * 70}>
                      <div className="rounded-lg border border-border bg-surface-muted p-4">
                        <div className="flex gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-primary shadow-sm">
                            <Icon aria-hidden className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-black text-ink">{item.title}</h3>
                            <p className="mt-1 text-sm leading-6 text-muted">{item.text}</p>
                          </div>
                        </div>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="overflow-hidden rounded-2xl border border-border bg-ink p-5 text-white shadow-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase text-sun">Parcours en service</p>
                  <h3 className="mt-2 text-2xl font-black tracking-tight">
                    Tout se joue en quelques secondes.
                  </h3>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/70">
                  sans app client
                </span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-4">
                {journey.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.label}
                      className="relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] p-4"
                    >
                      {index === 0 ? (
                        <span
                          aria-hidden
                          className="animate-scan-line absolute inset-x-3 top-0 h-0.5 rounded-full bg-sun"
                        />
                      ) : null}
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-ink">
                        <Icon aria-hidden className="h-5 w-5" />
                      </div>
                      <p className="mt-5 text-sm font-black">{step.label}</p>
                      <p className="mt-1 text-xs font-bold uppercase text-white/35">0{index + 1}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 rounded-lg bg-white p-4 text-ink">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase text-muted-2">Action staff</p>
                    <p className="mt-1 text-lg font-black">+1 tampon ajouté</p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-mint-soft text-mint animate-pulse-ring-mint">
                    <CheckCircle2 aria-hidden className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-muted">
                  <div className="h-full w-[70%] rounded-full bg-[linear-gradient(90deg,#2454ff,#18a77a)] animate-gradient" />
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={180}>
          <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-surface-muted shadow-sm">
            <div className="grid grid-cols-[1.1fr_0.55fr_0.55fr] border-b border-border bg-white px-5 py-4 text-sm font-black text-ink">
              <span>Comparaison rapide</span>
              <span>Carte papier</span>
              <span>Fidélise-moi</span>
            </div>
            {comparison.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-[1.1fr_0.55fr_0.55fr] items-center border-b border-border px-5 py-4 text-sm last:border-b-0"
              >
                <span className="font-semibold text-ink">{row.label}</span>
                <span className={row.paper ? "font-black text-mint" : "font-black text-muted-2"}>
                  {row.paper ? "Oui" : "Non"}
                </span>
                <span className={row.digital ? "font-black text-mint" : "font-black text-muted-2"}>
                  {row.digital ? "Oui" : "Non"}
                </span>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={240}>
          <div className="mt-8 flex flex-col gap-3 rounded-2xl bg-primary p-5 text-white shadow-[var(--shadow-glow-primary)] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black">Ce qu&apos;on met maintenant plus en avant</p>
              <p className="mt-1 text-sm text-white/75">
                Simplicité au comptoir, rôle staff limité, carte mobile et suivi responsable.
              </p>
            </div>
            <ArrowRight aria-hidden className="h-6 w-6 shrink-0" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
