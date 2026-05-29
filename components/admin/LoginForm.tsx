"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, LogIn } from "lucide-react";
import { loginAction, type LoginState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" size="lg" disabled={pending}>
      <LogIn aria-hidden className="h-4 w-4" />
      {pending ? "Connexion…" : "Se connecter"}
    </Button>
  );
}

export function LoginForm({ success }: { success?: string }) {
  const [state, action] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <form
      action={action}
      className="animate-scale-in space-y-4 rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-border"
    >
      {success === "password-reset-sent" ? (
        <div
          role="status"
          className="animate-fade-in-up rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800"
        >
          Email envoyé. Vérifiez votre boîte de réception (et les spams).
        </div>
      ) : null}
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
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Mot de passe</Label>
          <Link
            href="/admin/login/forgot"
            className="text-xs font-semibold text-primary hover:underline"
          >
            Oublié ?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <SubmitButton />
    </form>
  );
}
