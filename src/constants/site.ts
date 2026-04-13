export const DEFAULT_SECTIONS = [
  "About",
  "Projects",
  "Blogs",
  "Hobbies",
] as const;

export type DefaultSection = (typeof DEFAULT_SECTIONS)[number];

export const DEFAULT_HERO_ALT = "Zion National Park";

export const RESUME_URL = "/api/resume";

