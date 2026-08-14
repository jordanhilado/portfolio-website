This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Thoughts + Admin System (Setup)

This project includes a secure writing system with an admin dashboard. You can create, edit, delete, and publish posts without redeploying.

### 1) Environment variables

Create a `.env` file with the following keys:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-strong-random-string"
ADMIN_EMAIL="you@example.com"

# Google is the only sign-in provider:
GOOGLE_ID=""
GOOGLE_SECRET=""

# Strava run grid on /running (see "Strava run grid" below):
STRAVA_CLIENT_ID=""
STRAVA_CLIENT_SECRET=""
STRAVA_REFRESH_TOKEN=""
CRON_SECRET=""
```

Notes:
- Use a managed Postgres (Vercel Postgres, Supabase, Neon, etc.). Ensure SSL is enabled.
- `ADMIN_EMAIL` is the only account that can access `/admin`.
- Generate `NEXTAUTH_SECRET` with `openssl rand -base64 32`.
- Generate `CRON_SECRET` with `openssl rand -hex 32`. Vercel sends it as a
  bearer token on cron invocations of `/api/running/sync`.

### 2) Database

Install Prisma client and generate:

```
pnpm approve-builds  # allow prisma postinstall if prompted
pnpm dlx prisma generate
pnpm dlx prisma migrate deploy
# For first-time local setup you can run:
# pnpm dlx prisma migrate dev --name init
```

The schema defines a `Post` model with `title`, `slug`, `content` (markdown), `published`, `coverImage`, timestamps.

### 3) OAuth providers

Configure either GitHub or Google OAuth app:
- Set callback URL to: `http://localhost:3000/api/auth/callback/github` (or `/google`)
- Paste client id/secret in `.env`

### 4) Running locally

```
pnpm dev
```

- Visit `/admin/signin` to sign in; only `ADMIN_EMAIL` can proceed.
- Visit `/admin` to manage posts.
- Public posts live at `/thoughts` and `/thoughts/[slug]`.

### 5) Images in posts

Use Markdown image syntax with fully-qualified URLs:

```
![Alt text](https://example.com/image.jpg)
```

You can set an optional cover image URL when creating or editing a post.

### 5b) Strava run grid

The Running section renders a grid of squares, one per outdoor run, each
showing that run's GPS trace and linking to Strava. Every synced year is in the
grid — `getAllRuns()` in `src/lib/runs.ts` applies no date filter, and
`RunGrid` pages through the result client-side.

Runs are mirrored into the `StravaRun` table rather than fetched live. Sync
happens three ways: a daily Vercel cron (`vercel.json`), the "Sync from Strava"
button in the admin Running tab, and `POST /api/running/sync` directly.

`POST /api/running/sync` with no `?year=` runs an **incremental** sync: it
starts a week before the newest run already stored and walks forward. That is
what the cron does, so it costs one request a day and never needs a constant
bumped in January.

**One-time OAuth setup.** Create an app at
<https://www.strava.com/settings/api> with Authorization Callback Domain
`localhost`, then note the Client ID and Secret. This requires an active paid
Strava subscription — Strava began charging for Standard-tier API access on
2026-06-30.

> Do **not** use the "Your Refresh Token" value shown on that settings page. It
> is scoped `read`, which refreshes fine but cannot read activities. The sync
> route detects this and returns an explicit error.

Authorize with the scope you actually need:

```
https://www.strava.com/oauth/authorize?client_id=CLIENT_ID&response_type=code&redirect_uri=http://localhost/exchange_token&approval_prompt=force&scope=activity:read_all
```

The redirect fails to load — that is expected. Copy `code` out of the URL bar
and exchange it (single-use, expires in minutes):

```bash
curl -X POST https://www.strava.com/oauth/token \
  -F client_id=CLIENT_ID -F client_secret=CLIENT_SECRET \
  -F code=CODE -F grant_type=authorization_code
```

