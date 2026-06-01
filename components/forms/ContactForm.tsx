"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, AlertCircle } from "lucide-react";
import { createLeadAction, type ContactState } from "@/app/actions/contact";
import { Button } from "@/components/ui/button";
import { FieldHint, Input, Label, Select, Textarea } from "@/components/ui/field";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" size="lg" disabled={pending}>
      {pending ? "Envoi…" : "Envoyer ma demande"}
      <ArrowRight aria-hidden className="h-5 w-5" />
    </Button>
  );
}

export function ContactForm() {
  const [state, action] = useActionState<ContactState, FormData>(createLeadAction, {});

  return (
    <form
      action={action}
      className="space-y-5 rounded-2xl bg-white p-6 shadow-xl ring-1 ring-border"
    >
      {state.error ? (
        <div
          role="alert"
          className="animate-fade-in-up flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
        >
          <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
          {state.error}
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nom *</Label>
          <Input id="name" name="name" required autoComplete="name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" name="phone" inputMode="tel" autoComplete="tel" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="business_name">Nom du commerce</Label>
          <Input id="business_name" name="business_name" autoComplete="organization" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="business_type">Type de commerce</Label>
        <Select id="business_type" name="business_type" defaultValue="">
          <option value="" disabled>
            Sélectionner
          </option>
          <option>Snack / fast-food</option>
          <option>Restaurant / café</option>
          <option>Barbier / coiffure</option>
          <option>Institut</option>
          <option>Garage / lavage auto</option>
          <option>Boulangerie</option>
          <option>Autre</option>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Décris rapidement ton commerce et ton besoin."
        />
      </div>
      <FieldHint>
        En envoyant ce formulaire, vous acceptez d&apos;être recontacté par l&apos;équipe Fidélise-moi.
      </FieldHint>
      <SubmitButton />
    </form>
  );
}
