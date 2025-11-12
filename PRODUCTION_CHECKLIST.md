# Production Error Checklist - 500 on /blogs

## What Was Fixed

Added proper error handling to all `/api/posts/*` routes. Now when errors occur, they will:

- Be logged to console with descriptive messages
- Return proper JSON error responses with details
- Help identify the root cause

## Root Cause Checklist

The 500 error is likely caused by one of these issues in production:

### 1. ✅ Database Connection (Most Likely)

**Check:**

- [ ] `DATABASE_URL` environment variable is set in production
- [ ] Database is accessible from your production server
- [ ] Connection string format is correct: `postgresql://user:password@host:port/database?schema=public`
- [ ] Database server allows connections from your production server's IP

**Test:**

```bash
# In production, check if DATABASE_URL is set
echo $DATABASE_URL
```

### 2. ✅ Prisma Client Generation

**Check:**

- [ ] `prisma generate` runs during the build process
- [ ] `node_modules/.prisma/client` exists in production

**Fix:** Add to your build script in `package.json`:

```json
{
  "scripts": {
    "build": "prisma generate && next build"
  }
}
```

Or ensure your deployment platform (Vercel/Railway/etc.) runs `prisma generate` automatically.

### 3. ✅ Database Migrations

**Check:**

- [ ] Database has the `Post` table with correct schema
- [ ] All migrations have been run in production

**Fix:**

```bash
# Run migrations in production
npx prisma migrate deploy
```

### 4. ✅ Environment Variables

**Check in your deployment platform:**

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXTAUTH_SECRET` - For authentication
- [ ] `NEXTAUTH_URL` - Your production URL
- [ ] `ADMIN_EMAIL` - Admin email for post management
- [ ] Any OAuth credentials (Google, GitHub, etc.)

## How to Debug

### Step 1: Check Production Logs

After deploying the fix, visit `/blogs` again and check your production logs. You should now see detailed error messages like:

```
Error fetching posts: <actual error message>
```

### Step 2: Common Error Messages & Solutions

**"Cannot find module '@prisma/client'"**

- Solution: Ensure `prisma generate` runs during build

**"Can't reach database server"**

- Solution: Check DATABASE_URL and firewall rules

**"Invalid connection string"**

- Solution: Verify DATABASE_URL format

**"Table 'Post' does not exist"**

- Solution: Run `prisma migrate deploy`

### Step 3: Test Database Connection

You can add a simple health check endpoint to test the database:

```typescript
// src/app/api/health/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", database: "connected" });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown",
      },
      { status: 500 }
    );
  }
}
```

Visit `/api/health` to test if the database is accessible.

## Deployment Platform Specific

### Vercel

- Set environment variables in Project Settings → Environment Variables
- Ensure Postgres database is connected
- Check build logs for `prisma generate` output

### Railway

- Add DATABASE_URL in Variables tab
- Ensure Postgres service is running
- Check deployment logs

### Other Platforms

- Ensure DATABASE_URL is set as environment variable
- Ensure build process includes `prisma generate`
- Ensure Prisma migrations are run before starting the app

## Next Steps

1. Deploy the updated code with error handling
2. Check production logs for the actual error message
3. Follow the checklist above based on the error
4. Test `/api/health` endpoint if you add it

Once you see the actual error in the logs, you'll know exactly what to fix!
