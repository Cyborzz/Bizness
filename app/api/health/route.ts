import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// GET /api/health — sonde légère pour le monitoring (UptimeRobot, OVH, etc.).
// Vérifie l'accès DB sans exposer de donnée. 200 si OK, 503 si la base répond mal.
export async function GET() {
  let dbOk = false;
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("businesses")
      .select("id", { count: "exact", head: true });
    dbOk = !error;
  } catch {
    dbOk = false;
  }

  const body = {
    status: dbOk ? "ok" : "degraded",
    db: dbOk,
    time: new Date().toISOString(),
  };

  return NextResponse.json(body, { status: dbOk ? 200 : 503 });
}
