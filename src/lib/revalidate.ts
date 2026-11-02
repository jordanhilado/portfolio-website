import { revalidatePath } from "next/cache";

/**
 * Every path that renders shared site content: one route per section, with
 * About at `/`. Purging all of them on any write is a handful of cheap
 * re-renders and saves each handler from knowing which page it feeds.
 */
const CONTENT_PATHS = ["/", "/projects", "/thoughts", "/running"];

/**
 * Purges the cached section pages after a content write.
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
 * Purges the section pages plus individual thought post pages.
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
