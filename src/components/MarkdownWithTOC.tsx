"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Markdown } from "@/components/Markdown";

type Heading = { id: string; text: string; level: number };

/** Left padding per contents depth, spelled out so Tailwind sees each class. */
const TOC_INDENT = ["", "pl-3 sm:pl-4", "pl-6 sm:pl-8"];

/** A Thoughts post body: shared markdown plus a contents box and an end mark. */
export function MarkdownWithTOC({ content }: { content: string }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Append the end-of-post mark inline with the last line. The non-breaking
  // space keeps it from wrapping onto a line of its own.
  const contentWithMarker =
    content.trim() + '&nbsp;<span class="post-end-marker" aria-hidden="true"></span>';

  useEffect(() => {
    const nodes = Array.from(
      bodyRef.current?.querySelectorAll<HTMLHeadingElement>("h1, h2, h3") ?? []
    );
    const hs: Heading[] = nodes.map((n) => ({
      id: n.id,
      text: n.textContent || "",
      level: parseInt(n.tagName.substring(1), 10),
    }));
    // Reads the rendered DOM, an external system, so this is a legitimate
    // sync from outside React rather than derived state.
    setHeadings(hs);
  }, [contentWithMarker]);

  // Indented by depth below the post's top heading level rather than the
  // absolute level, so a post whose headings are all ### sits flush instead of
  // starting two steps in.
  const chapters = useMemo(() => {
    const topLevel = Math.min(...headings.map((h) => h.level));
    return headings.map((h) => ({
      ...h,
      indent: Math.min(h.level - topLevel, 2),
    }));
  }, [headings]);

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {chapters.length > 0 && (
        // Light mode steps 6 shades below the page (249), mirroring how far
        // neutral-900 sits above the dark page (17 → 23). neutral-50 matched
        // the light page exactly, so the box vanished.
        <div className="p-3 sm:p-4 bg-[rgb(243,243,243)] dark:bg-neutral-900">
          <div className="mb-1 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100">
            Content
          </div>
          <ul className="space-y-1 text-xs sm:text-sm">
            {chapters.map((c) => (
              <li key={c.id} className={TOC_INDENT[c.indent]}>
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
      <div ref={bodyRef}>
        <Markdown content={contentWithMarker} />
      </div>
    </div>
  );
}
