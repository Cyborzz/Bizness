"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Check, Copy, KeyRound, Plus, Trash2 } from "lucide-react";
import {
  createPosKeyAction,
  revokePosKeyAction,
  type CreateKeyState,
} from "@/app/actions/pos";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Label, Select } from "@/components/ui/field";
import { formatDate } from "@/lib/utils/format";

type KeyRow = {
  id: string;
  label: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
  businesses?: { name: string } | null;
};

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard indisponible : l'utilisateur copie à la main */
        }
      }}
      className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-bold text-ink hover:bg-surface-muted"
    >
      {copied ? (
        <Check aria-hidden className="h-3.5 w-3.5 text-mint" />
      ) : (
        <Copy aria-hidden className="h-3.5 w-3.5" />
      )}
      {copied ? "Copié" : "Copier"}
    </button>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button size="sm" disabled={pending}>
      <Plus aria-hidden className="h-4 w-4" />
      {pending ? "Création…" : "Générer une clé"}
    </Button>
  );
}

export function PosIntegrationPanel({
  businesses,
  keys,
  endpoint,
}: {
  businesses: { id: string; name: string }[];
  keys: KeyRow[];
  endpoint: string;
}) {
  const [state, action] = useActionState<CreateKeyState, FormData>(
    createPosKeyAction,
    {},
  );

  const curl = `curl -X POST ${endpoint} \\
  -H "Authorization: Bearer VOTRE_CLE" \\
  -H "Content-Type: application/json" \\
  -d '{"contact":"+33612345678","external_ref":"TICKET-123"}'`;

  return (
    <div className="space-y-6">
      {businesses.length > 0 ? (
        <form
          action={action}
          className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-sm"
        >
          <h2 className="flex items-center gap-2 text-lg font-black text-ink">
            <KeyRound aria-hidden className="h-5 w-5 text-primary" />
            Nouvelle clé API caisse
          </h2>

          {state.error ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
            >
              <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
              {state.error}
            </div>
          ) : null}

          {state.fullKey ? (
            <div className="rounded-lg border border-mint/40 bg-mint-soft p-4">
              <p className="text-sm font-black text-ink">
                Clé créée ✅ — copiez-la maintenant
              </p>
              <p className="mt-1 text-xs text-muted">
                Pour des raisons de sécurité, elle ne sera plus jamais affichée.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <code className="flex-1 overflow-x-auto rounded-lg bg-ink px-3 py-2 font-mono text-xs text-white">
                  {state.fullKey}
                </code>
                <CopyButton value={state.fullKey} />
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="business_id">Commerce</Label>
              <Select id="business_id" name="business_id" required>
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="label">Nom de la clé</Label>
              <Input
                id="label"
                name="label"
                maxLength={60}
                placeholder="ex. Caisse SumUp comptoir"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <SubmitButton />
          </div>
        </form>
      ) : null}

      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-ink">Endpoint d&apos;ingestion</h2>
        <p className="mt-1 text-sm text-muted">
          Branchez le webhook de votre caisse (SumUp, Square, Shopify…) ou un
          outil comme Zapier/Make sur cette URL. Chaque appel crédite un passage.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <code className="flex-1 overflow-x-auto rounded-lg bg-surface-muted px-3 py-2 font-mono text-xs text-ink">
            POST {endpoint}
          </code>
          <CopyButton value={endpoint} />
        </div>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-ink px-3 py-3 font-mono text-[11px] leading-5 text-white/90">
          {curl}
        </pre>
        <p className="mt-2 text-xs text-muted">
          Identifiez le client par <code className="font-mono">contact</code>{" "}
          (téléphone/email) ou <code className="font-mono">card_id</code>. Ajoutez{" "}
          <code className="font-mono">external_ref</code> (id du ticket) pour
          éviter tout double crédit, et <code className="font-mono">amount</code>{" "}
          en mode points.
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-black text-ink">Clés existantes</h2>
        {keys.length === 0 ? (
          <EmptyState title="Aucune clé">
            Générez une clé pour connecter une caisse.
          </EmptyState>
        ) : (
          <div className="grid gap-3">
            {keys.map((key) => {
              const revoked = Boolean(key.revoked_at);
              return (
                <div
                  key={key.id}
                  className="flex flex-col gap-2 rounded-2xl border border-border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={revoked ? "danger" : "mint"}>
                        {revoked ? "Révoquée" : "Active"}
                      </Badge>
                      <span className="font-black text-ink">{key.label}</span>
                      {key.businesses?.name ? (
                        <span className="text-xs font-bold uppercase text-muted-2">
                          {key.businesses.name}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 font-mono text-xs text-muted">
                      fmpos_{key.key_prefix}_••••••••
                    </p>
                    <p className="mt-1 text-xs text-muted-2">
                      Créée le {formatDate(key.created_at)}
                      {key.last_used_at
                        ? ` · dernier appel ${formatDate(key.last_used_at)}`
                        : " · jamais utilisée"}
                    </p>
                  </div>
                  {!revoked ? (
                    <form
                      action={revokePosKeyAction}
                      onSubmit={(event) => {
                        if (!window.confirm("Révoquer définitivement cette clé ?")) {
                          event.preventDefault();
                        }
                      }}
                    >
                      <input type="hidden" name="keyId" value={key.id} />
                      <Button type="submit" size="sm" variant="ghost">
                        <Trash2 aria-hidden className="h-4 w-4" />
                        Révoquer
                      </Button>
                    </form>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
