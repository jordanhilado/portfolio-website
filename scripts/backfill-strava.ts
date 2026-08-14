/**
 * Backfills historical years of runs from Strava into the StravaRun table.
 *
 *   pnpm backfill:strava              # every year of history, 2020-2025
 *   pnpm backfill:strava 2024         # one year
 *
 * Run locally rather than through POST /api/running/sync?year=, which carries
 * `maxDuration = 60`: a full year is hundreds of sequential upserts against a
 * `connection_limit=1` Supabase pool, and blowing that budget mid-year leaves
 * the sync unable to prune. Here it just takes as long as it takes.
 *
 * Idempotent, because syncStravaRuns is: re-running reports zeroes.
 *
 * Quota: one token exchange plus roughly two or three read requests per year,
 * against a ceiling of 200 reads per 15 minutes. The pauses below exist so a
 * mistaken re-run loop stays polite, not because a single pass is close to any
 * limit.
 */
import { StravaAuthError, StravaRateLimitError, sleep } from "@/lib/strava/client";
import { MAX_PAGES, syncStravaRuns } from "@/lib/strava/sync";
import { prisma } from "@/lib/prisma";

/**
 * Years to sync when none are named.
 *
 * The account's history: 2020 holds a single run, 2021 and 2022 are empty, and
 * 2026 is left out because the daily cron owns it. Probed by running this
 * script against 2018 and 2019, which returned nothing.
 */
const DEFAULT_YEARS = [2025, 2024, 2023, 2022, 2021, 2020];

/** Courtesy pause between years, on top of the per-page pause in the sync. */
const YEAR_DELAY_MS = 5000;

function parseYears(argv: string[]): number[] {
  if (argv.length === 0) {
    return DEFAULT_YEARS;
  }

  return argv.map((arg) => {
    const year = Number(arg);

    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      throw new Error(`"${arg}" is not a plausible year.`);
    }

    return year;
  });
}

async function main(): Promise<void> {
  const years = parseYears(process.argv.slice(2));

  console.log(`Backfilling Strava runs for: ${years.join(", ")}\n`);

  for (let i = 0; i < years.length; i++) {
    if (i > 0) {
      await sleep(YEAR_DELAY_MS);
    }

    const year = years[i];
    const result = await syncStravaRuns(year);

    console.log(
      `${year}: fetched ${result.fetched}, matched ${result.matched}, ` +
        `created ${result.created}, updated ${result.updated}, ` +
        `removed ${result.removed}, skipped ${result.skipped}, ` +
        `malformed ${result.malformed}, pages ${result.pages}`
    );

    // Hitting the cap means the year is both truncated and unpruned, which
    // looks identical to a clean sync in the numbers above.
    if (result.pages === MAX_PAGES) {
      console.warn(
        `  WARNING: ${year} hit the ${MAX_PAGES}-page cap. Results are truncated and nothing was pruned.`
      );
    }
  }

  console.log("\nDone.");
}

main()
  .catch((error) => {
    if (error instanceof StravaAuthError) {
      console.error(`\nStrava rejected our credentials: ${error.message}`);
      console.error(
        "Re-run the OAuth flow with scope=activity:read_all, update STRAVA_REFRESH_TOKEN, and delete the StravaToken row so the new value is picked up."
      );
    } else if (error instanceof StravaRateLimitError) {
      console.error(`\n${error.message}`);
    } else {
      console.error("\nBackfill failed:", error);
    }

    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
