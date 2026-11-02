import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdminSession } from "@/lib/auth";
import { ThoughtPostClient } from "@/components/ThoughtPostClient";
import { formatPostDate } from "@/lib/date";
import { readingTimeMinutes } from "@/lib/reading-time";
import { SITE_NAME } from "@/constants/site";

/**
 * A post as the site will show it, drafts included, for the admin only.
 *
 * Lives under /admin rather than behind a session check on /thoughts/[slug] so
 * the public post pages stay static and never read cookies. LayoutWrapper
 * gives this route the site's own layout instead of the bare admin one.
 *
 * Keyed by id rather than slug: the slug can change while a draft is edited.
 */
export const metadata: Metadata = {
  title: `Preview · ${SITE_NAME}`,
  robots: { index: false, follow: false },
};

export default async function PostPreviewPage(props: {
  params: Promise<{ id: string }>;
}) {
  // The proxy already requires sign-in for /admin; this is the second lock.
  if (!(await isAdminSession())) {
    notFound();
  }

  const { id } = await props.params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex items-center justify-between gap-x-4 text-sm text-neutral-500 dark:text-neutral-400">
        <span>
          {/* The site's own neutrals rather than status colors, so the bar
              reads as part of the page; the darker shade alone sets the
              status apart from the note after it. */}
          <span className="text-neutral-900 dark:text-neutral-100">
            {post.published ? "Published" : "Draft"}
          </span>
          {" · "}
          {post.published ? "preview" : "only visible to you"}
        </span>
        <span className="flex gap-x-3">
          {post.published && (
            <Link
              href={`/thoughts/${post.slug}`}
              className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              Live page
            </Link>
          )}
          <Link
            href={`/admin/edit/${post.id}`}
            className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            Edit
          </Link>
        </span>
      </div>

      <ThoughtPostClient
        post={{
          ...post,
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
        }}
        readingTime={readingTimeMinutes(post.content)}
        formattedDate={formatPostDate(post.createdAt)}
      />
    </div>
  );
}
