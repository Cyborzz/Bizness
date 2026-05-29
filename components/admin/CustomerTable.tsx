"use client";

import { Mail, Phone, Trash2 } from "lucide-react";
import { deleteCustomerAction, updateMarketingConsentAction } from "@/app/actions/loyalty";
import { Button, LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

type CustomerRow = {
  id: string;
  first_name: string;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  consent_marketing: boolean;
  businesses?: { name: string } | null;
  loyalty_cards?: {
    id: string;
    current_stamps: number;
    rewards_available: number;
    status: string;
  }[];
};

export function CustomerTable({ customers }: { customers: CustomerRow[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="font-black text-ink">Clients</h2>
        <p className="text-xs font-bold uppercase text-muted-2">
          {customers.length} client{customers.length > 1 ? "s" : ""}
        </p>
      </div>
      {customers.length === 0 ? (
        <div className="p-6">
          <EmptyState title="Aucun client">Les clients inscrits apparaîtront ici.</EmptyState>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead className="bg-surface-muted text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Commerce</th>
                <th className="px-4 py-3">Carte</th>
                <th className="px-4 py-3">Marketing</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.map((customer) => {
                const card = customer.loyalty_cards?.[0];
                const initials = `${customer.first_name.slice(0, 1)}${(customer.last_name ?? "").slice(0, 1)}`;
                return (
                  <tr key={customer.id} className="transition hover:bg-surface-muted/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-xs font-black uppercase text-primary-dark"
                        >
                          {initials || "?"}
                        </span>
                        <span className="font-semibold text-ink">
                          {customer.first_name} {customer.last_name ?? ""}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {customer.phone ? (
                        <div className="flex items-center gap-1.5">
                          <Phone aria-hidden className="h-3 w-3" />
                          {customer.phone}
                        </div>
                      ) : null}
                      {customer.email ? (
                        <div className="flex items-center gap-1.5">
                          <Mail aria-hidden className="h-3 w-3" />
                          <span className="truncate">{customer.email}</span>
                        </div>
                      ) : null}
                      {!customer.phone && !customer.email ? "—" : null}
                    </td>
                    <td className="px-4 py-3 text-muted">{customer.businesses?.name ?? "—"}</td>
                    <td className="px-4 py-3">
                      {card ? (
                        <LinkButton href={`/card/${card.id}`} size="sm" variant="secondary">
                          {card.current_stamps} tampon(s), {card.rewards_available} récomp.
                        </LinkButton>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <form
                        action={updateMarketingConsentAction}
                        className="flex items-center gap-2"
                      >
                        <input type="hidden" name="customerId" value={customer.id} />
                        <input
                          name="consent_marketing"
                          type="checkbox"
                          defaultChecked={customer.consent_marketing}
                          className="h-4 w-4 accent-primary"
                          onChange={(event) => event.currentTarget.form?.requestSubmit()}
                          aria-label="Consentement marketing"
                        />
                        <Badge tone={customer.consent_marketing ? "mint" : "neutral"}>
                          {customer.consent_marketing ? "Oui" : "Non"}
                        </Badge>
                      </form>
                    </td>
                    <td className="px-4 py-3">
                      <form
                        action={deleteCustomerAction}
                        className="flex justify-end"
                        onSubmit={(event) => {
                          if (
                            !window.confirm(
                              `Supprimer définitivement ${customer.first_name} et sa carte ?`,
                            )
                          ) {
                            event.preventDefault();
                          }
                        }}
                      >
                        <input type="hidden" name="customerId" value={customer.id} />
                        <Button size="sm" variant="danger" type="submit">
                          <Trash2 aria-hidden className="h-4 w-4" />
                          Supprimer
                        </Button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
