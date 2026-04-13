"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AdminMarkdownEditor from "@/components/AdminMarkdownEditor";

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(true);
  const [coverImage, setCoverImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          published,
          coverImage,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ? JSON.stringify(j.error) : "Failed to create");
      }
      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex min-h-screen px-6 sm:px-10 md:px-16 py-10 pb-20 justify-center">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl font-semibold mb-4">New Post</h1>
        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Title
            </label>
            <input
              type="text"
              className="w-full rounded-lg bg-neutral-100 dark:bg-neutral-800 px-3 py-2 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-neutral-100/10 transition-shadow"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Cover Image URL (optional)
            </label>
            <input
              type="url"
              className="w-full rounded-lg bg-neutral-100 dark:bg-neutral-800 px-3 py-2 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-neutral-100/10 transition-shadow"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Content (Markdown)
            </label>
            <AdminMarkdownEditor value={content} onChange={setContent} />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="published"
              type="checkbox"
              className="h-4 w-4 rounded accent-neutral-900 dark:accent-neutral-100"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            <label htmlFor="published" className="text-sm">
              Published
            </label>
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? "Saving..." : "Create"}
            </button>
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg text-sm bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              onClick={() => router.push("/admin")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
