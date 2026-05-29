import { Eye, Plus, QrCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { Business } from "@/types/business";

export function BusinessTable({ businesses }: { businesses: Business[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border p-4">
        <div>
          <h2 className="font-black text-ink">Commerces</h2>
          <p className="text-xs font-bold uppercase text-muted-2">
            {businesses.length} commerce{businesses.length > 1 ? "s" : ""}
          </p>
        </div>
        <LinkButton href="/admin/businesses/new" size="sm">
          <Plus aria-hidden className="h-4 w-4" />
          Créer
        </LinkButton>
      </div>
      {businesses.length === 0 ? (
        <div className="p-6">
          <EmptyState title="Aucun commerce">
            Créez votre premier commerce pour générer un QR code public.
          </EmptyState>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-surface-muted text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Programme</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {businesses.map((business) => (
                <tr key={business.id} className="transition hover:bg-surface-muted/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-white text-sm font-black"
                        style={{ backgroundColor: business.primary_color }}
                      >
                        {business.name.slice(0, 1)}
                      </span>
                      <span className="font-semibold text-ink">{business.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-muted">/c/{business.slug}</td>
                  <td className="px-4 py-3 text-muted">{business.business_type ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">
                    {business.stamps_required} tampons · {business.reward_label}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={business.is_active ? "mint" : "neutral"}>
                      {business.is_active ? "Actif" : "Inactif"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <LinkButton
                        href={`/admin/businesses/${business.id}`}
                        size="sm"
                        variant="secondary"
                      >
                        <Eye aria-hidden className="h-4 w-4" />
                        Voir
                      </LinkButton>
                      <LinkButton
                        href={`/admin/businesses/${business.id}#qr`}
                        size="sm"
                        variant="ghost"
                      >
                        <QrCode aria-hidden className="h-4 w-4" />
                        QR
                      </LinkButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
