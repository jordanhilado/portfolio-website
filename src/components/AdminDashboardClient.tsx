"use client";

import { Fragment, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import AdminMarkdownEditor from "@/components/AdminMarkdownEditor";
import { parseMarkdownLink } from "@/lib/markdown-links";

type AdminListPost = {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

type Project = {
  id: string;
  title: string;
  description: string;
  link: string;
  order: number;
  year: number;
  createdAt: string;
  updatedAt: string;
};

type AboutContent = {
  id: string;
  content: string;
  paragraphs: string[];
  contactLinks: string[];
  updatedAt: string;
} | null;

type ContactLink = {
  label: string;
  url: string;
};

type Tab = "posts" | "about" | "projects" | "running";

interface AdminDashboardClientProps {
  posts: AdminListPost[];
  projects: Project[];
  aboutContent: AboutContent;
  runningContent: string;
}

function parseContactLink(md: string): ContactLink {
  const match = md.match(/\[([^\]]+)\]\(([^)]+)\)/);
  if (match) return { label: match[1], url: match[2] };
  return { label: md, url: "" };
}

function serializeContactLink(link: ContactLink): string {
  if (link.url) return `[${link.label}](${link.url})`;
  return link.label;
}

// Same split the save handler uses, so the preview shows exactly the
// paragraphs that will be persisted.
function splitAboutParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function TrashIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

