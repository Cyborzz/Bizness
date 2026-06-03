import { Search } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { CustomerTable } from "@/components/admin/CustomerTable";
import { DeletionRequests } from "@/components/admin/DeletionRequests";
import { ToastBanner } from "@/components/ui/toast-banner";
import { Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/queries";
import { getBusinessFilter, requireFullPortalAccess } from "@/lib/permissions";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Clients",
};

export default async function CustomersPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const q = typeof params.q === "string" ? params.q : "";
  const selectedBusiness = typeof params.business === "string" ? params.business : "";
  const success = typeof params.success === "string" ? params.success : undefined;
  const error = typeof params.error === "string" ? params.error : undefined;
  const { profile } = await requireAdmin();
  requireFullPortalAccess(profile);
  const businessFilter = getBusinessFilter(profile);
  const supabase = createAdminClient();

  let businessesQuery = supabase.from("businesses").select("id,name").order("name");
  if (businessFilter) businessesQuery = businessesQuery.eq("id", businessFilter);
  const { data: businesses } = await businessesQuery;

  let query = supabase
    .from("customers")
    .select(
      "*, businesses(name), loyalty_cards(id,current_stamps,rewards_available,status)",
    )
    .order("created_at", { ascending: false });

  if (businessFilter) query = query.eq("business_id", businessFilter);
  if (selectedBusiness) query = query.eq("business_id", selectedBusiness);
  if (q) {
    query = query.or(
      `first_name.ilike.%${q}%,last_name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%`,
    );
  }

  const { data: customers } = await query;

  let deletionQuery = supabase
    .from("deletion_requests")
    .select("*, customers(first_name,last_name)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (businessFilter) deletionQuery = deletionQuery.eq("business_id", businessFilter);
  const { data: pendingDeletions } = await deletionQuery;

  return (
    <AdminShell profile={profile}>
      <div className="space-y-6">
        <div>
          <p className="text-xs font-black uppercase tracking-normal text-primary">
            Base clients
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-ink">Clients</h1>
          <p className="mt-1 text-muted">
            Recherche, carte associée, suppression et consentement marketing.
          </p>
        </div>
        <ToastBanner success={success} error={error} />
        <DeletionRequests requests={pendingDeletions ?? []} />
        <form className="grid gap-3 sm:grid-cols-[1fr_240px_auto]">
          <div className="relative">
            <Search
              aria-hidden
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2"
            />
            <Input
              name="q"
              placeholder="Prénom, téléphone, email"
              defaultValue={q}
              className="pl-9"
            />
          </div>
          <Select name="business" defaultValue={selectedBusiness}>
            <option value="">Tous les commerces</option>
            {(businesses ?? []).map((business) => (
              <option key={business.id} value={business.id}>
                {business.name}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="dark">
            Filtrer
          </Button>
        </form>
        <CustomerTable customers={customers ?? []} />
      </div>
    </AdminShell>
  );
}
