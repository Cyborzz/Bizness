import Image from "next/image";
import {
  ArrowRight,
  Check,
  MousePointerClick,
  PlayCircle,
  QrCode,
  Sparkles,
  Stamp,
} from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

const proof = [
  { label: "Installation", value: "48h" },
  { label: "Support terrain", value: "QR + affichage" },
  { label: "Parcours client", value: "sans app" },
];

function PhoneMockup() {
  return (
    <div className="animate-float relative mx-auto w-full max-w-[320px]">
      <div className="absolute -inset-4 -z-10 rounded-[44px] bg-[radial-gradient(circle_at_30%_20%,rgba(36,84,255,0.45),transparent_60%),radial-gradient(circle_at_80%_70%,rgba(245,184,75,0.32),transparent_60%)] blur-2xl" />
      <div className="rounded-[34px] border border-white/15 bg-gray-950 p-2 shadow-[0_40px_100px_rgba(0,0,0,0.42)]">
        <div className="overflow-hidden rounded-[28px] bg-[#f8fafc]">
          <div className="flex items-center justify-between bg-ink px-5 py-4 text-white">
            <div>
              <p className="text-xs font-bold uppercase text-white/55">Snack Démo</p>
              <p className="text-lg font-black">Carte fidélité</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-ink text-sm font-black">
              SD
            </div>
          </div>
          <div className="p-4">
            <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-border">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-bold uppercase text-muted-2">Progression</p>
                  <p className="text-4xl font-black tracking-normal text-ink">7/10</p>
                </div>
                <span className="rounded-full bg-sun-soft px-3 py-1 text-xs font-black text-[#9a5b00]">
                  3 passages
                </span>
              </div>
              <div className="mt-5 grid grid-cols-5 gap-2">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div
                    key={index}
                    style={{ animationDelay: `${index * 60}ms` }}
                    className={
                      index < 7
                        ? "animate-stamp-pop flex aspect-square items-center justify-center rounded-full bg-ink text-white"
                        : "flex aspect-square items-center justify-center rounded-full border border-border bg-surface-muted text-xs font-bold text-muted-2"
                    }
                  >
                    {index < 7 ? <Check aria-hidden className="h-3.5 w-3.5" /> : index + 1}
                  </div>
                ))}
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#2454ff,#7c3aed,#18a77a)] animate-gradient"
                  style={{ width: "70%" }}
                />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-mint-soft p-3">
                <p className="text-[11px] font-bold uppercase text-mint">Récompense</p>
                <p className="mt-1 text-sm font-black text-ink">1 menu offert</p>
              </div>
              <div className="rounded-lg bg-primary-soft p-3">
                <p className="text-[11px] font-bold uppercase text-primary-dark">Historique</p>
                <p className="mt-1 text-sm font-black text-ink">+1 ce matin</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CounterMockup() {
  return (
    <div className="glass-panel absolute -left-3 bottom-6 hidden w-56 rounded-lg p-4 text-white sm:block lg:-left-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-ink">
          <QrCode aria-hidden className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-black">QR caisse</p>
          <p className="text-xs text-white/60">/c/snack-demo</p>
        </div>
      </div>
      <div className="relative mt-4 grid grid-cols-4 gap-1 overflow-hidden rounded-sm">
        <span
          aria-hidden
          className="animate-scan-line absolute inset-x-0 top-0 z-10 h-0.5 rounded-full bg-sun"
        />
        {Array.from({ length: 16 }).map((_, index) => (
          <span
            key={index}
            className={index % 3 === 0 ? "h-5 rounded-sm bg-white" : "h-5 rounded-sm bg-white/30"}
          />
        ))}
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="fine-noise relative overflow-hidden bg-ink text-white">
      <Image
        src="/hero-loyalty-saas.png"
        alt=""
        aria-hidden
        fill
        priority
        className="object-cover opacity-[0.32]"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-[linear-gradient(110deg,#0a0f1f_0%,rgba(10,15,31,0.96)_38%,rgba(10,15,31,0.66)_70%,rgba(10,15,31,0.30)_100%)]" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-[-10%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(36,84,255,0.45),transparent_70%)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-200px] left-[-100px] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(245,184,75,0.30),transparent_70%)] blur-3xl"
      />

      <div className="container-page relative grid min-h-[88svh] gap-10 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-20">
        <div className="max-w-3xl">
          <Reveal>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-bold text-white backdrop-blur">
              <Sparkles aria-hidden className="h-4 w-4 text-sun" />
              Fidélisation locale, prête à lancer en 48h
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              La carte fidélité digitale{" "}
              <span className="inline-block bg-[linear-gradient(120deg,#2454ff,#7c3aed,#f5b84b)] bg-clip-text text-transparent animate-gradient">
                simple
              </span>{" "}
              pour les commerces locaux
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">
              Vos clients scannent un QR code, créent leur carte sur téléphone et cumulent des
              tampons à chaque passage. Le commerçant garde un dashboard clair, sans application
              native ni carte papier à gérer.
            </p>
          </Reveal>
          <Reveal delay={220}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/contact" size="lg" className="shimmer">
                Demander une démo
                <ArrowRight aria-hidden className="h-5 w-5" />
              </LinkButton>
              <LinkButton href="/demo" variant="outline" size="lg">
                <PlayCircle aria-hidden className="h-5 w-5" />
                Voir le parcours
              </LinkButton>
            </div>
          </Reveal>
          <Reveal delay={300}>
            <div className="mt-10 grid max-w-2xl grid-cols-3 overflow-hidden rounded-lg border border-white/10 bg-white/10 backdrop-blur">
              {proof.map((item) => (
                <div key={item.label} className="border-r border-white/10 p-4 last:border-r-0">
                  <p className="text-2xl font-black tracking-tight">{item.value}</p>
                  <p className="mt-1 text-xs font-bold uppercase text-white/55">{item.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="relative min-h-[560px]">
          <Reveal delay={120}>
            <div className="absolute right-0 top-5 hidden w-64 rounded-lg border border-white/15 bg-white/10 p-4 text-white backdrop-blur-xl lg:block">
              <div className="flex items-center justify-between">
                <p className="text-sm font-black">Aujourd&apos;hui</p>
                <span className="rounded-full bg-mint px-2 py-1 text-xs font-black text-white">
                  +18%
                </span>
              </div>
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-white/10 p-3">
                  <span className="flex items-center gap-2 text-sm text-white/75">
                    <Stamp aria-hidden className="h-4 w-4 text-sun" />
                    Tampons
                  </span>
                  <strong>126</strong>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/10 p-3">
                  <span className="flex items-center gap-2 text-sm text-white/75">
                    <MousePointerClick aria-hidden className="h-4 w-4 text-coral" />
                    Cartes créées
                  </span>
                  <strong>34</strong>
                </div>
              </div>
            </div>
          </Reveal>
          <div className="absolute left-1/2 top-8 w-full -translate-x-1/2 lg:top-20">
            <PhoneMockup />
          </div>
          <CounterMockup />
          <Reveal delay={200}>
            <div className="absolute bottom-0 right-0 w-full max-w-md rounded-lg border border-white/10 bg-white p-4 text-ink shadow-[0_30px_90px_rgba(0,0,0,0.30)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase text-muted-2">Action caisse</p>
                  <p className="mt-1 text-lg font-black">Ajouter +1 tampon</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white animate-pulse-ring">
                  <Stamp aria-hidden className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-muted">
                <div className="h-full w-[70%] rounded-full bg-[linear-gradient(90deg,#2454ff,#18a77a)] animate-gradient" />
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="border-t border-white/10 bg-ink/60">
        <div className="container-page flex flex-wrap items-center gap-x-8 gap-y-3 py-6 text-xs font-bold uppercase tracking-normal text-white/40">
          <span>Pensé pour les commerces locaux ·</span>
          <span>Snacks</span>
          <span>Cafés &amp; restaurants</span>
          <span>Barbiers</span>
          <span>Instituts</span>
          <span>Lavages auto</span>
          <span>Boulangeries</span>
        </div>
      </div>
    </section>
  );
}
