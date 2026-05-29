import { NextResponse, type NextRequest } from "next/server";
import { runReengagement } from "@/lib/push/reengagement";

export const dynamic = "force-dynamic";

// Déclenché quotidiennement par Vercel Cron (voir vercel.json).
// Vercel envoie automatiquement l'en-tête `Authorization: Bearer $CRON_SECRET`.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET non configuré côté serveur." },
      { status: 503 },
    );
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const summary = await runReengagement();
  return NextResponse.json({ ok: true, ...summary });
}
