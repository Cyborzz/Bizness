"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { AlertCircle, ArrowRight } from "lucide-react";
import { createCustomerCardAction, type SignupState } from "@/app/actions/customer";
import { Button } from "@/components/ui/button";
import { FieldHint, Input, Label } from "@/components/ui/field";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" size="lg" disabled={pending}>
      {pending ? "Création…" : "Créer ma carte fidélité"}
      {!pending ? <ArrowRight aria-hidden className="h-5 w-5" /> : null}
    </Button>
  );
}

export function CustomerSignupForm({ businessSlug }: { businessSlug: string }) {
  const router = useRouter();
  const [state, action] = useActionState<SignupState, FormData>(
    createCustomerCardAction,
    {},
  );

  useEffect(() => {
    if (state.cardId) {
      router.push(`/card/${state.cardId}`);
    }
  }, [router, state.cardId]);

  return (
    <form
      action={action}
      className="space-y-4 rounded-[24px] bg-white p-5 shadow-xl ring-1 ring-border"
    >
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

      <div>
        <p className="text-xs font-black uppercase tracking-normal text-primary">Inscription</p>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-ink">
          Créer ma carte fidélité
        </h2>
        <p className="mt-1 text-sm text-muted">20 secondes, sans application à installer.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="first_name">Prénom *</Label>
          <Input id="first_name" name="first_name" autoComplete="given-name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Nom</Label>
          <Input id="last_name" name="last_name" autoComplete="family-name" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone recommandé</Label>
          <Input
            id="phone"
            name="phone"
            inputMode="tel"
            autoComplete="tel"
            placeholder="06 12 34 56 78"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="client@email.fr"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="birthdate">Date de naissance (optionnel) 🎂</Label>
        <Input id="birthdate" name="birthdate" type="date" autoComplete="bday" />
        <p className="text-xs text-muted">
          Pour recevoir une récompense le jour de votre anniversaire, si le
          commerce le propose.
        </p>
      </div>

      <FieldHint>
        Téléphone ou email obligatoire. Vos informations sont utilisées uniquement pour gérer
        votre carte fidélité. Vous pouvez demander la suppression à tout moment.
      </FieldHint>

      <label className="flex gap-3 rounded-lg border border-border bg-surface-muted p-3 text-sm text-ink">
        <input
          name="consent_loyalty"
          type="checkbox"
          required
          className="mt-1 h-4 w-4 accent-primary"
        />
        <span>
          J&apos;accepte l&apos;utilisation de mes informations pour gérer ma carte fidélité.
        </span>
      </label>

      <label className="flex gap-3 rounded-lg border border-border bg-surface-muted p-3 text-sm text-ink">
        <input
          name="consent_marketing"
          type="checkbox"
          className="mt-1 h-4 w-4 accent-primary"
        />
        <span>J&apos;accepte de recevoir des offres du commerce.</span>
      </label>

      <SubmitButton />
    </form>
  );
}