export default function AdminDashboardClient({
  posts: initialPosts,
  projects: initialProjects,
  aboutContent: initialAboutContent,
  runningContent: initialRunningContent,
}: AdminDashboardClientProps) {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>("about");
  const [posts] = useState(initialPosts);
  const [projects, setProjects] = useState(initialProjects);

  // About: single textarea for all paragraphs
  const [aboutText, setAboutText] = useState(
    initialAboutContent?.paragraphs.join("\n\n") || ""
  );
  const [aboutMode, setAboutMode] = useState<"edit" | "preview">("edit");
  const aboutParagraphs = useMemo(
    () => splitAboutParagraphs(aboutText),
    [aboutText]
  );

  // About: structured contact links
  const [contactLinks, setContactLinks] = useState<ContactLink[]>(
    (initialAboutContent?.contactLinks || []).map(parseContactLink)
  );

  const [isSavingAbout, setIsSavingAbout] = useState(false);
  const [aboutSaveMessage, setAboutSaveMessage] = useState("");
  const [hasOrderChanges, setHasOrderChanges] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [orderFeedback, setOrderFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // New project form state. `year` is a string because it is bound to a text
  // input; the API parses it and rejects an empty or malformed one.
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    link: "",
    year: "",
  });
  const [isAddingProject, setIsAddingProject] = useState(false);

  // Inline project editing state
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState({
    title: "",
    description: "",
    link: "",
    year: "",
  });
  const [isSavingProject, setIsSavingProject] = useState(false);

  // Running state
  const [runningText, setRunningText] = useState(initialRunningContent);
  const [isSavingRunning, setIsSavingRunning] = useState(false);
  const [runningSaveMessage, setRunningSaveMessage] = useState("");
  const [isSyncingStrava, setIsSyncingStrava] = useState(false);
  const [stravaSyncMessage, setStravaSyncMessage] = useState("");

  // Handle Running content save
  const handleSaveRunning = async () => {
    setIsSavingRunning(true);
    setRunningSaveMessage("");

    try {
      const response = await fetch("/api/running", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: runningText }),
      });

      if (!response.ok) throw new Error("Failed to save");

      setRunningSaveMessage("Saved successfully!");
      setTimeout(() => setRunningSaveMessage(""), 3000);
    } catch (error) {
      setRunningSaveMessage("Error saving content");
    } finally {
      setIsSavingRunning(false);
    }
  };

  // Handle Strava run sync
  const handleSyncStrava = async () => {
    setIsSyncingStrava(true);
    setStravaSyncMessage("");

    try {
      const response = await fetch("/api/running/sync", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to sync");
      }

      setStravaSyncMessage(
        `Synced ${data.matched} runs (${data.created} new, ${data.updated} updated, ${data.removed} removed)`
      );
      // Longer than the save toast — these counts are worth reading.
      setTimeout(() => setStravaSyncMessage(""), 6000);
    } catch (error) {
      setStravaSyncMessage(
        `Error syncing: ${error instanceof Error ? error.message : "unknown"}`
      );
    } finally {
      setIsSyncingStrava(false);
    }
  };

  // Handle About content save
  const handleSaveAbout = async () => {
    setIsSavingAbout(true);
    setAboutSaveMessage("");

    try {
      const paragraphs = splitAboutParagraphs(aboutText);

      const response = await fetch("/api/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paragraphs,
          contactLinks: contactLinks.map(serializeContactLink),
        }),
      });

      if (!response.ok) throw new Error("Failed to save");

      setAboutSaveMessage("Saved successfully!");
      setTimeout(() => setAboutSaveMessage(""), 3000);
    } catch (error) {
      setAboutSaveMessage("Error saving content");
    } finally {
      setIsSavingAbout(false);
    }
  };

  // Handle Contact Links changes
  const handleContactLinkChange = (
    index: number,
    field: "label" | "url",
    value: string
  ) => {
    setContactLinks((prev) =>
      prev.map((link, i) => (i === index ? { ...link, [field]: value } : link))
    );
  };

  const addContactLink = () => {
    setContactLinks([...contactLinks, { label: "", url: "" }]);
  };

  const removeContactLink = (index: number) => {
    setContactLinks(contactLinks.filter((_, i) => i !== index));
  };

  // Handle Project operations
  const handleAddProject = async () => {
    if (
      !newProject.title ||
      !newProject.description ||
      !newProject.link ||
      !newProject.year
    ) {
      alert("Please fill in all fields");
      return;
    }

    setIsAddingProject(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      });

      // Surface the API's own message — a rejected year should say so rather
      // than land as a generic failure.
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Failed to add project");
      }

      const addedProject = await response.json();
      setProjects((prev) =>
        [...prev, addedProject].sort((a, b) => a.order - b.order)
      );
      setNewProject({ title: "", description: "", link: "", year: "" });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error adding project");
    } finally {
      setIsAddingProject(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete project");

      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (editingProjectId === id) setEditingProjectId(null);
    } catch (error) {
      alert("Error deleting project");
    }
  };

  const handleMoveProject = (index: number, direction: "up" | "down") => {
    setProjects((prev) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) {
        return prev;
      }

      const updated = [...prev];
      [updated[index], updated[targetIndex]] = [
        updated[targetIndex],
        updated[index],
      ];

      const normalized = updated.map((project, idx) => ({
        ...project,
        order: idx,
      }));

      setHasOrderChanges(true);
      setOrderFeedback(null);

      return normalized;
    });
  };

  const handleSaveProjectOrder = async () => {
    if (!hasOrderChanges || isSavingOrder) return;

    setIsSavingOrder(true);
    setOrderFeedback(null);

    try {
      const response = await fetch("/api/projects/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: projects.map((p) => p.id) }),
      });

      if (!response.ok) {
        throw new Error("Failed to save order");
      }

      setHasOrderChanges(false);
      setOrderFeedback({ type: "success", text: "Order updated." });
    } catch (error) {
      setOrderFeedback({
        type: "error",
        text: "Failed to save order. Please try again.",
      });
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleStartEditProject = (project: Project) => {
    setEditingProjectId(project.id);
    setEditingProject({
      title: project.title,
      description: project.description,
      link: project.link,
      year: String(project.year),
    });
  };

  const handleCancelEditProject = () => {
    setEditingProjectId(null);
  };

  const handleUpdateProject = async (id: string) => {
    if (
      !editingProject.title ||
      !editingProject.description ||
      !editingProject.link ||
      !editingProject.year
    ) {
      alert("Please fill in all fields");
      return;
    }

    setIsSavingProject(true);
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingProject),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Failed to update");
      }

      const updated = await response.json();
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                title: updated.title,
                description: updated.description,
                link: updated.link,
                year: updated.year,
              }
            : p
        )
      );
      setEditingProjectId(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error updating project");
    } finally {
      setIsSavingProject(false);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "about", label: "About" },
    { key: "projects", label: "Projects" },
    { key: "posts", label: "Thoughts" },
    { key: "running", label: "Running" },
  ];

  return (
    <main className="flex min-h-screen px-6 sm:px-10 md:px-16 py-10 pb-20 justify-center">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <button
            onClick={() => {
              const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
              setTheme(next);
            }}
            className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-neutral-600 dark:text-neutral-400"
            title={`Theme: ${theme} (click to cycle)`}
          >
            {theme === "light" && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.95l-.71.71M21 12h-1M4 12H3m16.66 7.66l-.71-.71M4.05 4.05l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
            {theme === "dark" && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
            {theme !== "light" && theme !== "dark" && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>

        {/* Pill-style Tab Bar */}
        <div className="flex w-full sm:w-fit gap-0.5 sm:gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 sm:flex-none px-2 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm rounded-md transition-all ${
                activeTab === tab.key
                  ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-medium shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Thoughts Tab */}
        {activeTab === "posts" && (
          <div>
            <div className="space-y-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-lg bg-neutral-50 dark:bg-neutral-900 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{post.title}</div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        <span
                          className={
                            post.published
                              ? "text-green-600 dark:text-green-400"
                              : "text-amber-600 dark:text-amber-400"
                          }
                        >
                          {post.published ? "Published" : "Draft"}
                        </span>
                        {" · "}
                        {new Date(post.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Link
                        href={`/admin/edit/${post.id}`}
                        className="px-3 py-1.5 rounded-lg text-sm bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/thoughts/${post.slug}`}
                        className="px-3 py-1.5 rounded-lg text-sm bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              {posts.length === 0 && (
                <div className="text-sm text-neutral-500">No posts yet.</div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-2 items-center justify-end">
              <Link
                href="/admin/new"
                className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                New Post
              </Link>
            </div>
          </div>
        )}

        {/* About Tab */}
        {activeTab === "about" && (
          <div>
            <div className="space-y-6">
              {/* About Paragraphs - Edit / Preview */}
              <div>
                <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1 w-fit mb-3">
                  {(["edit", "preview"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setAboutMode(mode)}
                      className={`px-3 py-1.5 rounded-md text-sm transition-all capitalize ${
                        aboutMode === mode
                          ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-medium shadow-sm"
                          : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                {aboutMode === "edit" ? (
                  <textarea
                    value={aboutText}
                    onChange={(e) => setAboutText(e.target.value)}
                    className="w-full rounded-lg bg-neutral-100 dark:bg-neutral-800 px-3 py-2 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-neutral-100/10 transition-shadow min-h-[250px]"
                    placeholder="Write your about content here..."
                  />
                ) : (
                  <div className="rounded-lg bg-neutral-50 dark:bg-neutral-900 p-4 min-h-[250px]">
                    {aboutParagraphs.length > 0 ? (
                      <div className="flex flex-col gap-y-3 text-sm">
                        {aboutParagraphs.map((paragraph, index) => (
                          <p key={index} className="text-pretty">
                            {parseMarkdownLink(paragraph).map(
                              (part, partIndex) =>
                                typeof part === "string" ? (
                                  <Fragment key={partIndex}>{part}</Fragment>
                                ) : (
                                  <a
                                    key={partIndex}
                                    href={part.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
                                  >
                                    {part.text}
                                  </a>
                                )
                            )}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-400 dark:text-neutral-500 italic">
                        Nothing to preview.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Contact Links - Structured Fields */}
              <div>
                <div className="space-y-2">
                  {contactLinks.map((link, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) =>
                          handleContactLinkChange(index, "label", e.target.value)
                        }
                        className="w-24 sm:w-32 shrink-0 rounded-lg bg-neutral-100 dark:bg-neutral-800 px-3 py-2 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-neutral-100/10 transition-shadow"
                        placeholder="Label"
                      />
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) =>
                          handleContactLinkChange(index, "url", e.target.value)
                        }
                        className="flex-1 min-w-0 rounded-lg bg-neutral-100 dark:bg-neutral-800 px-3 py-2 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-neutral-100/10 transition-shadow"
                        placeholder="https://... or mailto:..."
                      />
                      <button
                        onClick={() => removeContactLink(index)}
                        aria-label="Remove link"
                        title="Remove link"
                        className="shrink-0 p-2 rounded-lg text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={addContactLink}
                    className="px-4 py-2 rounded-lg text-sm bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  >
                    Add Link
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 items-center justify-end">
              {aboutSaveMessage && (
                <span
                  className={`text-sm ${
                    aboutSaveMessage.includes("Error")
                      ? "text-red-600"
                      : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {aboutSaveMessage}
                </span>
              )}
              <button
                onClick={handleSaveAbout}
                disabled={isSavingAbout}
                className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSavingAbout ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}

        {/* Running Tab */}
        {activeTab === "running" && (
          <div>
            <AdminMarkdownEditor
              value={runningText}
              onChange={setRunningText}
              minHeight="250px"
              showHint={false}
            />

            <div className="mt-6 flex flex-wrap gap-2 items-center justify-end">
              {/* Kept separate from runningSaveMessage so a slow sync can't
                  clobber a save confirmation. */}
              {stravaSyncMessage && (
                <span
                  className={`text-sm ${
                    stravaSyncMessage.includes("Error")
                      ? "text-red-600"
                      : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {stravaSyncMessage}
                </span>
              )}
              <button
                onClick={handleSyncStrava}
                disabled={isSyncingStrava}
                className="px-3 py-1.5 rounded-lg text-sm bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
              >
                {isSyncingStrava ? "Syncing..." : "Sync from Strava"}
              </button>
              {runningSaveMessage && (
                <span
                  className={`text-sm ${
                    runningSaveMessage.includes("Error")
                      ? "text-red-600"
                      : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {runningSaveMessage}
                </span>
              )}
              <button
                onClick={handleSaveRunning}
                disabled={isSavingRunning}
                className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSavingRunning ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === "projects" && (
          <div>
            {/* Existing Projects */}
            <div className="space-y-3">
              {projects.map((project, index) => (
                <div
                  key={project.id}
                  className="rounded-lg bg-neutral-50 dark:bg-neutral-900 p-4"
                >
                  {editingProjectId === project.id ? (
                    /* Inline edit mode */
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editingProject.title}
                        onChange={(e) =>
                          setEditingProject({
                            ...editingProject,
                            title: e.target.value,
                          })
                        }
                        className="w-full rounded-lg bg-neutral-100 dark:bg-neutral-800 px-3 py-2 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-neutral-100/10 transition-shadow"
                        placeholder="Title"
                      />
                      <input
                        type="text"
                        value={editingProject.link}
                        onChange={(e) =>
                          setEditingProject({
                            ...editingProject,
                            link: e.target.value,
                          })
                        }
                        className="w-full rounded-lg bg-neutral-100 dark:bg-neutral-800 px-3 py-2 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-neutral-100/10 transition-shadow"
                        placeholder="Link"
                      />
                      <input
                        type="text"
                        inputMode="numeric"
                        value={editingProject.year}
                        onChange={(e) =>
                          setEditingProject({
                            ...editingProject,
                            year: e.target.value,
                          })
                        }
                        className="w-full rounded-lg bg-neutral-100 dark:bg-neutral-800 px-3 py-2 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-neutral-100/10 transition-shadow"
                        placeholder="Year"
                      />
                      <textarea
                        value={editingProject.description}
                        onChange={(e) =>
                          setEditingProject({
                            ...editingProject,
                            description: e.target.value,
                          })
                        }
                        className="w-full rounded-lg bg-neutral-100 dark:bg-neutral-800 px-3 py-2 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-neutral-100/10 transition-shadow min-h-[60px]"
                        placeholder="Description"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateProject(project.id)}
                          disabled={isSavingProject}
                          className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          {isSavingProject ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={handleCancelEditProject}
                          className="px-3 py-1.5 rounded-lg text-sm bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Read mode */
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-x-2">
                          <div className="font-medium">{project.title}</div>
                          <div className="text-sm tabular-nums text-neutral-400 dark:text-neutral-500">
                            {project.year}
                          </div>
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                          {project.description}
                        </div>
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 mt-1 inline-block max-w-full break-all"
                        >
                          {project.link}
                        </a>
                      </div>
                      <div className="flex flex-col gap-2 items-end shrink-0">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleMoveProject(index, "up")}
                            disabled={index === 0}
                            className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-sm transition-colors disabled:opacity-40"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => handleMoveProject(index, "down")}
                            disabled={index === projects.length - 1}
                            className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-sm transition-colors disabled:opacity-40"
                          >
                            ↓
                          </button>
                        </div>
                        <button
                          onClick={() => handleStartEditProject(project)}
                          className="px-3 py-1.5 rounded-lg text-sm bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          aria-label="Delete project"
                          title="Delete project"
                          className="p-1.5 rounded-lg text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {projects.length === 0 && (
                <div className="text-sm text-neutral-500">No projects yet.</div>
              )}
            </div>

            {/* New Project Form */}
            <div className="rounded-lg bg-neutral-50 dark:bg-neutral-900 p-5 mt-6">
              <h3 className="font-medium mb-4 text-sm">Add New Project</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Project Title"
                  value={newProject.title}
                  onChange={(e) =>
                    setNewProject({ ...newProject, title: e.target.value })
                  }
                  className="w-full rounded-lg bg-neutral-100 dark:bg-neutral-800 px-3 py-2 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-neutral-100/10 transition-shadow"
                />
                <input
                  type="text"
                  placeholder="Project Link (URL)"
                  value={newProject.link}
                  onChange={(e) =>
                    setNewProject({ ...newProject, link: e.target.value })
                  }
                  className="w-full rounded-lg bg-neutral-100 dark:bg-neutral-800 px-3 py-2 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-neutral-100/10 transition-shadow"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Year Built"
                  value={newProject.year}
                  onChange={(e) =>
                    setNewProject({ ...newProject, year: e.target.value })
                  }
                  className="w-full rounded-lg bg-neutral-100 dark:bg-neutral-800 px-3 py-2 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-neutral-100/10 transition-shadow"
                />
                <textarea
                  placeholder="Project Description"
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({
                      ...newProject,
                      description: e.target.value,
                    })
                  }
                  className="w-full rounded-lg bg-neutral-100 dark:bg-neutral-800 px-3 py-2 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-neutral-100/10 transition-shadow min-h-[80px]"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleAddProject}
                    disabled={isAddingProject}
                    className="px-4 py-2 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isAddingProject ? "Adding..." : "Add Project"}
                  </button>
                </div>
              </div>
            </div>

            {projects.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2 items-center justify-end">
                {orderFeedback && (
                  <span
                    className={`text-sm ${
                      orderFeedback.type === "success"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600"
                    }`}
                  >
                    {orderFeedback.text}
                  </span>
                )}
                <button
                  onClick={handleSaveProjectOrder}
                  disabled={!hasOrderChanges || isSavingOrder}
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  {isSavingOrder ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
