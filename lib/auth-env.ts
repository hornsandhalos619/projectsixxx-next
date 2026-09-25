import { site } from "@/config/site";

function firstEnv(...names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return undefined;
}

/** Google OAuth client from AUTH_GOOGLE_* or GOOGLE_CLIENT_* names. */
export function googleOAuthEnv(): { clientId: string; clientSecret: string } | null {
  const clientId = firstEnv("AUTH_GOOGLE_ID", "GOOGLE_CLIENT_ID");
  const clientSecret = firstEnv("AUTH_GOOGLE_SECRET", "GOOGLE_CLIENT_SECRET");
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

export function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

function vercelHttpsOrigin(): string | undefined {
  const vercelHost = firstEnv("VERCEL_URL");
  if (!vercelHost) return undefined;
  const host = vercelHost.replace(/^https?:\/\//, "");
  return `https://${host}`;
}

/**
 * Canonical Auth.js origin. Production uses AUTH_URL / NEXTAUTH_URL or the house
 * domain so Google stays on https://projectsixxx.com/api/auth/callback/google.
 * Preview uses the preview host so a production AUTH_URL on every Vercel env
 * cannot send preview Google back to the apex.
 */
export function resolveAuthUrl(): string | undefined {
  if (process.env.VERCEL_ENV === "preview") {
    return vercelHttpsOrigin();
  }

  const explicit = firstEnv("AUTH_URL", "NEXTAUTH_URL");
  if (explicit) return stripTrailingSlash(explicit);

  if (process.env.VERCEL_ENV === "production") {
    return stripTrailingSlash(site.url);
  }

  return vercelHttpsOrigin();
}

/** Align AUTH_URL with the host Auth.js should advertise to Google. */
export function ensureAuthUrl(): string | undefined {
  const url = resolveAuthUrl();
  if (url) {
    process.env.AUTH_URL = url;
  }
  return url;
}

/** GET /api/auth/signin/:provider is CSRF-gated in Auth.js and shows Configuration. */
export function isProviderSigninPath(pathname: string): boolean {
  return /^\/api\/auth\/signin\/[^/]+$/.test(pathname);
}

/** Keep OAuth return paths on this origin. */
export function safeCallbackUrl(raw: string | null | undefined): string {
  const value = String(raw ?? "").trim();
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) {
    return value;
  }
  return "/account";
}
