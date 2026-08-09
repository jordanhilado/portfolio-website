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
 * Day and month only, e.g. "May 30".
 *
 * The tile caption puts distance and date on one line, and "May 30, 2026"
 * alongside "6.21 mi" is wider than the ~101px tiles on a 375px phone, so it
 * would wrap. The year is redundant on a grid that is one year by
 * construction, and the full date is still carried in the tile's aria-label.
 *
 * Pinned to UTC for the same reason formatPostDate is: startDateLocal holds
 * the run's wall-clock time stored as UTC components, so reading it back in
 * UTC returns the day the run actually started on.
 */
const RUN_DAY_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

/**
 * The year of runs shown on /running.
 *
 * Deliberately a constant rather than `new Date().getFullYear()`, which would
 * silently empty the grid at midnight on January 1st. The sync route accepts
 * `?year=`, and the table has no year constraint, so next year's runs can be
 * synced before this flips.
 */
export const RUNS_YEAR = 2026;

/** The minimal serializable shape a run tile needs. */
export type RunTile = {
  id: string;
  stravaId: string;
  pathD: string;
  /** Preformatted, e.g. "6.21". */
  miles: string;
  /** Full date for the accessible label, e.g. "Mar 14, 2026". */
  date: string;
  /** Displayed date, year omitted, e.g. "Mar 14". */
  dateShort: string;
};

/**
 * Loads a year of runs, newest first, preformatted for display.
 *
 * Formatting server-side keeps Intl off the client and removes any chance of
 * a locale-driven hydration mismatch.
 *
 * Returns an empty array on failure, mirroring getSiteContent()'s per-source
 * degradation: a database problem hides the grid rather than breaking the page.
 */
export async function getRunsForYear(year: number): Promise<RunTile[]> {
  try {
    const runs = await prisma.stravaRun.findMany({
      where: {
        startDateLocal: {
          gte: new Date(Date.UTC(year, 0, 1)),
          lt: new Date(Date.UTC(year + 1, 0, 1)),
        },
      },
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
      dateShort: RUN_DAY_FORMATTER.format(run.startDateLocal),
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
 * Read from Strava rather than the StravaRun table, which holds only the year
 * the grid displays and only runs that carry a GPS trace.
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
