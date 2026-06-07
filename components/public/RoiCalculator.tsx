"use client";

import { useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";

// Calculateur de ROI : estime le CA mensuel supplémentaire généré par la
// fidélisation. Volontairement conservateur et transparent (hypothèse de
// passages en plus ajustable + disclaimer). Outil de conversion commercial.

function Field({
  label,
  suffix,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  suffix?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between">
        <span className="text-sm font-bold text-ink">{label}</span>
        <span className="text-sm font-black tabular-nums text-primary">
          {value}
          {suffix ? <span className="ml-0.5 text-muted">{suffix}</span> : null}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-primary"
      />
    </label>
  );
}

export function RoiCalculator() {
  const [clientsPerDay, setClientsPerDay] = useState(40);
  const [basket, setBasket] = useState(12);
  const [daysOpen, setDaysOpen] = useState(26);
  const [uplift, setUplift] = useState(5); // % de visites en plus grâce à la fidélité

  const { extraMonthly, extraYearly } = useMemo(() => {
    const monthlyVisits = clientsPerDay * daysOpen;
    const extraVisits = monthlyVisits * (uplift / 100);
    const extraMonthly = Math.round(extraVisits * basket);
    return { extraMonthly, extraYearly: extraMonthly * 12 };
  }, [clientsPerDay, basket, daysOpen, uplift]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n);

  return (
    <section className="bg-white py-20">
      <div className="container-page">
        <div className="mx-auto mb-9 max-w-2xl text-center">
          <p className="text-sm font-black uppercase tracking-normal text-primary">
            Combien ça peut rapporter ?
          </p>
          <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-ink sm:text-4xl">
            Estimez votre gain avec la fidélisation
          </h2>
          <p className="mt-3 text-muted">
            Ajustez vos chiffres : voyez le chiffre d&apos;affaires que ramènent
            les clients qui reviennent.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-6 rounded-[28px] border border-border bg-surface-muted p-6 shadow-sm lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-border">
            <Field
              label="Clients par jour"
              value={clientsPerDay}
              min={5}
              max={300}
              step={5}
              onChange={setClientsPerDay}
            />
            <Field
              label="Panier moyen"
              suffix="€"
              value={basket}
              min={3}
              max={150}
              onChange={setBasket}
            />
            <Field
              label="Jours d'ouverture / mois"
              value={daysOpen}
              min={10}
              max={31}
              onChange={setDaysOpen}
            />
            <Field
              label="Visites en plus grâce à la fidélité"
              suffix="%"
              value={uplift}
              min={1}
              max={20}
              onChange={setUplift}
            />
          </div>

          <div className="flex flex-col justify-center rounded-2xl bg-ink p-6 text-white shadow-xl">
            <TrendingUp aria-hidden className="h-6 w-6 text-sun" />
            <p className="mt-4 text-sm font-bold uppercase tracking-normal text-white/60">
              CA supplémentaire estimé
            </p>
            <p className="mt-1 text-5xl font-black tracking-tight tabular-nums">
              {fmt(extraMonthly)} €
              <span className="ml-1 text-lg font-bold text-white/60">/mois</span>
            </p>
            <p className="mt-2 text-sm font-semibold text-sun">
              soit ~{fmt(extraYearly)} € / an
            </p>
            <p className="mt-4 text-xs leading-5 text-white/50">
              Estimation indicative basée sur vos chiffres et l&apos;hypothèse de
              visites supplémentaires que vous fixez. Les résultats réels varient
              selon votre commerce.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
