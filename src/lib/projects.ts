/**
 * Sentinel for a `year` the caller sent that isn't a usable year — including a
 * missing or empty one, since every project must carry a year.
 */
export const INVALID_YEAR = Symbol("invalid-year");

/**
 * Normalizes the `year` field of a project payload.
 *
 * The admin form posts a text input, so a filled field arrives as a string of
 * digits and an untouched one as `""`. Bounds are deliberately loose — this is
 * a guard against typos and junk, not a claim about which years are plausible.
 */
export function parseProjectYear(value: unknown): number | typeof INVALID_YEAR {
  if (value === undefined || value === null || value === "") {
    return INVALID_YEAR;
  }

  const year = typeof value === "number" ? value : Number(String(value).trim());

  if (!Number.isInteger(year) || year < 1000 || year > 9999) {
    return INVALID_YEAR;
  }

  return year;
}
