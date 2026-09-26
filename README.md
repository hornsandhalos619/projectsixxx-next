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

Set these on the Vercel project for Production (and Preview if you sign in there). Values stay in the dashboard.

House login is self-managed credentials only: username or email + password on `/signin`. `/login` permanently redirects to `/signin`. First signup is a Member. Founder is seeded only through `FOUNDER_EMAILS` (case-insensitive). There is no role switcher and no self-serve Founder.

| Name | Why |
| --- | --- |
| `AUTH_SECRET` | Auth.js session signing. Generate with `openssl rand -base64 32`. `NEXTAUTH_SECRET` is also read. |
| `AUTH_URL` | Production: `https://projectsixxx.com`. Preview: leave unset so Auth.js uses the preview host. |
| `AUTH_TRUST_HOST` | `true` on Vercel. The app also sets `trustHost: true`. |
| `FOUNDER_EMAILS` | Comma-separated allowlist, case-insensitive. Include `hornsandhalos619@gmail.com`. After sign-in, that address lands as Founder on `/account`. |

Production also needs a durable house-accounts store (passwords are bcrypt-hashed; never commit them):

| Name | Why |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Preferred store. Apply `supabase/migrations/0002_house_accounts.sql`. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server reads and writes `house_accounts`. |
| `DATABASE_URL` or `POSTGRES_URL` | Fallback store (Neon / Vercel Postgres). Creates `house_accounts` if needed. |

After changing `FOUNDER_EMAILS`, sign out and sign in again so the session re-seeds Founder.

### Unused / later auth names

| Name | Why |
| --- | --- |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Optional leftovers (`GOOGLE_CLIENT_*` aliases too). Not required. Google is not a sign-in option. |
| `AUTH_TWITTER_ID` / `AUTH_TWITTER_SECRET` | Future X OAuth follow-up. Not wired in this PR. |
| `AUTH_DEMO` / `AUTH_DEMO_PASSWORD` | Retired shared-password emergency path. Do not set. |

### Live-edit store (preferred)

| Name | Why |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key (documented; server prefers service role) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server writes. Never expose in HTML or client bundles. |

Apply `supabase/migrations/0001_house_cms.sql` and `supabase/migrations/0002_house_accounts.sql` in the Supabase SQL editor. Then optional seed:

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
| `NEXT_PUBLIC_R001_ADS_BASE` | Optional public folder for the six R001 mp4s. Empty serves `/ads/r001/` |

## R001 reels

Six H.264 cuts. Drop the production binaries at `public/ads/r001/` using the locked filenames in that folder’s README, or point `NEXT_PUBLIC_R001_ADS_BASE` at a Vercel Blob / CDN folder that already holds them. The house splash plays one cut per two UTC calendar days (same cut for every visitor in that pair). `prefers-reduced-motion` skips the splash. Dismiss is stored in `sessionStorage`. Footer Marks strip links each cut.

## Local

```bash
cp .env.example .env.local
# set AUTH_SECRET and FOUNDER_EMAILS
# laptop house keys persist in gitignored data/house-accounts.json
npm install
npm run dev
```

Create a house key at `/signin` (username + email + password). Use a `FOUNDER_EMAILS` address to land as Founder on `/account`, then open `/admin`.

```bash
npm test
npm run build
```
