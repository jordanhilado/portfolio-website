import { cache } from "react";
import { prisma } from "@/lib/prisma";

/**
 * Loads a post by slug for public rendering, or null if it is missing or a
 * draft.
 *
 * The post page, its metadata and its Open Graph image all read through here
 * so the draft check lives in one place: the image route is a separate URL,
 * and a copy of this query there that forgot `published` would leak a draft's
 * title to anyone who guessed its slug.
 *
 * Wrapped in `cache` so the page and its `generateMetadata` share one query
 * per request instead of each issuing their own.
 */
export const getPublishedPost = cache(async (slug: string) => {
  try {
    const post = await prisma.post.findUnique({
      where: { slug },
    });

    if (!post || !post.published) {
      return null;
    }

    return post;
  } catch (error) {
    console.error("Failed to load post:", error);
    return null;
  }
});
