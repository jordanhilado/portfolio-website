export const DEFAULT_SECTIONS = [
  "About",
  "Projects",
  "Thoughts",
  "Running",
] as const;

export type DefaultSection = (typeof DEFAULT_SECTIONS)[number];

/**
 * Maps a section name to its URL slug.
 *
 * Shared by the route params, the client-side nav, and the cache
 * invalidation paths so all three stay in agreement.
 */
export const sectionToSlug = (section: string): string => {
  return section
    .toLowerCase()
    .replace(/\s+&\s+/g, "-")
    .replace(/\s+/g, "-");
};

export const DEFAULT_HERO_ALT = "Zion National Park";

export const SITE_NAME = "Jordan Hilado";

/**
 * The production origin, used as `metadataBase` so link previews get the
 * absolute og:image URLs iMessage and the rest require.
 *
 * Left to itself Next falls back to VERCEL_URL, the per-deployment hostname,
 * which Vercel's default deployment protection can put behind a login — and a
 * crawler that hits one shows no image. Preview deployments still point their
 * images at their own URL; Next special-cases them.
 */
export const SITE_URL = "https://jordanhilado.com";

/**
 * The Strava athlete whose runs this site mirrors.
 *
 * Held here rather than fetched from `/athlete` on every render: the stats
 * endpoint is keyed by athlete id and the running blurb links to the profile,
 * so a constant saves an API call on both paths and keeps the link correct
 * even when Strava is unreachable.
 */
export const STRAVA_ATHLETE_ID = "69009093";

export const STRAVA_PROFILE_URL = `https://www.strava.com/athletes/${STRAVA_ATHLETE_ID}`;

export const RESUME_URL = "/api/resume";

