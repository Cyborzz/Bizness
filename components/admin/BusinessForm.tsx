"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Save } from "lucide-react";
import { saveBusinessAction } from "@/app/actions/business";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { LocationPicker } from "@/components/admin/LocationPicker";
import { generateSlug } from "@/lib/utils/format";
import type { Business } from "@/types/business";

type State = { error?: string };

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending} size="lg">
      <Save aria-hidden className="h-4 w-4" />
      {pending
        ? "Enregistrement…"
        : isEditing
          ? "Modifier le commerce"
          : "Créer le commerce"}
    </Button>
  );
}

export function BusinessForm({ business }: { business?: Business }) {
  const [state, action] = useActionState<State, FormData>(saveBusinessAction, {});
  const [name, setName] = useState(business?.name ?? "");
  const [slug, setSlug] = useState(business?.slug ?? "");
  const [primary, setPrimary] = useState(business?.primary_color ?? "#2454ff");
  const [secondary, setSecondary] = useState(business?.secondary_color ?? "#7c3aed");
  const suggestedSlug = useMemo(() => generateSlug(name), [name]);

  return (
    <form
      action={action}
      className="space-y-6 rounded-2xl border border-border bg-white p-5 shadow-sm"
    >
      {business ? <input type="hidden" name="business_id" value={business.id} /> : null}
      {state.error ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
        >
          <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
          {state.error}
        </div>
      ) : null}

      <fieldset className="space-y-4">
        <legend className="text-sm font-black uppercase tracking-normal text-primary">
          Identité
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du commerce</Label>
            <Input
              id="name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug public</Label>
            <Input
              id="slug"
              name="slug"
              value={slug || suggestedSlug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="ex. snack-demo"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="logo">Logo (PNG, JPG, WEBP, SVG — max 2 Mo)</Label>
          <Input id="logo" name="logo" type="file" accept="image/*" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="welcome_message">Message d&apos;accueil sur la carte</Label>
          <Textarea
            id="welcome_message"
            name="welcome_message"
            defaultValue={business?.welcome_message ?? ""}
            maxLength={140}
            placeholder="Merci d'être client·e !"
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-black uppercase tracking-normal text-primary">
          Design de la carte
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="primary_color">Couleur principale</Label>
            <div className="flex items-center gap-3">
              <Input
                id="primary_color"
                name="primary_color"
                type="color"
                value={primary}
                onChange={(event) => setPrimary(event.target.value)}
                className="h-11 w-20 cursor-pointer p-1"
              />
              <span className="font-mono text-sm font-bold text-muted">
                {primary.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="secondary_color">Couleur secondaire (gradient)</Label>
            <div className="flex items-center gap-3">
              <Input
                id="secondary_color"
                name="secondary_color"
                type="color"
                value={secondary}
                onChange={(event) => setSecondary(event.target.value)}
                className="h-11 w-20 cursor-pointer p-1"
              />
              <span className="font-mono text-sm font-bold text-muted">
                {secondary.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="card_style">Style de carte</Label>
          <Select
            id="card_style"
            name="card_style"
            defaultValue={business?.card_style ?? "gradient"}
          >
            <option value="gradient">Gradient (couleur principale → noir)</option>
            <option value="solid">Uni (couleur principale)</option>
            <option value="glass">Verre fumé (gradient + noise)</option>
          </Select>
        </div>
        <CardPreview
          primary={primary}
          secondary={secondary}
          businessName={name || business?.name || "Mon commerce"}
        />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-black uppercase tracking-normal text-primary">
          Contact
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" name="phone" defaultValue={business?.phone ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={business?.email ?? ""} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="business_type">Type de commerce</Label>
          <Input
            id="business_type"
            name="business_type"
            defaultValue={business?.business_type ?? ""}
            placeholder="Snack, restaurant, barbier…"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Adresse</Label>
          <Textarea id="address" name="address" defaultValue={business?.address ?? ""} />
        </div>
        <LocationPicker
          defaultLatitude={business?.latitude ?? null}
          defaultLongitude={business?.longitude ?? null}
        />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-black uppercase tracking-normal text-primary">
          Programme de fidélité
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="loyalty_type">Type fidélité</Label>
            <Select
              id="loyalty_type"
              name="loyalty_type"
              defaultValue={business?.loyalty_type ?? "stamps"}
            >
              <option value="stamps">Tampons</option>
              <option value="points">Points</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="stamps_required">Tampons requis</Label>
            <Input
              id="stamps_required"
              name="stamps_required"
              type="number"
              min={1}
              max={50}
              defaultValue={business?.stamps_required ?? 10}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="reward_label">Libellé récompense</Label>
          <Input
            id="reward_label"
            name="reward_label"
            defaultValue={business?.reward_label ?? "1 récompense offerte"}
            placeholder="ex. 1 menu offert"
          />
        </div>
      </fieldset>

      <label className="flex items-center gap-3 rounded-lg border border-border bg-surface-muted p-3 text-sm font-semibold text-ink">
        <input
          name="is_active"
          type="checkbox"
          defaultChecked={business?.is_active ?? true}
          className="h-4 w-4 accent-primary"
        />
        Commerce actif (visible publiquement à l&apos;URL /c/{slug || suggestedSlug || "…"})
      </label>

      <div className="flex justify-end">
        <SubmitButton isEditing={Boolean(business)} />
      </div>
    </form>
  );
}

function CardPreview({
  primary,
  secondary,
  businessName,
}: {
  primary: string;
  secondary: string;
  businessName: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-muted p-3">
      <p className="text-xs font-bold uppercase text-muted-2">Aperçu</p>
      <div
        className="mt-2 overflow-hidden rounded-xl p-4 text-white"
        style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
      >
        <p className="text-xs font-bold uppercase text-white/60">Carte fidélité</p>
        <p className="mt-1 text-xl font-black">{businessName}</p>
        <div className="mt-3 grid grid-cols-5 gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className="flex aspect-square items-center justify-center rounded-full bg-white/20 text-xs font-black text-white/80"
            >
              {i < 3 ? "✓" : i + 1}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
