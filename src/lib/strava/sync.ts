/**
 * Mirrors a year of outdoor runs from Strava into the StravaRun table.
 *
 * Idempotent: re-running converges, and a no-op sync issues ~2 queries rather
 * than one per activity.
 */

import { prisma } from "@/lib/prisma";
import {
  StravaActivitySchema,
  fetchAthleteActivityPage,
  getStravaAccessToken,
  type StravaActivity,
} from "./client";
import { polylineToPathD } from "./route-path";

/** Activity types that count as a run. */
const RUN_SPORT_TYPES = ["Run", "TrailRun"];

const PER_PAGE = 200;

/** Runaway guard. 5 x 200 is far beyond any plausible year. */
const MAX_PAGES = 5;

export type SyncResult = {
  year: number;
  /** Activities returned by Strava across all pages. */
  fetched: number;
  /** Activities passing the run + GPS + year filter. */
  matched: number;
  created: number;
  updated: number;
  /** Rows deleted because Strava no longer reports them. */
  removed: number;
  /** Matched but the polyline yielded nothing drawable. */
  skipped: number;
  /** Activities that failed schema validation. */
  malformed: number;
  pages: number;
};

/** True if this activity is an outdoor run we want to display. */
function isOutdoorRun(activity: StravaActivity, year: number): boolean {
  if (RUN_SPORT_TYPES.indexOf(activity.sport_type) === -1) {
    return false;
  }

  // Treadmill runs report trainer=true and/or carry no polyline.
  if (activity.trainer === true) {
    return false;
  }

  const polyline = activity.map?.summary_polyline;
  if (typeof polyline !== "string" || polyline.length === 0) {
    return false;
  }

  return startDateLocalYear(activity.start_date_local) === year;
}

/**
 * Parses Strava's `start_date_local`, which is wall-clock time at the run's
 * location, into a Date holding those same components in UTC.
 *
 * The components are read explicitly rather than handed to `new Date(string)`
 * because the two differ in a way that silently shifts dates by a day: a
 * trailing `Z` parses as UTC, while the same string without one parses as the
 * *server's* local time. Strava documents the `Z`, but a run stored an hour
 * either side of midnight would land on the wrong calendar date — and the
 * wrong year, every New Year's Eve — if that ever changed or a caller passed
 * an offset-less value.
 *
 * Falls back to Date's own parsing for anything unrecognized.
 */
export function parseStravaLocalDate(startDateLocal: string): Date {
  const match = startDateLocal.match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})/
  );

  if (!match) {
    return new Date(startDateLocal);
  }

  return new Date(
    Date.UTC(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
      Number(match[4]),
      Number(match[5]),
      Number(match[6])
    )
  );
}

/**
 * The calendar year the run happened in, in the runner's own timezone. Using
 * `start_date` here would file a 9pm-Dec-31-PST run under the wrong year.
 */
function startDateLocalYear(startDateLocal: string): number {
  return parseStravaLocalDate(startDateLocal).getUTCFullYear();
}

