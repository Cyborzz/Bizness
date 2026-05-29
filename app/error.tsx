"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Best-effort logging — wire to your monitoring tool when ready.
    console.error(error);
  }, [error]);

  return (
    <main className="section-grid flex min-h-screen items-center justify-center bg-ink px-4 py-10 text-white">
      <div className="relative max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-coral-soft text-coral ring-1 ring-coral/30">
          <AlertTriangle aria-hidden className="h-7 w-7" />
        </div>
        <p className="mt-6 text-sm font-black uppercase tracking-normal text-sun">Erreur</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">Quelque chose a planté.</h1>
        <p className="mt-3 text-white/70">
          L&apos;équipe est probablement déjà sur le coup. Essayez de réessayer ou revenez sur la
          page d&apos;accueil.
        </p>
        {error.digest ? (
          <p className="mt-2 font-mono text-xs text-white/40">id : {error.digest}</p>
        ) : null}
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button onClick={reset}>
            <RotateCcw aria-hidden className="h-4 w-4" />
            Réessayer
          </Button>
          <LinkButton href="/" variant="outline">
            Accueil
          </LinkButton>
        </div>
      </div>
    </main>
  );
}
