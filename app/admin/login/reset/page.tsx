"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, KeyRound } from "lucide-react";
import { resetPasswordAction, type ResetPasswordState } from "@/app/actions/password";
import { Button } from "@/components/ui/button";
import { FieldHint, Input, Label } from "@/components/ui/field";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" size="lg" disabled={pending}>
      <KeyRound aria-hidden className="h-4 w-4" />
      {pending ? "Mise à jour…" : "Définir le nouveau mot de passe"}
    </Button>
  );
}

export default function ResetPasswordPage() {
  const [state, action] = useActionState<ResetPasswordState, FormData>(
    resetPasswordAction,
    {},
  );

  return (
    <main className="section-grid relative flex min-h-screen items-center justify-center bg-ink px-4 py-10 text-white">
      <div className="relative w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/20 backdrop-blur">
            <KeyRound aria-hidden className="h-6 w-6" />
          </div>
          <p className="mt-4 text-sm font-black uppercase tracking-normal text-sun">Admin</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Nouveau mot de passe</h1>
          <p className="mt-2 text-sm text-white/60">8 caractères minimum.</p>
        </div>
        <form
          action={action}
          className="animate-scale-in space-y-4 rounded-2xl bg-white p-6 text-ink shadow-2xl ring-1 ring-border"
        >
          {state.error ? (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
              {state.error}
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="password">Nouveau mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              minLength={8}
              autoComplete="new-password"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirmation</Label>
            <Input
              id="confirm"
              name="confirm"
              type="password"
              minLength={8}
              autoComplete="new-password"
              required
            />
          </div>
          <FieldHint>
            Le lien expire après 1 heure. Si vous l&apos;avez raté, recommencez depuis « Mot de
            passe oublié ».
          </FieldHint>
          <SubmitButton />
        </form>
      </div>
    </main>
  );
}
