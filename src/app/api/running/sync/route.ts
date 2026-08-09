import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidateContent } from "@/lib/revalidate";
import { StravaAuthError, clearStravaToken } from "@/lib/strava/client";
import { syncStravaRuns } from "@/lib/strava/sync";
import { RUNS_YEAR } from "@/lib/runs";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Authorized either by the Vercel Cron shared secret or by an admin session.
 *
 * Vercel attaches `Authorization: Bearer $CRON_SECRET` to cron invocations
 * when CRON_SECRET is set as a project env var. middleware.ts only matches
 * /admin/:path*, so it does not gate this route.
 */
async function isSyncAuthorized(request: Request): Promise<boolean> {
  const cronSecret = process.env.CRON_SECRET;

  if (
    cronSecret &&
    request.headers.get("authorization") === `Bearer ${cronSecret}`
  ) {
    return true;
  }

  const session = await getServerSession(authOptions);
  const adminEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
  const email = (session?.user?.email ?? "").toLowerCase().trim();

  return Boolean(email) && email === adminEmail;
}

async function handleSync(request: Request) {
  try {
    if (!(await isSyncAuthorized(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const yearParam = new URL(request.url).searchParams.get("year");
    const year = yearParam ? Number(yearParam) : RUNS_YEAR;

    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      return NextResponse.json(
        { error: "Invalid year" },
        { status: 400 }
      );
    }

    const result = await syncStravaRuns(year);

    revalidateContent();

    console.log("Strava sync complete:", result);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof StravaAuthError) {
      console.error("Strava authorization error:", error.message);

      // Drop the cached token pair so the next attempt re-seeds from
      // STRAVA_REFRESH_TOKEN — otherwise a rejected token cached in the
      // database would outrank a corrected environment variable.
      await clearStravaToken().catch((clearError) => {
        console.error("Failed to clear cached Strava token:", clearError);
      });

      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    console.error("Error syncing Strava runs:", error);
    return NextResponse.json(
      { error: "Failed to sync Strava runs" },
      { status: 500 }
    );
  }
}

// Vercel Cron issues GET; the admin dashboard posts.
export async function GET(request: Request) {
  return handleSync(request);
}

export async function POST(request: Request) {
  return handleSync(request);
}
