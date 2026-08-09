import { prisma } from "@/lib/prisma";
import { formatPostDate } from "@/lib/date";

/** The minimal serializable shape a race card needs. */
export type RaceCard = {
  id: string;
  name: string;
  /** e.g. "Dec 8, 2025". */
  date: string;
  /** e.g. "3:01:47". */
  time: string;
  /** e.g. "6:44/mi". */
  pace: string;
  /** e.g. "2,131ft". */
  elevation: string;
  /** e.g. "11th out of 662 · M20-29". */
  placing: string;
  imageUrl: string | null;
  resultsUrl: string | null;
};

/** Seconds to "H:MM:SS", hours unpadded — race times are read that way. */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${hours}:${pad(minutes)}:${pad(secs)}`;
}

/** Seconds per mile to "6:44/mi". */
function formatPace(secondsPerMile: number): string {
  const minutes = Math.floor(secondsPerMile / 60);
  const secs = secondsPerMile % 60;
  return `${minutes}:${String(secs).padStart(2, "0")}/mi`;
}

/**
 * 11 -> "11th", 21 -> "21st".
 *
 * The teens are the exception: 11, 12 and 13 take "th" despite ending in the
 * digits that otherwise take "st", "nd" and "rd".
 */
function ordinal(value: number): string {
  const lastTwo = value % 100;
  if (lastTwo >= 11 && lastTwo <= 13) {
    return `${value}th`;
  }
  const suffix = ["th", "st", "nd", "rd"][value % 10] ?? "th";
  return `${value}${suffix}`;
}

/**
 * Loads every race, newest first, preformatted for display.
 *
 * Formatting server-side keeps Intl off the client and removes any chance of a
 * locale-driven hydration mismatch, matching getRunsForYear in @/lib/runs.
 *
 * Returns an empty array on failure, mirroring getSiteContent()'s per-source
 * degradation: a database problem hides the cards rather than breaking the page.
 */
export async function getRaces(): Promise<RaceCard[]> {
  try {
    const races = await prisma.race.findMany({
      orderBy: { date: "desc" },
      select: {
        id: true,
        name: true,
        date: true,
        timeSeconds: true,
        paceSecondsPerMile: true,
        elevationFeet: true,
        ageGroupRank: true,
        ageGroupTotal: true,
        ageGroup: true,
        imageUrl: true,
        resultsUrl: true,
      },
    });

    return races.map((race) => ({
      id: race.id,
      name: race.name,
      date: formatPostDate(race.date),
      time: formatDuration(race.timeSeconds),
      pace: formatPace(race.paceSecondsPerMile),
      elevation: `${race.elevationFeet.toLocaleString("en-US")}ft`,
      placing: `${ordinal(race.ageGroupRank)} out of ${race.ageGroupTotal} · ${race.ageGroup}`,
      imageUrl: race.imageUrl,
      resultsUrl: race.resultsUrl,
    }));
  } catch (error) {
    console.error("Error fetching races:", error);
    return [];
  }
}
