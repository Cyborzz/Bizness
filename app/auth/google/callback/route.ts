import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getOrCreateCard } from "@/lib/loyalty/signup";
import {
  exchangeGoogleCode,
  fetchGoogleUser,
  googleCallbackUrl,
} from "@/lib/oauth/google";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// Retour du consentement Google : vérifie l'anti-CSRF, échange le code,
// récupère l'email/nom, puis crée (ou retrouve) la carte fidélité du client.
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  const cookieStore = await cookies();
  const raw = cookieStore.get("g_oauth")?.value;
  cookieStore.delete("g_oauth");

  const fail = (slug?: string) =>
    NextResponse.redirect(new URL(`/c/${slug ?? ""}?error=google`, origin));

  if (!raw) return fail();

  let parsed: { state?: string; slug?: string; ref?: string | null };
  try {
    parsed = JSON.parse(raw);
  } catch {
    return fail();
  }
  const { slug, ref } = parsed;

  // Anti-CSRF : le state renvoyé par Google doit matcher celui du cookie.
  if (!slug || !code || !state || state !== parsed.state) {
    return fail(slug);
  }

  const accessToken = await exchangeGoogleCode(code, googleCallbackUrl(origin));
  if (!accessToken) return fail(slug);

  const user = await fetchGoogleUser(accessToken);
  if (!user || !user.emailVerified) return fail(slug);

  const supabase = createAdminClient();
  const { data: business } = await supabase
    .from("businesses")
    .select("id,is_active")
    .eq("slug", slug)
    .maybeSingle();

  if (!business || !business.is_active) return fail(slug);

  const firstName = user.firstName?.trim() || user.email.split("@")[0];

  const result = await getOrCreateCard({
    businessId: business.id,
    first_name: firstName,
    last_name: user.lastName,
    email: user.email,
    // La connexion Google vaut consentement fidélité ; le marketing reste opt-in.
    consent_loyalty: true,
    consent_marketing: false,
    ref: ref ?? null,
  });

  if (!result.cardId) return fail(slug);

  return NextResponse.redirect(new URL(`/card/${result.cardId}`, origin));
}
