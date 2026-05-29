"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Send } from "lucide-react";
import { createOfferAction, type OfferActionState } from "@/app/actions/offers";
import { Button } from "@/components/ui/button";
import { FieldHint, Input, Label, Select, Textarea } from "@/components/ui/field";

type BusinessOption = { id: string; name: string };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending} size="lg">
      <Send aria-hidden className="h-4 w-4" />
      {pending ? "Enregistrement…" : "Enregistrer en brouillon"}
    </Button>
  );
}

export function OfferForm({ businesses }: { businesses: BusinessOption[] }) {
  const [state, action] = useActionState<OfferActionState, FormData>(createOfferAction, {});
  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");

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

      {businesses.length > 1 ? (
        <div className="space-y-2">
          <Label htmlFor="business_id">Commerce</Label>
          <Select id="business_id" name="business_id" required defaultValue={businesses[0]?.id}>
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        </div>
      ) : (
        <input type="hidden" name="business_id" value={businesses[0]?.id ?? ""} />
      )}

      <div className="space-y-2">
        <Label htmlFor="title">
          Titre <span className="font-mono text-xs text-muted">({title.length}/80)</span>
        </Label>
        <Input
          id="title"
          name="title"
          maxLength={80}
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="ex. -20% sur les tacos ce soir"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">
          Message <span className="font-mono text-xs text-muted">({body.length}/280)</span>
        </Label>
        <Textarea
          id="body"
          name="body"
          maxLength={280}
          required
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Détaillez l'offre, l'horaire, le code… maxi 280 caractères."
        />
        <FieldHint>
          Court et clair. La notification apparaît sur l&apos;écran de verrouillage.
        </FieldHint>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="image_url">Image (URL)</Label>
          <Input
            id="image_url"
            name="image_url"
            type="url"
            placeholder="https://…"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cta_url">Lien d&apos;action (URL)</Label>
          <Input id="cta_url" name="cta_url" type="url" placeholder="https://…" />
        </div>
      </div>

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
