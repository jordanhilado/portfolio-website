# jordanhilado.com

Next.js on Vercel, with Supabase Postgres through Prisma.

## Local

```bash
pnpm install
pnpm dev                  # http://localhost:3000, admin at /admin
```

Needs a `.env` with `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`,
`ADMIN_EMAIL`, `GOOGLE_ID`, `GOOGLE_SECRET`, `STRAVA_CLIENT_ID`,
`STRAVA_CLIENT_SECRET`, `STRAVA_REFRESH_TOKEN` and `CRON_SECRET`.

## Thoughts

Markdown files in `thoughts/` (gitignored) sync to the `Post` table.

```bash
pnpm thought:new "Title"        # new file in thoughts/
pnpm thought:sync               # push all files
pnpm thought:sync <file>        # push one file
pnpm thought:sync --dry-run     # preview, write nothing
pnpm thought:pull               # download posts missing locally
```

Leave `slug:` blank on a new post, and the first sync fills it in. Set
`published: false` for drafts.

## Running

```bash
pnpm seed:races                 # after editing scripts/seed-races.ts
pnpm backfill:strava [year]     # mirror old Strava runs
```

## Database

```bash
pnpm prisma migrate deploy      # apply migrations (not run on deploy)
pnpm prisma studio              # browse the database
```
