"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import zionImage from "@/assets/zion.jpg";
import { data } from "@/assets/data";
import { MarkdownWithTOC } from "@/components/MarkdownWithTOC";

const SunIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
  </svg>
);

const MoonIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z"
      clipRule="evenodd"
    />
  </svg>
);

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
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <main className="flex min-h-screen items-start justify-center px-6 sm:px-10 md:px-16 py-8 md:py-10 tracking-tight">
      <div className="flex flex-col w-full max-w-2xl gap-y-4 pt-6 md:pt-10">
        {/* Zion Image */}
        <div className="w-full">
          <Image
            src={zionImage}
            alt={data.heroAlt}
            className="w-full h-auto object-contain"
            priority
          />
        </div>

        {/* Header with Back Link and Theme Toggle */}
        <div className="flex justify-between items-center">
          <Link
            href="/blogs"
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-base/5">Back</span>
          </Link>

          {/* Theme Toggle Icon */}
          {mounted && (
            <div
              onClick={toggleTheme}
              className="cursor-pointer transition-colors text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
              aria-label="Toggle theme"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleTheme();
                }
              }}
            >
              {resolvedTheme === "dark" ? (
                <SunIcon className="h-4 w-4" />
              ) : (
                <MoonIcon className="h-4 w-4" />
              )}
            </div>
          )}
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
    </main>
  );
}
