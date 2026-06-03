"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, KeyRound } from "lucide-react";
import { resetPasswordAction, type ResetPasswordState } from "@/app/actions/password";
import { Button } from "@/components/ui/button";
import { FieldHint, Input, Label } from "@/components/ui/field";
import { createClient } from "@/lib/supabase/browser";

type LinkStatus = "checking" | "ready" | "missing" | "error";

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" size="lg" disabled={pending || disabled}>
      <KeyRound aria-hidden className="h-4 w-4" />
      {pending ? "Mise a jour..." : "Definir le nouveau mot de passe"}
    </Button>
  );
}

export default function ResetPasswordPage() {
  const [state, action] = useActionState<ResetPasswordState, FormData>(
    resetPasswordAction,
    {},
  );
  const [linkStatus, setLinkStatus] = useState<LinkStatus>("checking");
  const [linkError, setLinkError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function prepareSession() {
      const supabase = createClient();
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const code = url.searchParams.get("code");
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      const mailError = hash.get("error_description") ?? url.searchParams.get("error_description");

      try {
        if (mailError) {
          throw new Error(mailError);
        }

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          window.history.replaceState(null, "", window.location.pathname);
          if (isMounted) setLinkStatus("ready");
          return;
        }

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
          window.history.replaceState(null, "", window.location.pathname);
          if (isMounted) setLinkStatus("ready");
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (isMounted) setLinkStatus(session ? "ready" : "missing");
      } catch {
        if (!isMounted) return;
        setLinkError("Lien d'invitation invalide ou expire.");
        setLinkStatus("error");
      }
    }

    void prepareSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const canSubmit = linkStatus === "ready";

  return (
    <main className="section-grid relative flex min-h-screen items-center justify-center bg-ink px-4 py-10 text-white">
      <div className="relative w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/20 backdrop-blur">
            <KeyRound aria-hidden className="h-6 w-6" />
          </div>
          <p className="mt-4 text-sm font-black uppercase tracking-normal text-sun">Admin</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Nouveau mot de passe</h1>
          <p className="mt-2 text-sm text-white/60">8 caracteres minimum.</p>
        </div>
        <form
          action={action}
          className="animate-scale-in space-y-4 rounded-2xl bg-white p-6 text-ink shadow-2xl ring-1 ring-border"
        >
          {linkStatus === "checking" ? (
            <div
              role="status"
              className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800"
            >
              Verification du lien d&apos;invitation...
            </div>
          ) : null}
          {linkStatus === "missing" || linkStatus === "error" ? (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
              {linkError ?? "Ouvrez cette page depuis le lien recu par email."}
            </div>
          ) : null}
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
              disabled={!canSubmit}
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
              disabled={!canSubmit}
              required
            />
          </div>
          <FieldHint>
            Le lien expire apres 1 heure. Si vous l&apos;avez rate, recommencez depuis
            Mot de passe oublie.
          </FieldHint>
          <SubmitButton disabled={!canSubmit} />
        </form>
      </div>
    </main>
  );
}
