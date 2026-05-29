"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, ArrowLeft, KeyRound } from "lucide-react";
import { forgotPasswordAction, type ForgotPasswordState } from "@/app/actions/password";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" size="lg" disabled={pending}>
      <KeyRound aria-hidden className="h-4 w-4" />
      {pending ? "Envoi…" : "Recevoir le lien de réinitialisation"}
    </Button>
  );
}

export default function ForgotPasswordPage() {
  const [state, action] = useActionState<ForgotPasswordState, FormData>(
    forgotPasswordAction,
    {},
  );

  return (
    <main className="section-grid relative flex min-h-screen items-center justify-center bg-ink px-4 py-10 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(36,84,255,0.45),transparent_70%)] blur-3xl"
      />
      <div className="relative w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/20 backdrop-blur">
            <KeyRound aria-hidden className="h-6 w-6" />
          </div>
          <p className="mt-4 text-sm font-black uppercase tracking-normal text-sun">Admin</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Mot de passe oublié</h1>
          <p className="mt-2 text-sm text-white/60">
            Renseignez votre email, on vous envoie un lien sécurisé pour le réinitialiser.
          </p>
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
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <SubmitButton />
          <Link
            href="/admin/login"
            className="flex items-center justify-center gap-1 text-sm font-semibold text-muted hover:text-ink"
          >
            <ArrowLeft aria-hidden className="h-3 w-3" />
            Retour à la connexion
          </Link>
        </form>
      </div>
    </main>
  );
}
