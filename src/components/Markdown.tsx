"use client";

import { useSyncExternalStore } from "react";
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
import { MermaidDiagram } from "@/components/MermaidDiagram";

const noopSubscribe = () => () => {};

/** The look of a link in rendered markdown, shared with custom link renderers. */
export const MARKDOWN_LINK_CLASS =
  "text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 underline";

/** The text inside a markdown (hast) node, e.g. a code block's source. */
function hastText(node: any): string {
  if (!node) return "";
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(hastText).join("");
}

/**
 * Markdown rendered the way a Thoughts post renders it. Every page that shows
 * markdown goes through this so headings, lists, code and tables look the same
 * everywhere; the post page adds its contents box and end mark on top.
 */
export function Markdown({
  content,
  components: overrides,
  externalLinks = false,
  className = "",
}: {
  content: string;
  /** Per-page element renderers, layered over the shared ones. */
  components?: Components;
  /** Open every link in a new tab, for pages whose links all lead off-site. */
  externalLinks?: boolean;
  className?: string;
}) {
  const { theme, systemTheme } = useTheme();
  // False on the server and during hydration, true after: the highlighter's
  // theme depends on the client-only resolved theme.
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  const components: Components = {
    h1: ({ children, ...props }) => (
      <h1
        className="text-2xl sm:text-3xl font-bold mt-6 mb-1 text-neutral-900 dark:text-neutral-100 [&>a]:no-underline [&>a]:text-neutral-900 [&>a]:dark:text-neutral-100 [&>a:hover]:text-neutral-600 [&>a:hover]:dark:text-neutral-400 font-songmyung"
        {...props}
      >
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2
        className="text-xl sm:text-2xl font-bold mt-4 mb-1 text-neutral-900 dark:text-neutral-100 [&>a]:no-underline [&>a]:text-neutral-900 [&>a]:dark:text-neutral-100 [&>a:hover]:text-neutral-600 [&>a:hover]:dark:text-neutral-400 font-songmyung"
        {...props}
      >
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3
        className="text-lg sm:text-xl font-bold mt-3 mb-0.5 text-neutral-900 dark:text-neutral-100 [&>a]:no-underline [&>a]:text-neutral-900 [&>a]:dark:text-neutral-100 [&>a:hover]:text-neutral-600 [&>a:hover]:dark:text-neutral-400 font-songmyung"
        {...props}
      >
        {children}
      </h3>
    ),
    h4: ({ children, ...props }) => (
      <h4
        className="text-base sm:text-lg font-bold mt-2 mb-0.5 text-neutral-900 dark:text-neutral-100 [&>a]:no-underline [&>a]:text-neutral-900 [&>a]:dark:text-neutral-100 [&>a:hover]:text-neutral-600 [&>a:hover]:dark:text-neutral-400 font-songmyung"
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
        // Weight alone carries the emphasis, so it takes the full bold step
        // rather than medium, which barely reads against regular. The color
        // follows the text it sits in, so bold in a paragraph stays grey.
        className="font-bold text-inherit"
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
    a: ({ children, href, node: _node, ...props }) => (
      <a
        href={href}
        className={MARKDOWN_LINK_CLASS}
        {...(externalLinks
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        {...props}
      >
        {children}
      </a>
    ),
    ul: ({ children, ...props }) => (
      <ul
        className="list-disc marker:text-current mb-4 pl-5 [&>li]:pl-0 [&_p]:mb-0 [&>li]:my-0.5 [&>li:first-child]:mt-0 [&>li:last-child]:mb-0"
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
    // Inline code only. react-markdown 10 no longer passes an `inline` flag,
    // so a fenced block is told apart by the <pre> it sits in, and `pre`
    // below renders those. Telling them apart here instead would send inline
    // snippets through the highlighter, whose <div> is invalid inside a <p>.
    code: ({ node: _node, children, ...props }: any) => (
      <code
        className="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-[0.95em] text-sky-700 dark:text-sky-300 font-sfmono"
        {...props}
      >
        {children}
      </code>
    ),
    // A fenced block. Its language and text are read off the <code> element
    // inside it in the markdown tree, so the inline renderer above never sees
    // block code.
    pre: ({ node }: any) => {
      const codeNode = node?.children?.find(
        (child: any) => child.type === "element" && child.tagName === "code"
      );
      const classNames: string[] = codeNode?.properties?.className ?? [];
      const language =
        classNames
          .map((name) => /^language-(\w+)/.exec(String(name))?.[1])
          .find(Boolean) ?? "";
      const source = hastText(codeNode).replace(/\n$/, "");

      if (language === "mermaid") {
        return <MermaidDiagram source={source} />;
      }

      // Don't highlight until mounted: the theme, and so the colors, are only
      // known in the browser.
      if (!mounted) {
        return (
          <code className="block bg-neutral-100 dark:bg-neutral-800 p-4 rounded text-[0.875rem] overflow-x-auto font-sfmono">
            {source}
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
                fontFamily:
                  "var(--font-sf-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: "0.875rem",
              },
            }}
            lineProps={{
              style: { background: "transparent" },
            }}
          >
            {source}
          </SyntaxHighlighter>
        </div>
      );
    },
    hr: ({ ...props }) => (
      <hr
        className="my-8 border-neutral-300 dark:border-neutral-700"
        {...props}
      />
    ),
    // The body is overflow-hidden, so a table wider than the screen was
    // clipped with no way to reach its right side. Each table now scrolls
    // sideways in its own box. Styling follows the rest of the post: neutral
    // rules like `hr`, Song Myung for headers and row labels like the
    // headings, and body text in the paragraph color.
    table: ({ children, ...props }) => (
      <div className="overflow-x-auto my-6">
        <table
          className="!my-0 w-full border-collapse border-b border-neutral-300 dark:border-neutral-700 text-sm leading-normal"
          {...props}
        >
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }) => (
      <thead
        className="bg-neutral-100 dark:bg-neutral-900 border-b border-neutral-300 dark:border-neutral-700"
        {...props}
      >
        {children}
      </thead>
    ),
    tr: ({ children, ...props }) => (
      <tr
        className="border-b border-neutral-200 dark:border-neutral-800 last:border-b-0"
        {...props}
      >
        {children}
      </tr>
    ),
    // Every column but the row labels keeps a minimum width, so a
    // many-column table scrolls on a phone instead of crushing each column
    // down to its longest word.
    th: ({ children, ...props }) => (
      <th
        className="px-3 py-2 text-left align-bottom font-songmyung font-bold text-base text-neutral-900 dark:text-neutral-100 [&:not(:first-child)]:min-w-[7rem]"
        {...props}
      >
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td
        className="px-3 py-2.5 align-top text-neutral-500 dark:text-neutral-400 [&:not(:first-child)]:min-w-[7rem] first:font-songmyung first:text-base first:text-neutral-900 first:dark:text-neutral-100"
        {...props}
      >
        {children}
      </td>
    ),
  };

  // A nested list sits as tight to its parent bullet, above and below, as
  // bullets sit to each other (my-0.5). Otherwise typography's 0.75em
  // above and the list's own mb-4 below open a paragraph-sized gap.
  // A top-level list sits 8px from the paragraphs around it, closer than
  // paragraphs sit to each other, so it reads as part of the text that
  // introduces it. Margins collapse to the larger of the pair, so the
  // paragraph on each side gives up its margin too.
  // Typography wraps inline code in literal backticks; the code style
  // already marks it, so those are dropped.
  return (
    <div className={`markdown-body prose dark:prose-invert max-w-none overflow-hidden [&_ul>li:first-child]:!mt-0 [&_ol>li:first-child]:!mt-0 [&_ul>li>p]:!m-0 [&_ol>li>p]:!m-0 [&_li>ul]:!my-0.5 [&_li>ol]:!my-0.5 prose-code:before:content-none prose-code:after:content-none [&>ul]:!my-2 [&>ol]:!my-2 [&>p:has(+ul)]:!mb-2 [&>p:has(+ol)]:!mb-2 [&>ul+p]:!mt-2 [&>ol+p]:!mt-2 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeRaw,
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: "wrap" }],
        ]}
        components={{ ...components, ...overrides }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
