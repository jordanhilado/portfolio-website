/**
 * Seeds the Race table.
 *
 * Races happen a few times a year, so there is no admin UI for them — this
 * script is how they get added and edited. It upserts on `slug`, so editing a
 * value below and re-running updates the row in place rather than duplicating
 * it. Run with `npm run seed:races`.
 *
 * PrismaClient is imported directly rather than through `@/lib/prisma` so the
 * script does not depend on tsconfig path resolution under tsx.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** "3:01:47" or "58:12" -> total seconds. */
function hms(value: string): number {
  return value
    .split(":")
    .map(Number)
    .reduce((total, part) => total * 60 + part, 0);
}

/** "6:44" (minutes and seconds per mile) -> seconds per mile. */
const pace = hms;

/**
 * The races, in any order — the page sorts them by date, newest first. Written
 * in the units they are read in: the parse helpers above do the arithmetic so
 * no value here has to be computed by hand.
 *
 * Times, paces and age-group ranks are transcribed from each race's official
 * results page (`resultsUrl`). The totals next to those ranks are not printed
 * on the pages, so they are counted from the same results feeds: every ranked
 * finisher of the runner's gender in the runner's age bracket.
 *
 * Elevation is the one figure no timing provider publishes, so it comes from
 * the matching Strava activity's elevation gain, converted metres -> feet.
 *
 * `imageUrl` stays null until square photos exist. Adding the photo's host to
 * `images.remotePatterns` in next.config.js is required before a remote image
 * will render.
 */
const RACES = [
  {
    slug: "long-beach-marathon-2025",
    name: "Long Beach Marathon",
    // Pinned to UTC so the stored instant is the calendar day of the race
    // regardless of the machine running the seed, matching how the rest of the
    // site reads dates back (see formatPostDate in src/lib/date.ts).
    date: new Date("2025-10-05T00:00:00Z"),
    timeSeconds: hms("3:18:24"),
    paceSecondsPerMile: pace("7:34"),
    elevationFeet: 456, // Strava 16043854348: 139m
    ageGroupRank: 33,
    ageGroupTotal: 404,
    ageGroup: "M20-24",
    imageUrl: null,
    resultsUrl: "https://results2.xacte.com/#/e/2611/searchable/24343",
  },
  {
    slug: "los-angeles-marathon-2026",
    name: "Los Angeles Marathon",
    date: new Date("2026-03-08T00:00:00Z"),
    timeSeconds: hms("3:01:07"),
    paceSecondsPerMile: pace("6:54"),
    elevationFeet: 1017, // Strava 17651616115: 310m
    ageGroupRank: 27,
    ageGroupTotal: 1220,
    ageGroup: "M20-24",
    imageUrl: null,
    resultsUrl: "https://results2.xacte.com/#/e/2626/searchable/11282",
  },
  {
    // Run Sunday July 26 — ChronoTrack's page header shows July 25, the first
    // day of the two-day event, but the entry's own start and splits are the
    // 26th, and so is the Strava activity.
    slug: "san-francisco-marathon-2026",
    name: "San Francisco Marathon",
    date: new Date("2026-07-26T00:00:00Z"),
    timeSeconds: hms("2:56:43"),
    paceSecondsPerMile: pace("6:44"),
    elevationFeet: 1332, // Strava 19474701789: 406m
    ageGroupRank: 11,
    ageGroupTotal: 647,
    ageGroup: "M20-29",
    imageUrl: null,
    resultsUrl: "https://live.chronotrack.com/event/91608/results/entry/79142950",
  },
];

async function main() {
  for (const race of RACES) {
    const { slug, ...fields } = race;
    await prisma.race.upsert({
      where: { slug },
      update: fields,
      create: { slug, ...fields },
    });
    console.log(`Seeded ${slug}`);
  }

  const total = await prisma.race.count();
  console.log(`Done. ${total} race(s) in the database.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
