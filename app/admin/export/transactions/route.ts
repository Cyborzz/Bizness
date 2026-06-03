import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/queries";
import { canUseFullPortal, getBusinessFilter } from "@/lib/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { toCsv } from "@/lib/utils/csv";

export const dynamic = "force-dynamic";

export async function GET() {
  const { profile } = await requireAdmin();
  if (!canUseFullPortal(profile)) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  const supabase = createAdminClient();
  const filter = getBusinessFilter(profile);

  let query = supabase
    .from("transactions")
    .select(
      "id,type,value,note,created_at,business_id,businesses(name),customers(first_name,last_name,phone)",
    )
    .order("created_at", { ascending: false })
    .limit(5000);
  if (filter) query = query.eq("business_id", filter);
  const { data } = await query;

  const rows = (data ?? []).map((row) => {
    const business = Array.isArray(row.businesses) ? row.businesses[0] : row.businesses;
    const customer = Array.isArray(row.customers) ? row.customers[0] : row.customers;
    return {
      id: row.id,
      type: row.type,
      valeur: row.value,
      commerce: business?.name ?? "",
      prenom: customer?.first_name ?? "",
      nom: customer?.last_name ?? "",
      telephone: customer?.phone ?? "",
      note: row.note ?? "",
      date: row.created_at,
    };
  });

  const csv = toCsv(rows, [
    { key: "id", label: "ID" },
    { key: "type", label: "Type" },
    { key: "valeur", label: "Valeur" },
    { key: "commerce", label: "Commerce" },
    { key: "prenom", label: "Prénom" },
    { key: "nom", label: "Nom" },
    { key: "telephone", label: "Téléphone" },
    { key: "note", label: "Note" },
    { key: "date", label: "Date" },
  ]);

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="transactions-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
