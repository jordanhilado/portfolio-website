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
import { PrismaClient, RaceDistance } from "@prisma/client";

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
 * `imageUrl` is the photo's public URL in the `race-photos` Supabase Storage
 * bucket, or null to render the placeholder. It has to be filled in here, not
 * in the database directly: the upsert writes every field, so a URL set
 * anywhere else is overwritten with whatever this file says the next time the
 * script runs.
 */
const PHOTOS =
  "https://snxrkwpgkkydsbizqsaz.supabase.co/storage/v1/object/public/race-photos";
const RACES = [
  {
    slug: "surf-city-half-marathon-2024",
    name: "Surf City Half Marathon",
    date: new Date("2024-02-04T00:00:00Z"),
    timeSeconds: hms("1:41:35"),
    paceSecondsPerMile: pace("7:45"),
    elevationFeet: 342, // Strava 10696658467: 104.2m
    ageGroupRank: 38,
    ageGroupTotal: 284,
    ageGroup: "M20-24",
    distance: RaceDistance.HALF_MARATHON,
    imageUrl: null,
    resultsUrl: "https://results2.xacte.com/#/e/2531/searchable/6782",
  },
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
    distance: RaceDistance.MARATHON,
    imageUrl: `${PHOTOS}/lbm-1.jpg`,
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
    distance: RaceDistance.MARATHON,
    imageUrl: `${PHOTOS}/lam.jpg`,
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
    distance: RaceDistance.MARATHON,
    imageUrl: `${PHOTOS}/sfm.jpg`,
    resultsUrl: "https://live.chronotrack.com/event/91608/results/entry/79142950",
  },
  {
    // A midnight New Year's run: RaceRoster dates the event Dec 31, but the
    // gun went at midnight and the Strava activity starts Jan 1 00:00.
    //
    // RaceRoster prints "12 / 1296" for the division, but that total counts
    // every gender in 20 to 29 while the rank is among men only (the women's
    // division places restart at 1). 441 is the men in 20 to 29, matching the
    // convention above.
    slug: "lululemon-run-with-the-roses-5k-2026",
    name: "lululemon 5K Run with the Roses",
    date: new Date("2026-01-01T00:00:00Z"),
    timeSeconds: hms("19:19"),
    paceSecondsPerMile: pace("6:13"),
    elevationFeet: 86, // Strava 16901285741: 26.2m
    ageGroupRank: 12,
    ageGroupTotal: 441,
    ageGroup: "M20-29",
    distance: RaceDistance.FIVE_K,
    imageUrl: null,
    resultsUrl:
      "https://results.raceroster.com/v3/events/ewzwgkt9tw639anp/race/249806/participant/5437sdkprxdygcnp",
  },
  {
    // This race publishes no age-group divisions, only overall and gender
    // places, so the placing is the official overall one rather than a
    // bracket counted by hand. Chip time 18:02.30, truncated to the second.
    slug: "city-of-artesia-5k-2026",
    name: "City of Artesia 5K",
    date: new Date("2026-11-21T00:00:00Z"),
    timeSeconds: hms("18:02"),
    paceSecondsPerMile: pace("5:49"),
    elevationFeet: 7, // Strava 21072319587: 2m
    ageGroupRank: 3,
    ageGroupTotal: 217,
    ageGroup: "Overall",
    distance: RaceDistance.FIVE_K,
    imageUrl: null,
    resultsUrl:
      "https://runsignup.com/Race/Results/170017/IndividualResult/RRdDQ?resultSetId=764982#U121781453",
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
