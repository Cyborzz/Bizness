import { Search } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { BusinessTable } from "@/components/admin/BusinessTable";
import { Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/queries";
import { getBusinessFilter, requireFullPortalAccess } from "@/lib/permissions";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Commerces",
};

export default async function BusinessesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const q = typeof params.q === "string" ? params.q : "";
  const { profile } = await requireAdmin();
  requireFullPortalAccess(profile);
  const businessFilter = getBusinessFilter(profile);
  const supabase = createAdminClient();

  let query = supabase.from("businesses").select("*").order("created_at", { ascending: false });
  if (businessFilter) query = query.eq("id", businessFilter);
  if (q) query = query.or(`name.ilike.%${q}%,slug.ilike.%${q}%`);

  const { data: businesses } = await query;

  return (
    <AdminShell profile={profile}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-normal text-primary">
              Gestion
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-ink">Commerces</h1>
            <p className="mt-1 text-muted">
              Créer, rechercher, modifier et récupérer le QR code.
            </p>
          </div>
          <form className="grid w-full gap-2 sm:max-w-md sm:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search
                aria-hidden
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-2"
              />
              <Input
                name="q"
                placeholder="Rechercher un commerce"
                defaultValue={q}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="dark">
              Filtrer
            </Button>
          </form>
        </div>
        <BusinessTable businesses={businesses ?? []} />
      </div>
    </AdminShell>
  );
}