Put the resulting `refresh_token` in `STRAVA_REFRESH_TOKEN`. After the first
refresh the `StravaToken` table becomes the source of truth, since Strava may
rotate the refresh token on any exchange; a rejected token is cleared
automatically so a corrected env var takes effect on the next sync.

**Retuning the visuals.** The geometry constants live in
`src/lib/strava/route-path.ts`. After changing them, `POST
/api/running/backfill` recomputes every stored path without contacting Strava.

**Backfilling history.**

```bash
pnpm backfill:strava          # every historical year, 2020-2025
pnpm backfill:strava 2024     # one year
```

Run locally rather than through the API: a full year is hundreds of sequential
upserts against a `connection_limit=1` pool and would risk the route's
`maxDuration = 60`. It is idempotent, so a second pass reports all zeroes.

A whole year costs two or three of the 200 reads Strava allows per 15 minutes;
the script paces itself anyway, and honours `Retry-After` if it ever does get a
429.

**Re-syncing one year.** `POST /api/running/sync?year=2024` re-walks that
calendar year and prunes anything Strava no longer reports. This is the fix for
a run renamed or deleted on Strava further back than the incremental sync's
one-week lookback, which cannot see it.

### 6) Production

Set the same env vars on Vercel (Project Settings → Environment Variables). Make sure:
- `NEXTAUTH_URL` is the production URL.
- The database is reachable from Vercel.
- Run `prisma migrate deploy` via a build step or Vercel deployment hook.

### 7) Supabase + Vercel: step-by-step

Use Supabase Postgres with Vercel serverless safely and efficiently.

1) Create a Supabase project
- Go to `https://supabase.com` → New Project.
- Pick a strong DB password. Region close to Vercel region.

2) Get the pooled connection string (recommended for serverless)
- In Supabase: Project Settings → Database → Connection string → URI.
- Select the “Pooled connection string” (pgbouncer). It typically looks like:

```
postgresql://postgres:YOUR_PASSWORD@aws-...pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
```

Copy this as your `DATABASE_URL`.

3) Configure Vercel environment variables
- In Vercel Project Settings → Environment Variables, add:
  - `DATABASE_URL` = Supabase pooled URI (as above)
  - `NEXTAUTH_URL` = your production URL (e.g., `https://your-app.vercel.app`)
  - `NEXTAUTH_SECRET` = strong random string (e.g., `openssl rand -base64 32`)
  - `ADMIN_EMAIL` = your email that should have admin access
  - OAuth provider keys: `GOOGLE_ID`, `GOOGLE_SECRET`
- Set each in “Production”; optionally also in “Preview” and “Development”.

4) Configure OAuth providers for production
- For Google: set authorized redirect URI to `https://your-app.vercel.app/api/auth/callback/google`
- Paste client id/secret into Vercel env vars.

5) Run Prisma against Supabase
- From your local machine, set `DATABASE_URL` to the pooled Supabase URI and run:

```
pnpm dlx prisma generate
pnpm dlx prisma migrate deploy
# If first run and no migrations exist yet:
# pnpm dlx prisma migrate dev --name init
```

This creates the `Post` table in Supabase.

6) Deploy on Vercel
- Trigger a new deployment (push to main, or redeploy from the Vercel dashboard).
- Vercel will use the env vars and connect to Supabase in serverless-safe mode via pgbouncer.

7) Verify
- Visit `/admin/signin`, sign in with the `ADMIN_EMAIL` account.
- Create a post at `/admin`.
- Confirm it appears at `/thoughts` and at `/thoughts/[slug]`.

Notes
- Always use the “pooled” connection string for serverless environments to avoid connection exhaustion.
- If you run migrations from your laptop, ensure you export the exact production `DATABASE_URL` to avoid creating a local SQLite file or the wrong DB.
- For previews, you can either reuse the production database or create another Supabase project and store a separate `DATABASE_URL` under Vercel “Preview” env vars.

