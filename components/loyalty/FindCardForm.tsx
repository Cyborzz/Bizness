"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { AlertCircle, Search } from "lucide-react";
import { findCustomerCardAction, type LookupState } from "@/app/actions/customer";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" variant="dark" disabled={pending}>
      <Search aria-hidden className="h-4 w-4" />
      {pending ? "Recherche…" : "Retrouver ma carte"}
    </Button>
  );
}

export function FindCardForm({ businessSlug }: { businessSlug: string }) {
  const router = useRouter();
  const [state, action] = useActionState<LookupState, FormData>(
    findCustomerCardAction,
    {},
  );

  useEffect(() => {
    if (state.cardId) {
      router.push(`/card/${state.cardId}`);
    }
  }, [router, state.cardId]);

  return (
    <details className="group rounded-[24px] bg-white p-5 shadow-xl ring-1 ring-border">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold text-ink">
        J&apos;ai déjà une carte
        <span className="text-xs font-semibold text-primary group-open:hidden">
          Retrouver
        </span>
      </summary>

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
          <Label htmlFor="contact">Téléphone ou email utilisé à l&apos;inscription</Label>
          <Input
            id="contact"
            name="contact"
            inputMode="email"
            autoComplete="email"
            placeholder="06 12 34 56 78 ou client@email.fr"
            required
          />
        </div>

        <SubmitButton />
      </form>
    </details>
  );
}
