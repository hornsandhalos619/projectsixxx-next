# projectsixxx-next

House site for [projectsixxx.com](https://projectsixxx.com). App Router. Journal shelves live at `/journal` and `/overmind/journal`. Deploy this repo on Vercel. Do not commit secrets or `.env` files.

## Journal desk

Founder and blog editors sign in, then write at `/admin/journal`.

- Create and edit title, slug, date, excerpt, Markdown/MDX body, and draft/published
- Overmind publishes to `/overmind/journal/[slug]`
- House publishes to `/journal/[category]/[slug]`
- Seed MDX under `content/` still lists. Desk writes overlay that store and win on the same slug.

## Vercel environment names

Set these in the Vercel project. Values stay in the dashboard.

### Auth (required for `/admin`)

| Name | Why |
| --- | --- |
| `AUTH_SECRET` | NextAuth session signing |
| `AUTH_URL` | Canonical origin, `https://projectsixxx.com` in production |
| `AUTH_GOOGLE_ID` | Google OAuth client id (preferred founder path) |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `FOUNDER_EMAILS` | Comma-separated allowlist. Include `hornsandhalos619@gmail.com` |

Google Cloud redirect URI: `https://projectsixxx.com/api/auth/callback/google` (plus each preview origin you use). After changing `FOUNDER_EMAILS`, sign out and sign in again.

### Emergency demo sign-in

| Name | Why |
| --- | --- |
| `AUTH_DEMO` | Set `1` to enable the email/password provider |
| `AUTH_DEMO_PASSWORD` | Shared password for the demo provider |

Use the founder email from `FOUNDER_EMAILS` with that password at `/signin`.

Optional: `AUTH_TWITTER_ID`, `AUTH_TWITTER_SECRET`.

### Journal storage (pick one)

Writes need a durable backend. First match wins:

1. `DATABASE_URL` or `POSTGRES_URL` — Neon / Vercel Postgres. Table `journal_posts` is created on first save.
2. `BLOB_READ_WRITE_TOKEN` — Vercel Blob JSON under `journal-cms/`.
3. `GITHUB_TOKEN` — GitHub Contents API writes MDX into `content/` on `GITHUB_BRANCH` (default `main`). Optional `GITHUB_REPO` (`owner/name`); otherwise Vercel git metadata is used.

Local `next dev` without those vars writes `data/journal-cms.json` (gitignored). That file path is for a laptop only. Vercel needs Neon, Blob, or GitHub.

## Local

```bash
cp .env.example .env.local
# set AUTH_SECRET, AUTH_DEMO=1, AUTH_DEMO_PASSWORD, FOUNDER_EMAILS
npm install
npm run dev
```

Sign in at `/signin`, then open `/admin/journal`.

```bash
npm run build
```
