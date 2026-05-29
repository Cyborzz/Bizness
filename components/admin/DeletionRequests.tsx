"use client";

import { ShieldAlert } from "lucide-react";
import { processDeletionAction } from "@/app/actions/rgpd";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils/format";

type Req = {
  id: string;
  customer_id: string;
  reason: string | null;
  created_at: string;
  customers?: { first_name: string; last_name: string | null } | null;
};

export function DeletionRequests({ requests }: { requests: Req[] }) {
  if (!requests.length) return null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <div className="flex items-center gap-2">
        <ShieldAlert aria-hidden className="h-4 w-4 text-amber-700" />
        <p className="text-sm font-black text-amber-900">
          Demandes de suppression en attente ({requests.length})
        </p>
      </div>
      <p className="mt-1 text-xs text-amber-800">
        RGPD : traitez sous 30 jours. Le bouton supprime définitivement le client et son historique.
      </p>
      <div className="mt-3 space-y-2">
        {requests.map((req) => (
          <div
            key={req.id}
            className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="font-black text-ink">
                {req.customers?.first_name ?? "Client"} {req.customers?.last_name ?? ""}
              </p>
              <p className="text-xs text-muted">
                Demandée le {formatDate(req.created_at)}
                {req.reason ? ` · « ${req.reason} »` : ""}
              </p>
            </div>
            <form
              action={processDeletionAction}
              onSubmit={(event) => {
                if (
                  typeof window !== "undefined" &&
                  !window.confirm(
                    "Confirmer la suppression définitive de ce client et de son historique ?",
                  )
                ) {
                  event.preventDefault();
                }
              }}
            >
              <input type="hidden" name="requestId" value={req.id} />
              <Button type="submit" size="sm" variant="danger">
                Supprimer le client
              </Button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
