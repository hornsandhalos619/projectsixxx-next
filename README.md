# projectsixxx-next

House site for [projectsixxx.com](https://projectsixxx.com). App Router. Journal shelves live at `/journal` and `/overmind/journal`. Deploy this repo on Vercel. Do not commit secrets or `.env` files.

## Founder desk

Role-gated consoles under `/admin`. Wrong role is a public 404 (`notFound()`), not a 403.

| Path | Who |
| --- | --- |
| `/admin/journal` | Founder + Blog Admin |
| `/admin/homepage` | Founder + Blog Admin |
| `/admin/shop` | Founder + Shop Admin |
| `/admin/gallery` | Founder |
| `/admin/library` | Founder |
| `/admin/house` | Founder |

- Journal: create / edit / publish. Status `draft` or `published`. House and Overmind lanes. Public routes stay published-only.
- House: list emails and roles. Grant or revoke `blog_admin` and `shop_admin`. Founder is never self-serve — only `FOUNDER_EMAILS`.
- Gallery: artists, works, media URLs, homepage feature flags.
- Homepage: quote / excerpt / literature slots.
- Shop: affiliate product CRUD. Public outbound keeps `rel="sponsored nofollow"`.
- Library: titles, sample paragraphs, homepage feature flags.

Seed MDX and config stay in the tree. Desk writes overlay that store and win on the same slug.

## Vercel environment names

Set these in the Vercel project. Values stay in the dashboard. This list is names only — never invent live values in git.

### Auth (required for `/admin`)

Set these on the Vercel project for Production and Preview. Values stay in the dashboard.

| Name | Why |
| --- | --- |
| `AUTH_SECRET` | NextAuth session signing. Generate with `openssl rand -base64 32`. |
| `AUTH_URL` | Production: `https://projectsixxx.com`. Preview: leave unset so Auth.js uses the preview host, or set the preview origin. |
| `AUTH_GOOGLE_ID` | Google OAuth client id (`GOOGLE_CLIENT_ID` is also read) |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret (`GOOGLE_CLIENT_SECRET` is also read) |
| `FOUNDER_EMAILS` | Comma-separated allowlist. First entry is the `6` house-key alias target. |
| `FOUNDER_PASSWORD` | House-key password. Presence of this value registers the credentials provider. |

`AUTH_DEMO_PASSWORD` is still read when `FOUNDER_PASSWORD` is empty. After changing `FOUNDER_EMAILS`, sign out and sign in again.

House-key login accepts username `6` or any email. `6` maps to the first `FOUNDER_EMAILS` address, display name `6`, role via `roleForEmail`. A founder email with the same password also works. Founder role seeds from `FOUNDER_EMAILS` after sign-in. First signup is Member.

Optional: `AUTH_TWITTER_ID`, `AUTH_TWITTER_SECRET`.

### Google Cloud Console (OAuth 2.0 Web client)

Create a **Web application** client. Authorized JavaScript origins and redirect URIs must match the house origin Auth.js sends.

**Production**

- Authorized JavaScript origins: `https://projectsixxx.com`
- Authorized redirect URI: `https://projectsixxx.com/api/auth/callback/google`

**Local (`next dev`)**

- Authorized JavaScript origins: `http://localhost:3000`
- Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

**Preview (each Vercel preview origin you use)**

- Authorized JavaScript origins: `https://<preview>.vercel.app`
- Authorized redirect URI: `https://<preview>.vercel.app/api/auth/callback/google`

`www.projectsixxx.com` already 308s to the apex. Keep Console entries on `https://projectsixxx.com`.

After saving Console URIs, wait a few minutes, then sign in from `/signin` with **Continue with Google**. The live POST uses `redirect_uri=https://projectsixxx.com/api/auth/callback/google`.

### Live-edit store (preferred)

| Name | Why |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key (documented; server prefers service role) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server writes. Never expose in HTML or client bundles. |

Apply `supabase/migrations/0001_house_cms.sql` in the Supabase SQL editor. Then optional seed:

```bash
npx tsx scripts/seed-cms.ts
```

Seed copies existing MDX/config into empty tables. It does not delete files.

### Journal fallbacks (first match after Supabase)

1. `DATABASE_URL` or `POSTGRES_URL` — Neon / Vercel Postgres
2. `BLOB_READ_WRITE_TOKEN` — Vercel Blob JSON under `journal-cms/` and optional media uploads
3. `GITHUB_TOKEN` — GitHub Contents API writes MDX into `content/` on `GITHUB_BRANCH` (default `main`). Optional `GITHUB_REPO`

Local `next dev` without those vars writes gitignored files under `data/`. That path is for a laptop only.

### Optional site settings

| Name | Why |
| --- | --- |
| `HORNS_AND_HALOS_URL` | External portal CTA |
| `SHOPIFY_URL` | Primary shop outbound (display-only on House console) |
| `SPREADSHOP_URL` | Paused lane |

## Local

```bash
cp .env.example .env.local
# set AUTH_SECRET, FOUNDER_PASSWORD, FOUNDER_EMAILS
# optional: AUTH_GOOGLE_ID + AUTH_GOOGLE_SECRET for Google
npm install
npm run dev
```

Sign in at `/signin` as `6` or the founder email, then open `/admin`.

When `FOUNDER_PASSWORD` (or `AUTH_DEMO_PASSWORD`) and Google keys are set, `GET /api/auth/providers` includes both:

```json
{
  "google": { "id": "google", "name": "Google", "type": "oidc" },
  "credentials": { "id": "credentials", "name": "House key", "type": "credentials" }
}
```

```bash
npm test
npm run build
```
