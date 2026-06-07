import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import {
  buildGoogleAuthUrl,
  googleCallbackUrl,
  isGoogleOAuthConfigured,
} from "@/lib/oauth/google";

export const dynamic = "force-dynamic";

// Démarre la connexion Google : pose un cookie anti-CSRF (state + slug + ref)
// puis redirige vers l'écran de consentement Google.
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug")?.trim();
  const ref = request.nextUrl.searchParams.get("ref")?.trim() || null;
  const origin = request.nextUrl.origin;

  if (!slug) {
    return NextResponse.redirect(new URL("/", origin));
  }
  if (!isGoogleOAuthConfigured()) {
    return NextResponse.redirect(new URL(`/c/${slug}?error=google`, origin));
  }

  const state = randomUUID();
  const redirectUri = googleCallbackUrl(origin);

  const cookieStore = await cookies();
  cookieStore.set("g_oauth", JSON.stringify({ state, slug, ref }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return NextResponse.redirect(buildGoogleAuthUrl({ redirectUri, state }));
}
