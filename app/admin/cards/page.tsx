import { Search } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { CardManagementPanel } from "@/components/admin/CardManagementPanel";
import { ToastBanner } from "@/components/ui/toast-banner";
import { Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { requireAdmin } from "@/lib/auth/queries";
import { getBusinessFilter } from "@/lib/permissions";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Cartes",
};

export default async function CardsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const cardId = typeof params.card === "string" ? params.card.trim() : "";
  const success = typeof params.success === "string" ? params.success : undefined;
  const error = typeof params.error === "string" ? params.error : undefined;
  const { profile } = await requireAdmin();
  const businessFilter = getBusinessFilter(profile);
  const supabase = createAdminClient();

  let customerIds: string[] | null = null;

  if (q) {
    let customerSearch = supabase
      .from("customers")
      .select("id")
      .or(
        `first_name.ilike.%${q}%,last_name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%`,
      );
    if (businessFilter) customerSearch = customerSearch.eq("business_id", businessFilter);
    const { data: matched } = await customerSearch;
    customerIds = matched?.map((row) => row.id) ?? [];
    if (customerIds.length === 0) {
      return (
        <AdminShell profile={profile}>
          <CardsHeader q={q} success={success} error={error} />
          <EmptyState title="Aucun client ne correspond">
            Essayez un autre prénom, un numéro ou un email.
          </EmptyState>
        </AdminShell>
      );
    }
  }

  let query = supabase
    .from("loyalty_cards")
    .select(
      "*, businesses(name,stamps_required,loyalty_type,points_required), customers(first_name,last_name,phone,email)",
    )
    .order("created_at", { ascending: false });

  if (businessFilter) query = query.eq("business_id", businessFilter);
  if (customerIds) query = query.in("customer_id", customerIds);
  // Carte scannée (/admin/scan) : on cible directement cette carte. Le filtre
  // business reste appliqué → on ne peut pas tamponner la carte d'un autre commerce.
  if (cardId) query = query.eq("id", cardId);

  const { data: cards } = await query;

  return (
    <AdminShell profile={profile}>
      <CardsHeader q={q} success={success} error={error} scanned={Boolean(cardId)} />
      {cards?.length ? (
        <CardManagementPanel cards={cards} />
      ) : (
        <EmptyState title="Aucune carte trouvée">
          {cardId
            ? "Cette carte n'existe pas ou n'appartient pas à votre commerce."
            : "Créez une carte depuis l'URL publique d'un commerce."}
        </EmptyState>
      )}
    </AdminShell>
  );
}

function CardsHeader({
  q,
  success,
  error,
  scanned,
}: {
  q: string;
  success?: string;
  error?: string;
  scanned?: boolean;
}) {
  return (
    <div className="mb-6 space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-normal text-primary">Cartes actives</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-ink">Cartes</h1>
        <p className="mt-1 text-muted">
          Ajouter ou retirer des tampons, utiliser une récompense.
        </p>
      </div>
      {scanned ? (
        <div className="rounded-lg border border-mint/30 bg-mint-soft px-4 py-3 text-sm font-semibold text-mint">
          Carte scannée — vous pouvez créditer le tampon ci-dessous.{" "}
          <a href="/admin/cards" className="underline">
            Voir toutes les cartes
          </a>
        </div>
      ) : null}
      <ToastBanner success={success} error={error} />
      <form className="grid gap-2 sm:grid-cols-[1fr_auto] sm:max-w-xl">
        <div className="relative">
          <Search
            aria-hidden
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2"
          />
          <Input
            name="q"
            placeholder="Prénom, nom, téléphone ou email"
            defaultValue={q}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="dark">
          Rechercher
        </Button>
      </form>
    </div>
  );
}
