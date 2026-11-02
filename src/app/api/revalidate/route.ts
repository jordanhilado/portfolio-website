import { NextResponse } from "next/server";
import { z } from "zod";
import { revalidatePost } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

const RevalidateSchema = z.object({
  slugs: z.array(z.string().min(1)).max(100),
});

/**
 * Purges cached pages for posts written outside the app.
 *
 * `pnpm thought:sync` writes posts straight to the database from a laptop,
 * which skips the revalidatePost() call the admin API makes. It calls this
 * afterwards so a synced post shows up immediately instead of waiting out
 * the pages' hour-long `revalidate` backstop.
 *
 * Authorized by the same `Bearer $CRON_SECRET` the Vercel cron uses, since
 * the script has no admin session. proxy.ts only matches /admin, so it
 * does not gate this route.
 */
export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (
    !cronSecret ||
    request.headers.get("authorization") !== `Bearer ${cronSecret}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = RevalidateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Expected { slugs: string[] }" }, { status: 400 });
  }

  revalidatePost(...parsed.data.slugs);

  return NextResponse.json({ revalidated: parsed.data.slugs });
}
