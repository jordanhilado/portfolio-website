"use client";

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

type Heading = { id: string; text: string; level: number };

export function MarkdownWithTOC({ content }: { content: string }) {
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLHeadingElement>(".markdown-body h1, .markdown-body h2, .markdown-body h3")
    );
    const hs: Heading[] = nodes.map((n) => ({
      id: n.id,
      text: n.textContent || "",
      level: parseInt(n.tagName.substring(1), 10),
    }));
    setHeadings(hs);
  }, [content]);

  const chapters = useMemo(() => {
    return headings.map((h) => ({
      ...h,
      indent: h.level === 1 ? 0 : h.level === 2 ? 1 : 2,
    }));
  }, [headings]);

  return (
    <div className="flex flex-col gap-6">
      {chapters.length > 0 && (
        <div className="border rounded-md p-4">
          <div className="font-medium mb-2">Chapters</div>
          <ul className="space-y-1">
            {chapters.map((c) => (
              <li key={c.id} style={{ marginLeft: `${c.indent * 16}px` }}>
                <a
                  href={`#${c.id}`}
                  className="text-purple-600 hover:underline dark:text-purple-400"
                >
                  {c.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="markdown-body prose dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSlug, [rehypeAutolinkHeadings, { behavior: "wrap" }]]}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}


