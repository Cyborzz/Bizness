"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Send } from "lucide-react";
import { inviteMemberAction, type InviteState } from "@/app/actions/team";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/field";
import type { AdminProfile } from "@/lib/auth/queries";

type BusinessOption = { id: string; name: string };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending} size="lg">
      <Send aria-hidden className="h-4 w-4" />
      {pending ? "Envoi..." : "Envoyer l'invitation"}
    </Button>
  );
}

export function InviteMemberForm({
  profile,
  businesses,
}: {
  profile: AdminProfile;
  businesses: BusinessOption[];
}) {
  const [state, action] = useActionState<InviteState, FormData>(inviteMemberAction, {});
  const isSuper = profile.role === "super_admin";

  return (
    <form
      action={action}
      className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-sm"
    >
      {state.error ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
        >
          <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
          {state.error}
        </div>
      ) : null}

      {state.success ? (
        <div
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm font-semibold text-emerald-900"
        >
          <p>{state.success}</p>
          {state.email && state.temporaryPassword ? (
            <div className="mt-3 rounded-lg bg-white/70 p-3 font-mono text-xs text-ink">
              <p>Email: {state.email}</p>
              <p>Mot de passe temporaire: {state.temporaryPassword}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required placeholder="staff@commerce.fr" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select id="role" name="role" defaultValue="staff" required>
            {isSuper ? <option value="super_admin">Super admin</option> : null}
            {isSuper ? <option value="business_owner">Owner</option> : null}
            <option value="staff">Staff</option>
          </Select>
        </div>

        {isSuper ? (
          <div className="space-y-2">
            <Label htmlFor="business_id">Commerce (optionnel pour super admin)</Label>
            <Select id="business_id" name="business_id" defaultValue="">
              <option value="">Aucun / tous</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </div>
        ) : (
          <input type="hidden" name="business_id" value={profile.business_id ?? ""} />
        )}
      </div>

      <p className="text-xs text-muted">
        Un email d&apos;invitation est envoye si le SMTP est configure. Sinon, un mot de passe
        temporaire est affiche ici pour creer le compte tout de suite.
      </p>

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
