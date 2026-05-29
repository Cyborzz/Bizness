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
      {pending ? "Envoi…" : "Envoyer l'invitation"}
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
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required placeholder="staff@commerce.fr" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="role">Rôle</Label>
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
          <input
            type="hidden"
            name="business_id"
            value={profile.business_id ?? ""}
          />
        )}
      </div>
      <p className="text-xs text-muted">
        Un email d&apos;invitation est envoyé par Supabase. La personne définit son mot de passe en
        cliquant sur le lien.
      </p>
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
