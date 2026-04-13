"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import AdminMarkdownEditor from "@/components/AdminMarkdownEditor";

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

type Tab = "posts" | "about" | "projects" | "hobbies";

interface AdminDashboardClientProps {
  posts: AdminListPost[];
  projects: Project[];
  aboutContent: AboutContent;
  hobbiesContent: string;
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

export default function AdminDashboardClient({
  posts: initialPosts,
  projects: initialProjects,
  aboutContent: initialAboutContent,
  hobbiesContent: initialHobbiesContent,
}: AdminDashboardClientProps) {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>("posts");
  const [posts] = useState(initialPosts);
  const [projects, setProjects] = useState(initialProjects);

  // About: single textarea for all paragraphs
  const [aboutText, setAboutText] = useState(
    initialAboutContent?.paragraphs.join("\n\n") || ""
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

  // New project form state
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    link: "",
  });
  const [isAddingProject, setIsAddingProject] = useState(false);

  // Inline project editing state
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState({
    title: "",
    description: "",
    link: "",
  });
  const [isSavingProject, setIsSavingProject] = useState(false);

  // Hobbies state
  const [hobbiesText, setHobbiesText] = useState(initialHobbiesContent);
  const [isSavingHobbies, setIsSavingHobbies] = useState(false);
  const [hobbiesSaveMessage, setHobbiesSaveMessage] = useState("");

  // Handle Hobbies content save
  const handleSaveHobbies = async () => {
    setIsSavingHobbies(true);
    setHobbiesSaveMessage("");

    try {
      const response = await fetch("/api/hobbies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: hobbiesText }),
      });

      if (!response.ok) throw new Error("Failed to save");

      setHobbiesSaveMessage("Saved successfully!");
      setTimeout(() => setHobbiesSaveMessage(""), 3000);
    } catch (error) {
      setHobbiesSaveMessage("Error saving content");
    } finally {
      setIsSavingHobbies(false);
    }
  };

  // Handle About content save
  const handleSaveAbout = async () => {
    setIsSavingAbout(true);
    setAboutSaveMessage("");

    try {
      const paragraphs = aboutText
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);

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
    if (!newProject.title || !newProject.description || !newProject.link) {
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

      if (!response.ok) throw new Error("Failed to add project");

      const addedProject = await response.json();
      setProjects((prev) =>
        [...prev, addedProject].sort((a, b) => a.order - b.order)
      );
      setNewProject({ title: "", description: "", link: "" });
    } catch (error) {
      alert("Error adding project");
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
    });
  };

  const handleCancelEditProject = () => {
    setEditingProjectId(null);
  };

  const handleUpdateProject = async (id: string) => {
    if (!editingProject.title || !editingProject.description || !editingProject.link) {
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

      if (!response.ok) throw new Error("Failed to update");

      const updated = await response.json();
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, title: updated.title, description: updated.description, link: updated.link }
            : p
        )
      );
      setEditingProjectId(null);
    } catch (error) {
      alert("Error updating project");
    } finally {
      setIsSavingProject(false);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "posts", label: "Posts" },
    { key: "about", label: "About" },
    { key: "projects", label: "Projects" },
    { key: "hobbies", label: "Hobbies" },
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
        <div className="flex gap-1 mb-8 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-md text-sm transition-all ${
                activeTab === tab.key
                  ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-medium shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Posts Tab */}
        {activeTab === "posts" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium">Blog Posts</h2>
              <Link
                href="/admin/new"
                className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                New Post
              </Link>
            </div>
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
                        href={`/blogs/${post.slug}`}
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
          </div>
        )}

        {/* About Tab */}
        {activeTab === "about" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium">About Content</h2>
              <div className="flex gap-2 items-center">
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

            <div className="space-y-6">
              {/* About Paragraphs - Single Textarea */}
              <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-2">
                  About Paragraphs
                </label>
                <textarea
                  value={aboutText}
                  onChange={(e) => setAboutText(e.target.value)}
                  className="w-full rounded-lg bg-neutral-100 dark:bg-neutral-800 px-3 py-2 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-neutral-100/10 transition-shadow min-h-[250px]"
                  placeholder="Write your about content here..."
                />
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1.5">
                  Separate paragraphs with a blank line.
                </p>
              </div>

              {/* Contact Links - Structured Fields */}
              <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-2">
                  Contact Links
                </label>
                <div className="space-y-2">
                  {contactLinks.map((link, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row gap-2"
                    >
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) =>
                          handleContactLinkChange(index, "label", e.target.value)
                        }
                        className="sm:w-1/3 rounded-lg bg-neutral-100 dark:bg-neutral-800 px-3 py-2 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-neutral-100/10 transition-shadow"
                        placeholder="Label"
                      />
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) =>
                          handleContactLinkChange(index, "url", e.target.value)
                        }
                        className="flex-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 px-3 py-2 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-neutral-100/10 transition-shadow"
                        placeholder="https://... or mailto:..."
                      />
                      <button
                        onClick={() => removeContactLink(index)}
                        className="px-3 py-1.5 rounded-lg text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 hover:bg-red-100 dark:hover:bg-red-900 transition-colors self-start"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addContactLink}
                  className="mt-3 px-4 py-2 rounded-lg text-sm bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  + Add Link
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hobbies Tab */}
        {activeTab === "hobbies" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium">Hobbies</h2>
              <div className="flex gap-2 items-center">
                {hobbiesSaveMessage && (
                  <span
                    className={`text-sm ${
                      hobbiesSaveMessage.includes("Error")
                        ? "text-red-600"
                        : "text-green-600 dark:text-green-400"
                    }`}
                  >
                    {hobbiesSaveMessage}
                  </span>
                )}
                <button
                  onClick={handleSaveHobbies}
                  disabled={isSavingHobbies}
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isSavingHobbies ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
            <AdminMarkdownEditor
              value={hobbiesText}
              onChange={setHobbiesText}
              minHeight="250px"
            />
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === "projects" && (
          <div>
            <h2 className="text-xl font-medium mb-6">Projects</h2>

            {/* New Project Form */}
            <div className="rounded-lg bg-neutral-50 dark:bg-neutral-900 p-5 mb-6">
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
                <button
                  onClick={handleAddProject}
                  disabled={isAddingProject}
                  className="px-4 py-2 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isAddingProject ? "Adding..." : "Add Project"}
                </button>
              </div>
            </div>

            {/* Existing Projects */}
            <div className="space-y-3">
              {projects.length > 0 && (
                <div className="flex items-center justify-between text-sm mb-1">
                  <p className="text-neutral-500 dark:text-neutral-400">
                    Reorder with arrows. Save when done.
                  </p>
                  <div className="flex items-center gap-3">
                    {orderFeedback && (
                      <span
                        className={
                          orderFeedback.type === "success"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600"
                        }
                      >
                        {orderFeedback.text}
                      </span>
                    )}
                    <button
                      onClick={handleSaveProjectOrder}
                      disabled={!hasOrderChanges || isSavingOrder}
                      className="px-3 py-1.5 rounded-lg text-sm bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-40"
                    >
                      {isSavingOrder ? "Saving..." : "Save Order"}
                    </button>
                  </div>
                </div>
              )}
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
                        <div className="font-medium">{project.title}</div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                          {project.description}
                        </div>
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 mt-1 inline-block"
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
                          className="px-3 py-1.5 rounded-lg text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                        >
                          Delete
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
          </div>
        )}
      </div>
    </main>
  );
}
