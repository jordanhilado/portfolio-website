import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ThoughtPostClient } from "@/components/ThoughtPostClient";
import { notFound } from "next/navigation";
import { formatPostDate } from "@/lib/date";
import { getPublishedPost } from "@/lib/posts";
import { postExcerpt } from "@/lib/post-excerpt";
import { readingTimeMinutes } from "@/lib/reading-time";
import { SITE_NAME } from "@/constants/site";

// Generate static params for all posts at build time
export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true },
  });

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

/**
 * Title and summary for the tab and for link previews. The preview image
 * itself comes from opengraph-image.tsx beside this file, which Next adds to
 * the openGraph and twitter tags on its own.
 */
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPublishedPost(params.slug);

  if (!post) {
    return {};
  }

  // undefined rather than "" so a post with no prose emits no empty tags.
  const description = postExcerpt(post.content) || undefined;

  return {
    title: `${post.title} · ${SITE_NAME}`,
    description,
    openGraph: {
      type: "article",
      url: `/thoughts/${post.slug}`,
      siteName: SITE_NAME,
      title: post.title,
      description,
      publishedTime: post.createdAt.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
    },
  };
}

export default async function ThoughtPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPublishedPost(params.slug);

  if (!post) {
    notFound();
  }

  // The shared estimate, so this header agrees with the landing page's list
  // and with the post's link-preview card.
  const readingTime = readingTimeMinutes(post.content);

  const formattedDate = formatPostDate(post.createdAt);

  return (
    <ThoughtPostClient
      post={{
        ...post,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      }}
      readingTime={readingTime}
      formattedDate={formattedDate}
    />
  );
}

// Backstop only — post writes purge this page on demand via
// revalidatePost(), so this timer just bounds staleness if a write
// path ever fails to invalidate.
export const revalidate = 3600;
