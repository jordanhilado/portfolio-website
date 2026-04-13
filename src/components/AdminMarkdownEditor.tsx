"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AdminMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  minHeight?: string;
}

export default function AdminMarkdownEditor({
  value,
  onChange,
  minHeight = "300px",
}: AdminMarkdownEditorProps) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  return (
    <div>
      {/* Tab toggle */}
      <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1 w-fit mb-3">
        <button
          type="button"
          onClick={() => setMode("edit")}
          className={`px-3 py-1.5 rounded-md text-sm transition-all ${
            mode === "edit"
              ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-medium shadow-sm"
              : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          }`}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => setMode("preview")}
          className={`px-3 py-1.5 rounded-md text-sm transition-all ${
            mode === "preview"
              ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-medium shadow-sm"
              : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          }`}
        >
          Preview
        </button>
      </div>

      {mode === "edit" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg bg-neutral-100 dark:bg-neutral-800 px-3 py-2 text-sm font-mono placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-neutral-100/10 transition-shadow"
          style={{ minHeight }}
          placeholder="Write your content in Markdown..."
          required
        />
      ) : (
        <div
          className="rounded-lg bg-neutral-50 dark:bg-neutral-900 p-4 overflow-y-auto prose dark:prose-invert prose-sm max-w-none"
          style={{ minHeight }}
        >
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-neutral-400 dark:text-neutral-500 italic">
              Nothing to preview.
            </p>
          )}
        </div>
      )}

      {mode === "edit" && (
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1.5">
          Supports Markdown with GFM (tables, strikethrough, links, images).
        </p>
      )}
      {mode === "preview" && (
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1.5">
          Preview is approximate. Visit the published post for full rendering.
        </p>
      )}
    </div>
  );
}
