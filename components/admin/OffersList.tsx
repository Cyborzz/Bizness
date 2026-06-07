"use client";

import { Send, Trash2 } from "lucide-react";
import { deleteOfferAction, sendOfferAction } from "@/app/actions/offers";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils/format";

type OfferRow = {
  id: string;
  title: string;
  body: string;
  cta_url: string | null;
  status: "draft" | "sent" | "cancelled";
  created_at: string;
  sent_at: string | null;
  recipient_count: number;
  businesses?: { name: string } | null;
};

const statusLabels: Record<OfferRow["status"], { label: string; tone: BadgeTone }> = {
  draft: { label: "Brouillon", tone: "neutral" },
  sent: { label: "Envoyée", tone: "mint" },
  cancelled: { label: "Annulée", tone: "danger" },
};

export function OffersList({ offers }: { offers: OfferRow[] }) {
  if (!offers.length) {
    return (
      <EmptyState title="Aucune offre">
        Créez votre première offre pour notifier les clients abonnés.
      </EmptyState>
    );
  }

  return (
    <div className="grid gap-4">
      {offers.map((offer) => {
        const status = statusLabels[offer.status];
        return (
          <div
            key={offer.id}
            className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm"
          >
            <div className="flex flex-col gap-2 p-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={status.tone}>{status.label}</Badge>
                  {offer.businesses?.name ? (
                    <span className="text-xs font-bold uppercase text-muted-2">
                      {offer.businesses.name}
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-2 text-lg font-black text-ink">{offer.title}</h3>
                <p className="mt-1 text-sm text-muted">{offer.body}</p>
                <p className="mt-2 text-xs text-muted-2">
                  Créée le {formatDate(offer.created_at)}
                  {offer.sent_at ? ` · envoyée le ${formatDate(offer.sent_at)}` : ""}
                  {offer.status === "sent"
                    ? ` · ${offer.recipient_count} abonné·s touché·s`
                    : ""}
                </p>
              </div>
              <div className="flex gap-2 sm:flex-col">
                {offer.status === "draft" ? (
                  <form
                    action={sendOfferAction}
                    onSubmit={(event) => {
                      if (!window.confirm("Envoyer cette offre à tous les abonnés ?")) {
                        event.preventDefault();
                      }
                    }}
                  >
                    <input type="hidden" name="offerId" value={offer.id} />
                    <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted">
                      <input
                        name="sms"
                        type="checkbox"
                        className="h-3.5 w-3.5 accent-primary"
                      />
                      Aussi par SMS
                    </label>
                    <Button type="submit" size="sm" variant="mint" className="w-full">
                      <Send aria-hidden className="h-4 w-4" />
                      Envoyer
                    </Button>
                  </form>
                ) : null}
                <form
                  action={deleteOfferAction}
                  onSubmit={(event) => {
                    if (!window.confirm("Supprimer cette offre ?")) {
                      event.preventDefault();
                    }
                  }}
                >
                  <input type="hidden" name="offerId" value={offer.id} />
                  <Button type="submit" size="sm" variant="ghost" className="w-full">
                    <Trash2 aria-hidden className="h-4 w-4" />
                    Supprimer
                  </Button>
                </form>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
