"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, ArrowRight, CheckCircle2, Stamp } from "lucide-react";
import { validatePassageAction, type PassageState } from "@/app/actions/customer";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

function SubmitButton({ isPoints }: { isPoints: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" size="lg" disabled={pending}>
      <Stamp aria-hidden className="h-5 w-5" />
      {pending ? "Validation…" : isPoints ? "Valider mes points" : "Valider mon passage"}
    </Button>
  );
}

export function PassageForm({
  businessSlug,
  isPoints,
}: {
  businessSlug: string;
  isPoints: boolean;
}) {
  const [state, action] = useActionState<PassageState, FormData>(
    validatePassageAction,
    {},
  );

  // ── Écran de confirmation (à montrer au commerçant) ──
  if (state.ok) {
    return (
      <div className="animate-scale-in rounded-[24px] bg-white p-6 text-center shadow-xl ring-1 ring-border">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mint-soft text-mint animate-pulse-ring-mint">
          <CheckCircle2 aria-hidden className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-2xl font-black tracking-tight text-ink">
          Passage validé&nbsp;!
        </h2>
        <p className="mt-1 text-sm font-semibold text-muted">
          +{state.added} {isPoints ? "point(s)" : "tampon(s)"} chez {state.businessName}
        </p>

        <div className="mt-5 inline-flex items-baseline gap-1 rounded-2xl bg-surface-muted px-5 py-3">
          <span className="text-4xl font-black tabular-nums text-ink">{state.current}</span>
          <span className="text-lg font-bold text-muted-2">/ {state.threshold}</span>
        </div>

        {state.rewardEarned ? (
          <div className="mt-4 rounded-2xl bg-mint p-4 text-white shadow-md">
            <p className="font-black">🎉 Récompense débloquée&nbsp;!</p>
            <p className="mt-1 text-sm text-white/80">Présentez-la au commerçant.</p>
          </div>
        ) : null}

        <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
          Montrez cet écran au commerçant pour confirmer votre passage.
        </p>

        {state.cardId ? (
          <Link
            href={`/card/${state.cardId}`}
            className="focus-ring mt-4 inline-flex items-center justify-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            Voir ma carte complète
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
    );
  }

  // ── Formulaire ──
  return (
    <div className="rounded-[24px] bg-white p-5 shadow-xl ring-1 ring-border">
      <h2 className="text-lg font-black tracking-tight text-ink">Valider mon passage</h2>
      <p className="mt-1 text-sm text-muted">
        Identifiez-vous avec le téléphone ou l&apos;email de votre carte.
      </p>

      <form action={action} className="mt-4 space-y-3">
        <input type="hidden" name="business_slug" value={businessSlug} />
        {state.error ? (
          <div
            role="alert"
            className="animate-fade-in-up flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
          >
            <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
            {state.error}
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="contact">Téléphone ou email</Label>
          <Input
            id="contact"
            name="contact"
            inputMode="email"
            autoComplete="email"
            placeholder="06 12 34 56 78 ou client@email.fr"
            required
          />
        </div>

        {isPoints ? (
          <div className="space-y-2">
            <Label htmlFor="amount">Montant dépensé (€)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              placeholder="ex : 12"
              required
            />
          </div>
        ) : null}

        <SubmitButton isPoints={isPoints} />
      </form>

      <p className="mt-3 text-center text-xs text-muted">
        Pas encore de carte ?{" "}
        <Link href={`/c/${businessSlug}`} className="font-bold text-primary hover:underline">
          Créez-la ici
        </Link>
      </p>
    </div>
  );
}
