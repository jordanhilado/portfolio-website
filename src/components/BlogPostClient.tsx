"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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

type BlogPostClientProps = {
  post: Post;
  readingTime: number;
  formattedDate: string;
};

export function BlogPostClient({
  post,
  readingTime,
  formattedDate,
}: BlogPostClientProps) {
  return (
    <div className="flex flex-col gap-y-4">
      {/* Header with Back Link */}
      <div className="flex justify-start items-center">
        <Link
          href="/blogs"
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-base/5">Back</span>
        </Link>
      </div>

      {/* Content Area */}
      <article className="w-full text-base/5 text-neutral-500 dark:text-neutral-400">
        <header className="mb-6">
          <h1
            className="text-xl sm:text-2xl font-semibold mb-2 text-neutral-900 dark:text-neutral-100"
            style={{ fontFamily: "Song Myung" }}
          >
            {post.title}
          </h1>
          <div className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400">
            {formattedDate} • {readingTime} min read
          </div>
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
