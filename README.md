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

## Resume

LaTeX source and compiled PDF live in `src/assets/resume/`. Needs a TeX
install with `latexmk` and `pdflatex` (MacTeX on macOS). Only the `.tex` and
`.pdf` are committed; aux files are gitignored.

```bash
cd src/assets/resume
latexmk -pdf Jordan_Ali_Hilado_2026.tex         # build the PDF
latexmk -pdf -pvc Jordan_Ali_Hilado_2026.tex    # rebuild on every save
latexmk -c                                      # remove aux files, keep PDF
latexmk -C                                      # remove aux files and PDF
latexmk -C && latexmk -pdf Jordan_Ali_Hilado_2026.tex   # clean rebuild
```
