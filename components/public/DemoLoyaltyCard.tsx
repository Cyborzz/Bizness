"use client";

import { useMemo, useState } from "react";
import { Check, Gift, RotateCcw, ScanLine, Stamp, Trophy, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfettiBurst } from "@/components/ui/confetti-burst";

export function DemoLoyaltyCard() {
  const [stamps, setStamps] = useState(4);
  const [rewards, setRewards] = useState(0);
  const [celebrate, setCelebrate] = useState(0);
  const required = 10;
  const remaining = Math.max(required - stamps, 0);

  const timeline = useMemo(
    () => [
      { label: "Carte créée", detail: "Amine — 11:24", tone: "neutral" as const },
      { label: "+1 tampon", detail: `${stamps}/10 actuellement`, tone: "primary" as const },
      rewards > 0
        ? {
            label: "Récompense disponible",
            detail: `${rewards} menu offert(s)`,
            tone: "mint" as const,
          }
        : {
            label: "Objectif en cours",
            detail: `${remaining} passage(s) restant(s)`,
            tone: "sun" as const,
          },
    ],
    [remaining, rewards, stamps],
  );

  function addStamp() {
    setStamps((value) => {
      const next = value + 1;
      if (next >= required) {
        setRewards((reward) => reward + 1);
        setCelebrate((c) => c + 1);
        return 0;
      }
      return next;
    });
  }

  function redeem() {
    setRewards((value) => Math.max(value - 1, 0));
  }

  function reset() {
    setStamps(4);
    setRewards(0);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="relative rounded-2xl bg-ink p-4 text-white shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase text-white/50">Vue client</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight">Snack Démo</h2>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-ink text-sm font-black">
            SD
          </div>
        </div>

        <div className="relative mt-6 rounded-[28px] border border-white/15 bg-white p-2 text-ink shadow-[0_30px_90px_rgba(0,0,0,0.28)]">
          <ConfettiBurst trigger={celebrate} />
          <div className="overflow-hidden rounded-[22px] bg-[#f8fafc]">
            <div className="relative overflow-hidden bg-[linear-gradient(135deg,#0a0f1f,#2454ff)] p-5 text-white">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/10 blur-2xl"
              />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase text-white/60">Carte fidélité</p>
                  <p className="mt-1 text-xl font-black">10 tampons = 1 menu offert</p>
                </div>
                <ScanLine aria-hidden className="h-6 w-6 text-white/70" />
              </div>
              <div className="relative mt-8 flex items-end justify-between">
                <div>
                  <p className="text-sm text-white/60">Progression</p>
                  <p className="text-5xl font-black tracking-tight tabular-nums">{stamps}/10</p>
                </div>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black">
                  {remaining} restant(s)
                </span>
              </div>
              <div className="relative mt-5 h-1.5 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#f5b84b,#18a77a)] transition-[width] duration-700 ease-out"
                  style={{ width: `${(stamps / required) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: required }).map((_, index) => (
                  <div
                    key={index}
                    className={
                      index < stamps
                        ? "animate-stamp-pop flex aspect-square items-center justify-center rounded-full bg-ink text-white shadow-sm"
                        : "flex aspect-square items-center justify-center rounded-full border border-border bg-white text-xs font-black text-muted-2"
                    }
                  >
                    {index < stamps ? <Check aria-hidden className="h-4 w-4" /> : index + 1}
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-lg bg-white p-4 shadow-sm ring-1 ring-border">
                <div className="flex items-center gap-3">
                  <div
                    className={
                      rewards > 0
                        ? "flex h-11 w-11 items-center justify-center rounded-lg bg-mint-soft text-mint animate-pulse-ring-mint"
                        : "flex h-11 w-11 items-center justify-center rounded-lg bg-mint-soft text-mint"
                    }
                  >
                    <Gift aria-hidden className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-black">1 menu offert</p>
                    <p className="text-sm text-muted">
                      {rewards} récompense(s) disponible(s)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase text-primary">Mode caisse</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-ink">Actions staff</h2>
          <div className="mt-5 space-y-3">
            <Button onClick={addStamp} className="w-full justify-start" size="lg">
              <Stamp aria-hidden className="h-5 w-5" />
              Ajouter un tampon
            </Button>
            <Button
              onClick={redeem}
              className="w-full justify-start"
              variant="dark"
              size="lg"
              disabled={rewards === 0}
            >
              <Trophy aria-hidden className="h-5 w-5" />
              Utiliser récompense
            </Button>
            <Button onClick={reset} className="w-full justify-start" variant="secondary" size="lg">
              <RotateCcw aria-hidden className="h-5 w-5" />
              Réinitialiser
            </Button>
          </div>
          <div className="mt-5 rounded-lg bg-surface-muted p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-ink shadow-sm">
                <UserRound aria-hidden className="h-5 w-5" />
              </div>
              <div>
                <p className="font-black text-ink">Amine B.</p>
                <p className="text-sm text-muted">Client retrouvé par téléphone</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase text-primary">Historique live</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-ink">Transactions</h2>
          <div className="mt-5 space-y-3">
            {timeline.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div>
                  <p className="font-black text-ink">{item.label}</p>
                  <p className="text-sm text-muted">{item.detail}</p>
                </div>
                <Badge tone={item.tone}>sync</Badge>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-lg bg-ink p-4 text-white">
            <p className="text-sm font-bold text-white/60">Pitch rendez-vous</p>
            <p className="mt-2 text-lg font-black">
              « Le client voit sa progression, vous gardez les données et les récompenses. »
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