/** Syncs every outdoor run for the given calendar year. */
export async function syncStravaRuns(year: number): Promise<SyncResult> {
  const accessToken = await getStravaAccessToken();

  // Deliberately ±2 days wider than the year: Strava filters on UTC start
  // time while we filter on local date, and this covers the ±14h skew.
  const after = Math.floor(Date.UTC(year - 1, 11, 30) / 1000);
  const before = Math.floor(Date.UTC(year + 1, 0, 2) / 1000);

  const yearStart = new Date(Date.UTC(year, 0, 1));
  const yearEnd = new Date(Date.UTC(year + 1, 0, 1));

  let fetched = 0;
  let malformed = 0;
  let skipped = 0;
  let pages = 0;
  let pagesCompletedCleanly = true;

  type Incoming = {
    stravaId: string;
    name: string;
    sportType: string;
    startDateLocal: Date;
    distanceMeters: number;
    movingTime: number;
    polyline: string;
    pathD: string;
  };

  const incoming: Incoming[] = [];

  try {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const raw = await fetchAthleteActivityPage(accessToken, {
        page,
        perPage: PER_PAGE,
        after,
        before,
      });

      pages = page;
      fetched += raw.length;

      for (let i = 0; i < raw.length; i++) {
        const parsed = StravaActivitySchema.safeParse(raw[i]);

        if (!parsed.success) {
          malformed++;
          continue;
        }

        const activity = parsed.data;

        if (!isOutdoorRun(activity, year)) {
          continue;
        }

        const polyline = activity.map?.summary_polyline as string;
        const pathD = polylineToPathD(polyline);

        if (!pathD) {
          skipped++;
          continue;
        }

        incoming.push({
          stravaId: String(activity.id),
          name: activity.name,
          sportType: activity.sport_type,
          startDateLocal: parseStravaLocalDate(activity.start_date_local),
          distanceMeters: activity.distance,
          movingTime: activity.moving_time,
          polyline,
          pathD,
        });
      }

      if (raw.length < PER_PAGE) {
        break;
      }
    }

    if (pages === MAX_PAGES) {
      console.warn(
        `Strava sync hit the ${MAX_PAGES}-page cap for ${year}; results may be truncated and pruning is suppressed.`
      );
      pagesCompletedCleanly = false;
    }
  } catch (error) {
    // Keep whatever we already collected, but never prune from a partial view.
    pagesCompletedCleanly = false;
    throw error;
  }

  if (fetched === 0) {
    console.warn(
      "Strava returned 0 activities. If this is unexpected, the access token is most likely scoped `read` rather than `activity:read_all`."
    );
  }

  // Read-before-write: one query tells us which rows actually need touching,
  // turning a no-op re-sync from N round trips into ~2 queries.
  const existing = await prisma.stravaRun.findMany({
    where: { startDateLocal: { gte: yearStart, lt: yearEnd } },
    select: { stravaId: true, polyline: true, name: true, pathD: true },
  });

  const existingByStravaId: Record<
    string,
    { polyline: string; name: string; pathD: string }
  > = {};
  for (let i = 0; i < existing.length; i++) {
    existingByStravaId[existing[i].stravaId] = {
      polyline: existing[i].polyline,
      name: existing[i].name,
      pathD: existing[i].pathD,
    };
  }

  let created = 0;
  let updated = 0;

  // Sequential: the Supabase pooled connection string uses connection_limit=1,
  // so Promise.all would only queue and risk pool timeouts.
  for (let i = 0; i < incoming.length; i++) {
    const run = incoming[i];
    const prior = existingByStravaId[run.stravaId];

    if (
      prior &&
      prior.polyline === run.polyline &&
      prior.name === run.name &&
      prior.pathD === run.pathD
    ) {
      continue;
    }

    await prisma.stravaRun.upsert({
      where: { stravaId: run.stravaId },
      create: run,
      update: run,
    });

    if (prior) {
      updated++;
    } else {
      created++;
    }
  }

  // Prune activities deleted, made private, or re-typed on Strava.
  //
  // Both guards are load-bearing: pruning from a partial pagination would
  // delete everything past the failed page, and pruning on an empty result
  // would wipe the year during a Strava outage.
  let removed = 0;

  if (pagesCompletedCleanly && incoming.length > 0) {
    // Array.from, not spread: tsconfig targets es5 without downlevelIteration.
    const seenIds = incoming.map((run) => run.stravaId);

    const deletion = await prisma.stravaRun.deleteMany({
      where: {
        startDateLocal: { gte: yearStart, lt: yearEnd },
        stravaId: { notIn: seenIds },
      },
    });

    removed = deletion.count;
  }

  return {
    year,
    fetched,
    matched: incoming.length,
    created,
    updated,
    removed,
    skipped,
    malformed,
    pages,
  };
}

/**
 * Recomputes `pathD` from stored polylines without contacting Strava.
 *
 * This is what makes retuning the geometry constants cheap — no API quota, no
 * token dependency.
 */
export async function backfillRunPaths(): Promise<{
  total: number;
  rewritten: number;
  skipped: number;
}> {
  const runs = await prisma.stravaRun.findMany({
    select: { id: true, polyline: true, pathD: true },
  });

  let rewritten = 0;
  let skipped = 0;

  for (let i = 0; i < runs.length; i++) {
    const pathD = polylineToPathD(runs[i].polyline);

    if (!pathD) {
      skipped++;
      continue;
    }

    if (pathD === runs[i].pathD) {
      continue;
    }

    await prisma.stravaRun.update({
      where: { id: runs[i].id },
      data: { pathD },
    });

    rewritten++;
  }

  return { total: runs.length, rewritten, skipped };
}
