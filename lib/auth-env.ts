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

/**
 * House-key password. FOUNDER_PASSWORD is the production name.
 * AUTH_DEMO_PASSWORD remains a supported alias.
 */
export function houseKeyPassword(): string | undefined {
  return firstEnv("FOUNDER_PASSWORD", "AUTH_DEMO_PASSWORD");
}

export function houseKeyEnabled(): boolean {
  return Boolean(houseKeyPassword());
}

export function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * Canonical Auth.js origin. Production falls back to the house domain
 * when AUTH_URL / NEXTAUTH_URL are empty so Google callback stays on
 * https://projectsixxx.com/api/auth/callback/google.
 */
export function resolveAuthUrl(): string | undefined {
  const explicit = firstEnv("AUTH_URL", "NEXTAUTH_URL");
  if (explicit) return stripTrailingSlash(explicit);

  if (process.env.VERCEL_ENV === "production") {
    return stripTrailingSlash(site.url);
  }

  const vercelHost = firstEnv("VERCEL_URL");
  if (vercelHost) {
    const host = vercelHost.replace(/^https?:\/\//, "");
    return `https://${host}`;
  }

  return undefined;
}

/** Write AUTH_URL when Auth.js would otherwise infer the wrong host. */
export function ensureAuthUrl(): string | undefined {
  const url = resolveAuthUrl();
  if (url && !process.env.AUTH_URL?.trim()) {
    process.env.AUTH_URL = url;
  }
  return process.env.AUTH_URL?.trim()
    ? stripTrailingSlash(process.env.AUTH_URL)
    : url;
}
