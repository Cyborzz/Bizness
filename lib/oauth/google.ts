import "server-only";

// Connexion « un clic » Google pour les CLIENTS (pas les admins).
// Flux OAuth 2.0 direct (hors Supabase Auth) : les clients restent de simples
// lignes `customers`, jamais des auth.users — séparation nette avec l'admin.
// No-op propre si non configuré : le bouton est masqué côté page.

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  );
}

// URL de callback unique (une seule à déclarer dans la console Google).
// Le commerce ciblé voyage dans le paramètre `state`, pas dans l'URL.
export function googleCallbackUrl(origin: string): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL || origin).replace(/\/$/, "");
  return `${base}/auth/google/callback`;
}

export function buildGoogleAuthUrl(params: {
  redirectUri: string;
  state: string;
}): string {
  const url = new URL(GOOGLE_AUTH_URL);
  url.searchParams.set("client_id", process.env.GOOGLE_OAUTH_CLIENT_ID ?? "");
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", params.state);
  url.searchParams.set("access_type", "online");
  url.searchParams.set("prompt", "select_account");
  return url.toString();
}

export async function exchangeGoogleCode(
  code: string,
  redirectUri: string,
): Promise<string | null> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET ?? "",
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json().catch(() => null)) as { access_token?: string } | null;
  return data?.access_token ?? null;
}

export type GoogleUser = {
  email: string;
  emailVerified: boolean;
  firstName: string | null;
  lastName: string | null;
};

export async function fetchGoogleUser(
  accessToken: string,
): Promise<GoogleUser | null> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const data = (await res.json().catch(() => null)) as {
    email?: string;
    email_verified?: boolean;
    given_name?: string;
    family_name?: string;
  } | null;
  if (!data?.email) return null;
  return {
    email: data.email,
    emailVerified: Boolean(data.email_verified),
    firstName: data.given_name ?? null,
    lastName: data.family_name ?? null,
  };
}
