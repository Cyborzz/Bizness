import Image from "next/image";
import { ArrowRight, Check, PlayCircle, QrCode, ShieldCheck, Stamp, Users } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

const proof = [
  { label: "Création client", value: "20 sec" },
  { label: "Lancement commerce", value: "48 h" },
  { label: "Application client", value: "0" },
];

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[322px]">
      <div className="rounded-[34px] border border-white/15 bg-gray-950 p-2 shadow-[0_34px_90px_rgba(0,0,0,0.45)]">
        <div className="overflow-hidden rounded-[28px] bg-[#f8fafc]">
          <div className="flex items-center justify-between bg-ink px-5 py-4 text-white">
            <div>
              <p className="text-xs font-bold uppercase text-white/55">Snack Démo</p>
              <p className="text-lg font-black">Carte fidélité</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-sm font-black text-ink">
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

function DeskMockup() {
  return (
    <div className="absolute bottom-0 right-0 w-full max-w-md rounded-lg border border-white/10 bg-white p-4 text-ink shadow-[0_30px_90px_rgba(0,0,0,0.30)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase text-muted-2">Mode staff</p>
          <p className="mt-1 text-lg font-black">Scanner et ajouter +1 tampon</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white animate-pulse-ring">
          <Stamp aria-hidden className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg bg-surface-muted p-3">
          <Users aria-hidden className="h-4 w-4 text-primary" />
          <p className="mt-2 text-xs font-black text-ink">Client retrouvé</p>
        </div>
        <div className="rounded-lg bg-surface-muted p-3">
          <QrCode aria-hidden className="h-4 w-4 text-ink" />
          <p className="mt-2 text-xs font-black text-ink">QR validé</p>
        </div>
        <div className="rounded-lg bg-surface-muted p-3">
          <ShieldCheck aria-hidden className="h-4 w-4 text-mint" />
          <p className="mt-2 text-xs font-black text-ink">Accès limité</p>
        </div>
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
        className="object-cover opacity-[0.24]"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-[linear-gradient(110deg,#0a0f1f_0%,rgba(10,15,31,0.98)_42%,rgba(10,15,31,0.70)_100%)]" />

      <div className="container-page relative grid min-h-[86svh] gap-10 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-20">
        <div className="max-w-3xl">
          <Reveal>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-bold text-white backdrop-blur">
              <QrCode aria-hidden className="h-4 w-4 text-sun" />
              QR en caisse, carte mobile, tampons en un scan
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              La carte fidélité digitale que vos clients ajoutent en 20 secondes.
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">
              Fidélise-moi remplace la carte papier par un parcours simple : le client scanne,
              garde sa carte sur téléphone, et votre équipe ajoute les tampons depuis un accès
              sécurisé.
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
                Tester le parcours
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

        <div className="relative min-h-[540px]">
          <div className="absolute left-1/2 top-6 w-full -translate-x-1/2 lg:top-16">
            <Reveal delay={120}>
              <PhoneMockup />
            </Reveal>
          </div>
          <Reveal delay={200}>
            <div className="glass-panel absolute -left-3 bottom-24 hidden w-56 rounded-lg p-4 text-white sm:block lg:-left-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-ink">
                  <QrCode aria-hidden className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-black">Affiche QR</p>
                  <p className="text-xs text-white/60">Prête pour le comptoir</p>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={260}>
            <DeskMockup />
          </Reveal>
        </div>
      </div>

      <div className="border-t border-white/10 bg-ink/70">
        <div className="container-page flex flex-wrap items-center gap-x-8 gap-y-3 py-6 text-xs font-bold uppercase tracking-normal text-white/45">
          <span>Pensé pour</span>
          <span>Restaurants</span>
          <span>Snacks</span>
          <span>Barbiers</span>
          <span>Instituts</span>
          <span>Boulangeries</span>
          <span>Services locaux</span>
        </div>
      </div>
    </section>
  );
}
