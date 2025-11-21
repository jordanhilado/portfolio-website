"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DEFAULT_HOBBIES } from "@/constants/site";
import { formatBlogDate } from "@/lib/date";

type Section = "About" | "Projects" | "Blogs" | "Hobbies";

const sectionToSlug = (section: Section): string => {
  return section
    .toLowerCase()
    .replace(/\s+&\s+/g, "-")
    .replace(/\s+/g, "-");
};

const slugToSection = (slug: string, sections: Section[]): Section | null => {
  const sectionMap: Record<string, Section> = Object.fromEntries(
    sections.map((section) => [sectionToSlug(section), section as Section])
  );
  return sectionMap[slug] || null;
};

// Parse markdown-style link: [Link Title](url)
const parseMarkdownLink = (
  text: string
): Array<string | { text: string; url: string }> => {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: Array<string | { text: string; url: string }> = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    // Add the link
    parts.push({ text: match[1], url: match[2] });
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after the last link
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  // If no links found, return the original text
  if (parts.length === 0) {
    return [text];
  }

  return parts;
};

type ListPost = {
  id: string;
  slug: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

type Project = {
  id: string;
  title: string;
  description: string;
  link: string;
  order: number;
};

function BlogsListClient({ posts }: { posts: ListPost[] }) {
  return (
    <div className="flex flex-col gap-y-5">
      {posts.map((p) => (
        <div key={p.id} className="flex flex-col gap-y-1.5">
          <Link
            href={`/blogs/${p.slug}`}
            className="text-lg text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
            style={{ fontFamily: "Song Myung" }}
          >
            <div className="font-normal leading-tight">{p.title}</div>
          </Link>
          <div className="leading-snug text-neutral-500 dark:text-neutral-400 text-sm">
            {formatBlogDate(p.createdAt)}
          </div>
        </div>
      ))}
      {posts.length === 0 && (
        <div className="text-neutral-500 dark:text-neutral-400">...</div>
      )}
    </div>
  );
}

interface HomeClientProps {
  posts: ListPost[];
  projects?: Project[];
  aboutParagraphs: string[];
  contactLinks?: string[];
  hobbies?: string;
  sections: Section[];
}

export default function HomeClient({
  posts,
  projects,
  aboutParagraphs,
  contactLinks = [],
  hobbies = DEFAULT_HOBBIES,
  sections,
}: HomeClientProps) {
  const pathname = usePathname();

  // Derive activeSection from pathname
  const getActiveSection = (): Section => {
    const currentSlug = pathname.replace("/", "");
    if (currentSlug) {
      const section = slugToSection(currentSlug, sections);
      if (section) {
        return section;
      }
    }
    return "About";
  };

  const activeSection = getActiveSection();

  const renderContent = () => {
    switch (activeSection) {
      case "About":
        return aboutParagraphs.length === 0 && contactLinks.length === 0 ? (
          <div className="text-neutral-500 dark:text-neutral-400">...</div>
        ) : (
          <div className="flex flex-col gap-y-3">
            {aboutParagraphs.map((paragraph, index) => {
              const parsed = parseMarkdownLink(paragraph);
              return (
                <p key={index}>
                  {parsed.map((part, partIndex) => {
                    if (typeof part === "string") {
                      return <Fragment key={partIndex}>{part}</Fragment>;
                    } else {
                      return (
                        <Link
                          key={partIndex}
                          href={part.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
                          style={{ fontFamily: "Song Myung" }}
                        >
                          {part.text}
                        </Link>
                      );
                    }
                  })}
                </p>
              );
            })}
            {contactLinks.length > 0 && (
              <p>
                {contactLinks.map((link, idx) => {
                  const parsed = parseMarkdownLink(link);
                  const isLast = idx === contactLinks.length - 1;

                  return (
                    <Fragment key={idx}>
                      {parsed.map((part, partIndex) => {
                        if (typeof part === "string") {
                          return <Fragment key={partIndex}>{part}</Fragment>;
                        } else {
                          return (
                            <Link
                              key={partIndex}
                              href={part.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-lg text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
                              style={{ fontFamily: "Song Myung" }}
                            >
                              {part.text}
                            </Link>
                          );
                        }
                      })}
                      {!isLast && " | "}
                    </Fragment>
                  );
                })}
              </p>
            )}
          </div>
        );

      case "Projects":
        return (
          <div className="flex flex-col gap-y-5">
            {projects && projects.length > 0 ? (
              projects.map((project) => (
                <div key={project.id} className="flex flex-col gap-y-1.5">
                  <Link
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
                    style={{ fontFamily: "Song Myung" }}
                  >
                    <div className="font-normal leading-tight">
                      {project.title}
                    </div>
                  </Link>
                  <div className="leading-snug text-neutral-500 dark:text-neutral-400">
                    {project.description}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-neutral-500 dark:text-neutral-400">...</div>
            )}
          </div>
        );

      case "Blogs":
        return <BlogsListClient posts={posts} />;

      case "Hobbies":
        return (
          <div className="flex flex-col gap-y-3">
            <p>{hobbies || "..."}</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      key={activeSection}
      className="text-base/5 text-neutral-500 dark:text-neutral-400 animate-fadeIn"
    >
      {renderContent()}
    </div>
  );
}
