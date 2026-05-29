import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/queries";
import { getBusinessFilter } from "@/lib/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { toCsv } from "@/lib/utils/csv";

export const dynamic = "force-dynamic";

export async function GET() {
  const { profile } = await requireAdmin();
  const supabase = createAdminClient();
  const filter = getBusinessFilter(profile);

  let query = supabase
    .from("customers")
    .select(
      "id,first_name,last_name,phone,email,consent_marketing,created_at,business_id,businesses(name)",
    )
    .order("created_at", { ascending: false });
  if (filter) query = query.eq("business_id", filter);
  const { data } = await query;

  const rows = (data ?? []).map((row) => {
    const business = Array.isArray(row.businesses) ? row.businesses[0] : row.businesses;
    return {
      id: row.id,
      commerce: business?.name ?? "",
      prenom: row.first_name,
      nom: row.last_name ?? "",
      telephone: row.phone ?? "",
      email: row.email ?? "",
      consent_marketing: row.consent_marketing ? "oui" : "non",
      inscrit_le: row.created_at,
    };
  });

  const csv = toCsv(rows, [
    { key: "id", label: "ID" },
    { key: "commerce", label: "Commerce" },
    { key: "prenom", label: "Prénom" },
    { key: "nom", label: "Nom" },
    { key: "telephone", label: "Téléphone" },
    { key: "email", label: "Email" },
    { key: "consent_marketing", label: "Marketing" },
    { key: "inscrit_le", label: "Inscrit le" },
  ]);

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="clients-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
