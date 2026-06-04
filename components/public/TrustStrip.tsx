import { CalendarX2, MapPin, ShieldCheck, Smartphone, Wallet, Zap } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

const signals = [
  { label: "Sans application", sub: "Le client n'installe rien", icon: Smartphone },
  { label: "Dans Google Wallet", sub: "Ajout en un tap", icon: Wallet },
  { label: "Conforme RGPD", sub: "Consentement & suppression", icon: ShieldCheck },
  { label: "Hébergé en France", sub: "Serveur dédié OVH", icon: MapPin },
  { label: "Sans engagement", sub: "On arrête quand vous voulez", icon: CalendarX2 },
  { label: "Prêt en 48h", sub: "Carte, QR et caisse", icon: Zap },
];

export function TrustStrip() {
  return (
    <section className="border-y border-border bg-white">
      <div className="container-page grid grid-cols-2 gap-x-4 gap-y-6 py-8 sm:grid-cols-3 lg:grid-cols-6">
        {signals.map((signal, index) => {
          const Icon = signal.icon;
          return (
            <Reveal key={signal.label} delay={index * 60}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-primary ring-1 ring-border">
                  <Icon aria-hidden className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black leading-tight text-ink">{signal.label}</p>
                  <p className="mt-0.5 truncate text-xs font-semibold text-muted">{signal.sub}</p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
