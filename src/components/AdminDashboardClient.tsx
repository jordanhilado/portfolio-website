"use client";

import { useState } from "react";
import Link from "next/link";

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

type Tab = "posts" | "about" | "projects";

interface AdminDashboardClientProps {
  posts: AdminListPost[];
  projects: Project[];
  aboutContent: AboutContent;
}

export default function AdminDashboardClient({
  posts: initialPosts,
  projects: initialProjects,
  aboutContent: initialAboutContent,
}: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("posts");
  const [posts] = useState(initialPosts);
  const [projects, setProjects] = useState(initialProjects);
  const [aboutParagraphs, setAboutParagraphs] = useState<string[]>(
    initialAboutContent?.paragraphs || []
  );
  const [contactLinks, setContactLinks] = useState<string[]>(
    initialAboutContent?.contactLinks || []
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

  // Handle About content save
  const handleSaveAbout = async () => {
    setIsSavingAbout(true);
    setAboutSaveMessage("");

    try {
      const response = await fetch("/api/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paragraphs: aboutParagraphs,
          contactLinks: contactLinks,
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

  // Handle About paragraph changes
  const handleParagraphChange = (index: number, value: string) => {
    const newParagraphs = [...aboutParagraphs];
    newParagraphs[index] = value;
    setAboutParagraphs(newParagraphs);
  };

  const addParagraph = () => {
    setAboutParagraphs([...aboutParagraphs, ""]);
  };

  const removeParagraph = (index: number) => {
    setAboutParagraphs(aboutParagraphs.filter((_, i) => i !== index));
  };

  // Handle Contact Links changes
  const handleContactLinkChange = (index: number, value: string) => {
    const newLinks = [...contactLinks];
    newLinks[index] = value;
    setContactLinks(newLinks);
  };

  const addContactLink = () => {
    setContactLinks([...contactLinks, ""]);
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
      setOrderFeedback({ type: "success", text: "Project order updated." });
    } catch (error) {
      setOrderFeedback({
        type: "error",
        text: "Failed to save order. Please try again.",
      });
    } finally {
      setIsSavingOrder(false);
    }
  };

  return (
    <main className="flex min-h-screen px-6 sm:px-10 md:px-16 py-10 justify-center">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>

        {/* Tabs */}
        <div className="flex gap-4 border-b mb-6">
          <button
            onClick={() => setActiveTab("posts")}
            className={`px-4 py-2 -mb-px ${
              activeTab === "posts"
                ? "border-b-2 border-neutral-900 dark:border-neutral-100 font-medium"
                : "text-neutral-500"
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab("about")}
            className={`px-4 py-2 -mb-px ${
              activeTab === "about"
                ? "border-b-2 border-neutral-900 dark:border-neutral-100 font-medium"
                : "text-neutral-500"
            }`}
          >
            About
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`px-4 py-2 -mb-px ${
              activeTab === "projects"
                ? "border-b-2 border-neutral-900 dark:border-neutral-100 font-medium"
                : "text-neutral-500"
            }`}
          >
            Projects
          </button>
        </div>

        {/* Posts Tab */}
        {activeTab === "posts" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium">Blog Posts</h2>
              <Link
                href="/admin/new"
                className="px-3 py-1.5 rounded-md bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
              >
                New Post
              </Link>
            </div>
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="border rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{post.title}</div>
                      <div className="text-xs text-neutral-500">
                        {post.published ? "Published" : "Draft"} • Created{" "}
                        {new Date(post.createdAt).toLocaleDateString()} •
                        Updated {new Date(post.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/edit/${post.id}`}
                        className="px-2 py-1 rounded border"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/blogs/${post.slug}`}
                        className="px-2 py-1 rounded border"
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
                  <span className="text-sm text-green-600">
                    {aboutSaveMessage}
                  </span>
                )}
                <button
                  onClick={handleSaveAbout}
                  disabled={isSavingAbout}
                  className="px-3 py-1.5 rounded-md bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 disabled:opacity-50"
                >
                  {isSavingAbout ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">About Paragraphs</h3>
                {aboutParagraphs.map((paragraph, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <textarea
                      value={paragraph}
                      onChange={(e) =>
                        handleParagraphChange(index, e.target.value)
                      }
                      className="flex-1 p-3 border rounded-md min-h-[100px] bg-white dark:bg-neutral-900"
                      placeholder={`Paragraph ${index + 1}`}
                    />
                    <button
                      onClick={() => removeParagraph(index)}
                      className="px-3 py-1 border rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={addParagraph}
                  className="px-4 py-2 border rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-900"
                >
                  + Add Paragraph
                </button>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Contact Links</h3>
                <p className="text-xs text-neutral-500 mb-2">
                  Use markdown format: [Link Title](url) or plain text for email
                </p>
                {contactLinks.map((link, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={link}
                      onChange={(e) =>
                        handleContactLinkChange(index, e.target.value)
                      }
                      className="flex-1 p-3 border rounded-md bg-white dark:bg-neutral-900"
                      placeholder="[GitHub](https://github.com/username) or plain text"
                    />
                    <button
                      onClick={() => removeContactLink(index)}
                      className="px-3 py-1 border rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={addContactLink}
                  className="px-4 py-2 border rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-900"
                >
                  + Add Contact Link
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === "projects" && (
          <div>
            <h2 className="text-xl font-medium mb-6">Projects</h2>

            {/* New Project Form */}
            <div className="border rounded-md p-4 mb-6 bg-neutral-50 dark:bg-neutral-900">
              <h3 className="font-medium mb-4">Add New Project</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Project Title"
                  value={newProject.title}
                  onChange={(e) =>
                    setNewProject({ ...newProject, title: e.target.value })
                  }
                  className="w-full p-2 border rounded-md bg-white dark:bg-neutral-800"
                />
                <input
                  type="text"
                  placeholder="Project Link (URL)"
                  value={newProject.link}
                  onChange={(e) =>
                    setNewProject({ ...newProject, link: e.target.value })
                  }
                  className="w-full p-2 border rounded-md bg-white dark:bg-neutral-800"
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
                  className="w-full p-2 border rounded-md min-h-[80px] bg-white dark:bg-neutral-800"
                />
                <button
                  onClick={handleAddProject}
                  disabled={isAddingProject}
                  className="px-4 py-2 rounded-md bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 disabled:opacity-50"
                >
                  {isAddingProject ? "Adding..." : "Add Project"}
                </button>
              </div>
            </div>

            {/* Existing Projects */}
            <div className="space-y-4">
              {projects.length > 0 && (
                <div className="flex items-center justify-between text-sm mb-2">
                  <p className="text-neutral-500">
                    Use the arrows to rearrange projects. Save when done.
                  </p>
                  <div className="flex items-center gap-3">
                    {orderFeedback && (
                      <span
                        className={
                          orderFeedback.type === "success"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {orderFeedback.text}
                      </span>
                    )}
                    <button
                      onClick={handleSaveProjectOrder}
                      disabled={!hasOrderChanges || isSavingOrder}
                      className="px-3 py-1.5 rounded-md border text-sm disabled:opacity-50"
                    >
                      {isSavingOrder ? "Saving..." : "Save Order"}
                    </button>
                  </div>
                </div>
              )}
              {projects.map((project, index) => (
                <div key={project.id} className="border rounded-md p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="font-medium">{project.title}</div>
                      <div className="text-sm text-neutral-500 mt-1">
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
                    <div className="flex flex-col gap-2 items-end">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleMoveProject(index, "up")}
                          disabled={index === 0}
                          className="px-2 py-1 border rounded-md text-sm disabled:opacity-40"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => handleMoveProject(index, "down")}
                          disabled={index === projects.length - 1}
                          className="px-2 py-1 border rounded-md text-sm disabled:opacity-40"
                        >
                          ↓
                        </button>
                      </div>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="px-3 py-1 border rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
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
