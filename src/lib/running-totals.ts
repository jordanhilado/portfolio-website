/**
 * The lifetime mileage line in the Running blurb.
 *
 * The blurb is authored in the admin dashboard and stored as markdown, so the
 * two numbers live in it as placeholders that this module fills in at render
 * time. Keeping them out of the stored text means the sentence is never stale
 * and the author never has to edit a number after a run.
 *
 * Nothing here touches prisma or the network, so the client component that
 * renders the blurb can import it.
 */

import { STRAVA_PROFILE_URL } from "@/constants/site";

/** Written verbatim in the stored markdown. */
export const TOTAL_MILES_PLACEHOLDER = "<total_miles>";
export const TOTAL_RUNS_PLACEHOLDER = "<total_runs>";

/**
 * Runs logged in Nike Run Club, before the Strava account.
 *
 * Strava's own history starts in earnest in September 2023, so its all-time
 * totals alone would silently drop the first three years the blurb claims.
 * These came out of the NRC app by hand and are frozen — that app is no longer
 * in use, so there is nothing to sync.
 *
 * One 2020 Strava run predates the switch and is almost certainly also in the
 * 2020 row below; the sums are a career tally, not an audited ledger, so the
 * duplicate is left alone rather than papered over with a fudge factor.
 */
const NIKE_RUN_CLUB_YEARS = [
  { year: 2020, miles: 189.5, runs: 117 },
  { year: 2021, miles: 89.75, runs: 35 },
  { year: 2022, miles: 32.45, runs: 14 },
  { year: 2023, miles: 8.87, runs: 1 },
];

export const NIKE_RUN_CLUB_MILES = NIKE_RUN_CLUB_YEARS.reduce(
  (total, year) => total + year.miles,
  0
);

export const NIKE_RUN_CLUB_RUNS = NIKE_RUN_CLUB_YEARS.reduce(
  (total, year) => total + year.runs,
  0
);

export const METERS_PER_MILE = 1609.344;

/** Preformatted for display, e.g. `{ miles: "3,216", runs: "619" }`. */
export type RunningTotals = {
  miles: string;
  runs: string;
};

const NUMBER_FORMATTER = new Intl.NumberFormat("en-US");

/**
 * Adds the Nike Run Club years to Strava's all-time totals.
 *
 * Miles are rounded to a whole number: the blurb is a career figure, and a
 * decimal on a four-digit total reads as precision the sum does not have.
 */
export function formatRunningTotals(strava: {
  runs: number;
  meters: number;
}): RunningTotals {
  const miles = strava.meters / METERS_PER_MILE + NIKE_RUN_CLUB_MILES;

  return {
    miles: NUMBER_FORMATTER.format(Math.round(miles)),
    runs: NUMBER_FORMATTER.format(strava.runs + NIKE_RUN_CLUB_RUNS),
  };
}

/**
 * Substitutes the totals into the stored markdown, as links to Strava.
 *
 * Emitted as markdown links rather than raw HTML because the blurb is rendered
 * by ReactMarkdown without `rehype-raw` — a `<a>` tag in the source would be
 * dropped. The link inherits the prose accent colour every other link in the
 * section already uses.
 *
 * `null` totals mean Strava was unreachable for this render. An em dash keeps
 * the sentence readable and honest for the hour until the next revalidation,
 * where a guessed or last-known number would not be.
 */
export function applyRunningTotals(
  markdown: string,
  totals: RunningTotals | null
): string {
  const link = (value: string) => `[${value}](${STRAVA_PROFILE_URL})`;

  return markdown
    .split(TOTAL_MILES_PLACEHOLDER)
    .join(totals ? link(totals.miles) : "—")
    .split(TOTAL_RUNS_PLACEHOLDER)
    .join(totals ? link(totals.runs) : "—");
}
