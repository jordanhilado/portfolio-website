import { revalidatePath } from "next/cache";
import { DEFAULT_SECTIONS, sectionToSlug } from "@/constants/site";

/**
 * Every path that renders shared site content.
 *
 * `/` and each `/[slug]` section page render the same HomeClient with the
 * same props, so a change to any content type invalidates all of them.
 */
const CONTENT_PATHS = [
  "/",
  ...DEFAULT_SECTIONS.map((section) => `/${sectionToSlug(section)}`),
];

/**
 * Purges the cached landing pages after a content write.
 *
 * Call this from every mutating handler. Pages set a long `revalidate` as a
 * backstop, so a handler that forgets to call this leaves content stale until
 * that timer elapses rather than surfacing immediately.
 */
export function revalidateContent(): void {
  for (const path of CONTENT_PATHS) {
    revalidatePath(path);
  }
}

/**
 * Purges the shared landing pages plus individual thought post pages.
 *
 * Pass every slug the write touched. A rename produces two — the old URL
 * still has a cache entry that would otherwise serve the pre-rename post
 * until the backstop timer expires. Duplicates are harmless.
 */
export function revalidatePost(...slugs: (string | null | undefined)[]): void {
  revalidateContent();

  const unique = slugs.filter(
    (slug, index): slug is string =>
      typeof slug === "string" && slug.length > 0 && slugs.indexOf(slug) === index
  );

  for (const slug of unique) {
    revalidatePath(`/thoughts/${slug}`);
  }
}
