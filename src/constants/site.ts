export const DEFAULT_SECTIONS = [
  "About",
  "Projects",
  "Blogs",
  "Hobbies",
] as const;

export type DefaultSection = (typeof DEFAULT_SECTIONS)[number];

export const DEFAULT_HERO_ALT = "Zion National Park";

export const DEFAULT_HOBBIES =
  "Running, reading, building side projects, and exploring new technologies.";

