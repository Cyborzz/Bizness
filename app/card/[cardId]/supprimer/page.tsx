"use client";

import { use, useActionState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { AlertCircle, ArrowLeft, CheckCircle2, Trash2 } from "lucide-react";
import { requestDeletionAction, type DeletionRequestState } from "@/app/actions/rgpd";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/field";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="danger" disabled={pending} size="lg">
      <Trash2 aria-hidden className="h-4 w-4" />
      {pending ? "Envoi…" : "Demander la suppression"}
    </Button>
  );
}

export default function DeleteCardPage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = use(params);
  const [state, action] = useActionState<DeletionRequestState, FormData>(
    requestDeletionAction,
    {},
  );

  return (
    <main className="section-grid min-h-screen bg-[#eef2f7] px-4 py-6">
      <div className="mx-auto max-w-md space-y-5">
        <Link
          href={`/card/${cardId}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-ink"
        >
          <ArrowLeft aria-hidden className="h-4 w-4" />
          Retour à ma carte
        </Link>
        <header>
          <p className="text-xs font-black uppercase tracking-normal text-primary">RGPD</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-ink">
            Supprimer mes données
          </h1>
          <p className="mt-2 text-muted">
            Le commerce reçoit la demande et procède à la suppression de votre carte, de votre
            historique et de votre contact.
          </p>
        </header>

        {state.ok ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-start gap-2">
              <CheckCircle2 aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-black text-emerald-900">Demande envoyée</p>
                <p className="mt-1 text-sm text-emerald-800">
                  Le commerce traitera votre demande sous quelques jours. Vous serez retiré·e du
                  programme et vos données seront effacées.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form
            action={action}
            className="space-y-4 rounded-2xl bg-white p-5 shadow-xl ring-1 ring-border"
          >
            <input type="hidden" name="cardId" value={cardId} />
            {state.error ? (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                {state.error}
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="reason">Motif (optionnel)</Label>
              <Textarea
                id="reason"
                name="reason"
                placeholder="Vous pouvez préciser un motif. Cela aide le commerce à comprendre."
                maxLength={500}
              />
            </div>
            <SubmitButton />
            <p className="text-xs text-muted">
              Conformément au RGPD, vous pouvez aussi écrire directement au commerce. La
              suppression effective est traitée par l&apos;équipe.
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
