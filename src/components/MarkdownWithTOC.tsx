"use client";

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeRaw from "rehype-raw";
import type { Components } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";

type Heading = { id: string; text: string; level: number };

export function MarkdownWithTOC({ content }: { content: string }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Append purple square marker inline with the content
  const contentWithMarker =
    content.trim() + ' <span class="blog-end-marker"></span>';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLHeadingElement>(
        ".markdown-body h1, .markdown-body h2, .markdown-body h3"
      )
    );
    const hs: Heading[] = nodes.map((n) => ({
      id: n.id,
      text: n.textContent || "",
      level: parseInt(n.tagName.substring(1), 10),
    }));
    setHeadings(hs);
  }, [contentWithMarker]);

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  const chapters = useMemo(() => {
    return headings.map((h) => ({
      ...h,
      indent: h.level === 1 ? 0 : h.level === 2 ? 1 : 2,
    }));
  }, [headings]);

  const components: Components = {
    h1: ({ children, ...props }) => (
      <h1
        className="text-2xl sm:text-3xl font-bold mt-6 mb-1 text-neutral-900 dark:text-neutral-100 [&>a]:no-underline [&>a]:text-neutral-900 [&>a]:dark:text-neutral-100 [&>a:hover]:text-neutral-600 [&>a:hover]:dark:text-neutral-400"
        style={{ fontFamily: "Song Myung" }}
        {...props}
      >
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2
        className="text-xl sm:text-2xl font-bold mt-4 mb-1 text-neutral-900 dark:text-neutral-100 [&>a]:no-underline [&>a]:text-neutral-900 [&>a]:dark:text-neutral-100 [&>a:hover]:text-neutral-600 [&>a:hover]:dark:text-neutral-400"
        style={{ fontFamily: "Song Myung" }}
        {...props}
      >
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3
        className="text-lg sm:text-xl font-bold mt-3 mb-0.5 text-neutral-900 dark:text-neutral-100 [&>a]:no-underline [&>a]:text-neutral-900 [&>a]:dark:text-neutral-100 [&>a:hover]:text-neutral-600 [&>a:hover]:dark:text-neutral-400"
        style={{ fontFamily: "Song Myung" }}
        {...props}
      >
        {children}
      </h3>
    ),
    h4: ({ children, ...props }) => (
      <h4
        className="text-base sm:text-lg font-bold mt-2 mb-0.5 text-neutral-900 dark:text-neutral-100 [&>a]:no-underline [&>a]:text-neutral-900 [&>a]:dark:text-neutral-100 [&>a:hover]:text-neutral-600 [&>a:hover]:dark:text-neutral-400"
        style={{ fontFamily: "Song Myung" }}
        {...props}
      >
        {children}
      </h4>
    ),
    p: ({ children, ...props }) => (
      <p
        className="mb-4 leading-normal text-neutral-500 dark:text-neutral-400"
        {...props}
      >
        {children}
      </p>
    ),
    strong: ({ children, ...props }) => (
      <strong
        className="font-bold text-neutral-900 dark:text-neutral-100"
        {...props}
      >
        {children}
      </strong>
    ),
    em: ({ children, ...props }) => (
      <em className="italic" {...props}>
        {children}
      </em>
    ),
    a: ({ children, href, ...props }) => (
      <a
        href={href}
        className="text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 underline"
        {...props}
      >
        {children}
      </a>
    ),
    ul: ({ children, ...props }) => (
      <ul
        className="list-disc mb-4 pl-5 [&_p]:mb-0 [&>li]:my-0.5 [&>li:first-child]:mt-0 [&>li:last-child]:mb-0"
        {...props}
      >
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol
        className="list-decimal mb-4 pl-5 [&_p]:mb-0 [&>li]:my-0.5 [&>li:first-child]:mt-0 [&>li:last-child]:mb-0"
        {...props}
      >
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li
        className="leading-normal text-neutral-500 dark:text-neutral-400 [&>p]:m-0"
        {...props}
      >
        {children}
      </li>
    ),
    blockquote: ({ children, ...props }) => (
      <blockquote
        className="border-l-4 border-neutral-300 dark:border-neutral-700 pl-4 my-4 italic text-neutral-500 dark:text-neutral-400"
        {...props}
      >
        {children}
      </blockquote>
    ),
    code: ({ inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || "");
      const language = match ? match[1] : "";

      if (inline) {
        return (
          <code
            className="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-[0.95em] text-sky-700 dark:text-sky-300"
            {...props}
            style={{ fontFamily: "SF Mono, monospace" }}
          >
            {children}
          </code>
        );
      }

      // Don't render until mounted to prevent hydration mismatch
      if (!mounted) {
        return (
          <code
            className="block bg-neutral-100 dark:bg-neutral-800 p-4 rounded text-[0.875rem] overflow-x-auto"
            {...props}
            style={{ fontFamily: "SF Mono, monospace" }}
          >
            {children}
          </code>
        );
      }

      return (
        <div className="overflow-x-auto -mx-6 sm:mx-0 my-4">
          <SyntaxHighlighter
            style={isDark ? oneDark : oneLight}
            language={language || "text"}
            PreTag="div"
            className="!m-0 !rounded-none sm:!rounded !text-[0.875rem]"
            customStyle={{
              margin: 0,
              padding: "1rem",
              background: isDark ? "rgb(23 23 23)" : "rgb(245 245 245)",
              borderRadius: "0.375rem",
            }}
            codeTagProps={{
              style: {
                background: "transparent",
                fontFamily: "SF Mono, monospace",
                fontSize: "0.875rem",
              },
            }}
            lineProps={{
              style: { background: "transparent" },
            }}
            {...props}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        </div>
      );
    },
    pre: ({ children }) => {
      // Just return children directly, let the code component handle the styling
      return <>{children}</>;
    },
    hr: ({ ...props }) => (
      <hr
        className="my-8 border-neutral-300 dark:border-neutral-700"
        {...props}
      />
    ),
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {chapters.length > 0 && (
        <div className="p-3 sm:p-4 bg-neutral-50 dark:bg-neutral-900">
          <div className="mb-1 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100">
            Content
          </div>
          <ul className="space-y-1 text-xs sm:text-sm">
            {chapters.map((c) => (
              <li key={c.id}>
                <a
                  href={`#${c.id}`}
                  className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 break-words"
                >
                  {c.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="markdown-body prose dark:prose-invert max-w-none overflow-hidden [&_ul>li:first-child]:!mt-0 [&_ol>li:first-child]:!mt-0 [&_ul>li>p]:!m-0 [&_ol>li>p]:!m-0">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[
            rehypeRaw,
            rehypeSlug,
            [rehypeAutolinkHeadings, { behavior: "wrap" }],
          ]}
          components={components}
        >
          {contentWithMarker}
        </ReactMarkdown>
      </div>
    </div>
  );
}
