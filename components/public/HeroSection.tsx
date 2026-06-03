import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  PlayCircle,
  QrCode,
  ScanLine,
  ShieldCheck,
  Stamp,
} from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

const proof = [
  "Sans application client",
  "QR prêt pour le comptoir",
  "Accès staff limité au scan",
];

const flow = [
  { label: "QR caisse", icon: QrCode },
  { label: "Carte mobile", icon: BadgeCheck },
  { label: "Scan staff", icon: ScanLine },
  { label: "Tampon ajouté", icon: Stamp },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white text-ink">
      <Image
        src="/hero-loyalty-saas.png"
        alt=""
        aria-hidden
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#ffffff_0%,rgba(255,255,255,0.96)_42%,rgba(255,255,255,0.72)_64%,rgba(255,255,255,0.12)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,transparent,#ffffff)]" />

      <div className="container-page relative grid min-h-[82svh] items-center py-16 lg:py-20">
        <div className="max-w-3xl">
          <Reveal>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-sm font-bold text-ink shadow-sm">
              <QrCode aria-hidden className="h-4 w-4 text-primary" />
              Une carte fidélité digitale prête pour le comptoir
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight text-ink sm:text-6xl lg:text-7xl">
              Faites revenir vos clients sans carte papier ni application.
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
              Fidélise-moi transforme un simple QR code en carte mobile : le client scanne,
              l&apos;employé ajoute les tampons, le responsable suit tout depuis son portail.
            </p>
          </Reveal>
          <Reveal delay={220}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/contact" size="lg" className="shimmer">
                Demander une démo
                <ArrowRight aria-hidden className="h-5 w-5" />
              </LinkButton>
              <LinkButton href="/demo" variant="secondary" size="lg">
                <PlayCircle aria-hidden className="h-5 w-5" />
                Tester le parcours
              </LinkButton>
            </div>
          </Reveal>
          <Reveal delay={280}>
            <ul className="mt-8 grid max-w-2xl gap-2 sm:grid-cols-3">
              {proof.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 rounded-lg border border-border bg-white/88 px-3 py-2 text-sm font-bold text-ink shadow-sm backdrop-blur"
                >
                  <CheckCircle2 aria-hidden className="h-4 w-4 shrink-0 text-mint" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={340}>
          <div className="mt-12 max-w-5xl rounded-lg border border-border bg-white/92 p-3 shadow-[0_28px_70px_-34px_rgba(10,15,31,0.45)] backdrop-blur md:p-4">
            <div className="grid gap-3 md:grid-cols-4">
              {flow.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-lg bg-surface-muted p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-primary shadow-sm">
                        <Icon aria-hidden className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-black text-muted-2">0{index + 1}</span>
                    </div>
                    <p className="mt-5 text-sm font-black text-ink">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>

        <Reveal delay={420}>
          <div className="mt-4 flex max-w-5xl flex-col gap-3 rounded-lg bg-ink p-4 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-ink">
                <ShieldCheck aria-hidden className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black">Pensé pour une vraie équipe</p>
                <p className="text-sm text-white/60">
                  Le staff scanne, le responsable pilote, le super admin garde la vision globale.
                </p>
              </div>
            </div>
            <span className="rounded-full bg-mint px-3 py-1 text-xs font-black text-white">
              rôles séparés
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
