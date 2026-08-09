import { revalidatePath } from "next/cache";

/**
 * Every path that renders shared site content.
 *
 * All sections render together on the landing page, so that single route is
 * the only thing a content write can stale. The old per-section routes are
 * redirects handled in next.config.js and hold no cache entry of their own.
 */
const CONTENT_PATHS = ["/"];

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
