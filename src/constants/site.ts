export const DEFAULT_SECTIONS = [
  "About",
  "Projects",
  "Thoughts",
  "Taste",
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

export const RESUME_URL = "/api/resume";

