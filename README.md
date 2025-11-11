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

## Blog + Admin System (Setup)

This project includes a secure blog system with an admin dashboard. You can create, edit, delete, and publish posts without redeploying.

### 1) Environment variables

Create a `.env` file with the following keys:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-strong-random-string"
ADMIN_EMAIL="you@example.com"

# At least one provider:
GITHUB_ID=""
GITHUB_SECRET=""
GOOGLE_ID=""
GOOGLE_SECRET=""
```

Notes:
- Use a managed Postgres (Vercel Postgres, Supabase, Neon, etc.). Ensure SSL is enabled.
- `ADMIN_EMAIL` is the only account that can access `/admin`.
- Generate `NEXTAUTH_SECRET` with `openssl rand -base64 32`.

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
- Public blog lives at `/blog` and `/blog/[slug]`.

### 5) Images in posts

Use Markdown image syntax with fully-qualified URLs:

```
![Alt text](https://example.com/image.jpg)
```

You can set an optional cover image URL when creating or editing a post.

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
  - OAuth provider keys: `GITHUB_ID`, `GITHUB_SECRET` and/or `GOOGLE_ID`, `GOOGLE_SECRET`
- Set each in “Production”; optionally also in “Preview” and “Development”.

4) Configure OAuth providers for production
- For GitHub: set callback to `https://your-app.vercel.app/api/auth/callback/github`
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
- Confirm it appears at `/blog` and at `/blog/[slug]`.

Notes
- Always use the “pooled” connection string for serverless environments to avoid connection exhaustion.
- If you run migrations from your laptop, ensure you export the exact production `DATABASE_URL` to avoid creating a local SQLite file or the wrong DB.
- For previews, you can either reuse the production database or create another Supabase project and store a separate `DATABASE_URL` under Vercel “Preview” env vars.

