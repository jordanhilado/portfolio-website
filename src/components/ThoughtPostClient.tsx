"use client";

import { MarkdownWithTOC } from "@/components/MarkdownWithTOC";

type Post = {
  id: string;
  slug: string;
  title: string;
  content: string;
  published: boolean;
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
};

type ThoughtPostClientProps = {
  post: Post;
  readingTime: number;
  formattedDate: string;
};

export function ThoughtPostClient({
  post,
  readingTime,
  formattedDate,
}: ThoughtPostClientProps) {
  return (
    <div className="flex flex-col gap-y-4">
      {/* Content Area */}
      <article className="w-full text-base/5 text-neutral-500 dark:text-neutral-400">
        <header className="mb-6 text-sm sm:text-base text-neutral-500 dark:text-neutral-400">
          <div className="mb-1">{formattedDate}</div>
          <h1
            className="text-xl sm:text-2xl font-semibold mb-1 text-sky-600 dark:text-sky-400 font-songmyung"
          >
            {post.title}
          </h1>
          <div>{readingTime} min read</div>
        </header>
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-auto rounded mb-4 sm:mb-6"
          />
        )}
        <MarkdownWithTOC content={post.content} />
        <div className="mb-12" />
      </article>
    </div>
  );
}
