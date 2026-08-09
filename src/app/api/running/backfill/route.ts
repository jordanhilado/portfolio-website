import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidateContent } from "@/lib/revalidate";
import { backfillRunPaths } from "@/lib/strava/sync";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/running/backfill - Recompute every run's SVG path from its stored
 * polyline (admin only).
 *
 * Contacts no external service, so retuning the geometry constants in
 * src/lib/strava/route-path.ts costs no Strava API quota.
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    const adminEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
    const email = (session?.user?.email ?? "").toLowerCase().trim();

    if (!email || email !== adminEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await backfillRunPaths();

    revalidateContent();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error backfilling run paths:", error);
    return NextResponse.json(
      { error: "Failed to backfill run paths" },
      { status: 500 }
    );
  }
}
