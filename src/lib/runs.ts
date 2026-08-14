import { prisma } from "@/lib/prisma";
import { formatPostDate } from "@/lib/date";
import {
  fetchAthleteRunTotals,
  getStravaAccessToken,
} from "@/lib/strava/client";
import {
  formatRunningTotals,
  METERS_PER_MILE,
  type RunningTotals,
} from "@/lib/running-totals";

/**
 * Month, day and a two-digit year, e.g. "May 30 '25".
 *
 * The grid spans every year synced, so a bare "May 30" would be ambiguous.
 * Intl has no apostrophe-year pattern, so the parts are assembled by hand.
 *
 * Pinned to UTC, as formatPostDate is: startDateLocal holds the run's
 * wall-clock time stored as UTC components, so reading it back in UTC returns
 * the day the run actually started on.
 */
const RUN_DAY_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const RUN_YEAR_FORMATTER = new Intl.DateTimeFormat("en-US", {
  year: "2-digit",
  timeZone: "UTC",
});

/**
 * All-numeric fallback, e.g. "5/30/25".
 *
 * The tile caption puts distance and date on one line, and at three columns on
 * a 375px phone the tile is roughly 101px — wide enough for "6.21 mi" beside
 * "5/30/25" but not beside "May 30 '25". RunGrid renders both and picks by
 * breakpoint in CSS, so the string is chosen without measuring anything at
 * runtime.
 */
const RUN_DAY_COMPACT_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "numeric",
  day: "numeric",
  year: "2-digit",
  timeZone: "UTC",
});

/** The minimal serializable shape a run tile needs. */
export type RunTile = {
  id: string;
  stravaId: string;
  pathD: string;
  /** Preformatted, e.g. "6.21". */
  miles: string;
  /** Full date for the accessible label, e.g. "Mar 14, 2026". */
  date: string;
  /** Displayed date past the `sm` breakpoint, e.g. "Mar 14 '26". */
  dateShort: string;
  /** Displayed date on narrow phones, e.g. "3/14/26". */
  dateCompact: string;
};

/**
 * Loads every synced run, newest first, preformatted for display.
 *
 * Unfiltered on purpose: the grid shows the whole history, and RunGrid pages
 * through it client-side, so one query and one payload cover every year.
 *
 * Formatting server-side keeps Intl off the client and removes any chance of
 * a locale-driven hydration mismatch.
 *
 * Returns an empty array on failure, mirroring getSiteContent()'s per-source
 * degradation: a database problem hides the grid rather than breaking the page.
 */
export async function getAllRuns(): Promise<RunTile[]> {
  try {
    const runs = await prisma.stravaRun.findMany({
      orderBy: { startDateLocal: "desc" },
      select: {
        id: true,
        stravaId: true,
        pathD: true,
        distanceMeters: true,
        startDateLocal: true,
      },
    });

    return runs.map((run) => ({
      id: run.id,
      stravaId: run.stravaId,
      pathD: run.pathD,
      miles: (run.distanceMeters / METERS_PER_MILE).toFixed(2),
      date: formatPostDate(run.startDateLocal),
      dateShort: `${RUN_DAY_FORMATTER.format(run.startDateLocal)} '${RUN_YEAR_FORMATTER.format(run.startDateLocal)}`,
      dateCompact: RUN_DAY_COMPACT_FORMATTER.format(run.startDateLocal),
    }));
  } catch (error) {
    console.error("Error fetching runs:", error);
    return [];
  }
}

/**
 * Lifetime run totals for the Running blurb: every run on Strava plus the
 * Nike Run Club years that predate it.
 *
 * Read from Strava rather than the StravaRun table, which holds only runs
 * that carry a GPS trace — treadmill runs and untraced uploads are missing
 * there by design.
 *
 * Returns null when Strava is unreachable, which the blurb renders as an em
 * dash — the same per-source degradation getSiteContent() uses, rather than
 * failing the whole page over one sentence.
 */
export async function getRunningTotals(): Promise<RunningTotals | null> {
  try {
    const accessToken = await getStravaAccessToken();
    return formatRunningTotals(await fetchAthleteRunTotals(accessToken));
  } catch (error) {
    console.error("Error fetching running totals:", error);
    return null;
  }
}
