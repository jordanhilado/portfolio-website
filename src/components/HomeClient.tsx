"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { data } from "../assets/data";

type Section = (typeof data.sections)[number];

const sectionToSlug = (section: Section): string => {
  return section
    .toLowerCase()
    .replace(/\s+&\s+/g, "-")
    .replace(/\s+/g, "-");
};

const slugToSection = (slug: string): Section | null => {
  const sectionMap: Record<string, Section> = Object.fromEntries(
    data.sections.map((section) => [sectionToSlug(section), section as Section])
  );
  return sectionMap[slug] || null;
};

type ListPost = {
  id: string;
  slug: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};

function BlogsListClient({ posts }: { posts: ListPost[] }) {
  return (
    <div className="flex flex-col gap-y-5">
      {posts.map((p) => (
        <div key={p.id} className="flex flex-col gap-y-1.5">
          <Link
            href={`/blogs/${p.slug}`}
            className="text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
            style={{ fontFamily: "Song Myung" }}
          >
            <div className="font-normal">{p.title}</div>
          </Link>
          <div className="leading-snug text-neutral-500 dark:text-neutral-400 text-sm">
            {formatDate(p.createdAt)}
          </div>
        </div>
      ))}
      {posts.length === 0 && (
        <div className="text-neutral-500 dark:text-neutral-400">...</div>
      )}
    </div>
  );
}

export default function HomeClient({ posts }: { posts: ListPost[] }) {
  const pathname = usePathname();

  // Derive activeSection from pathname
  const getActiveSection = (): Section => {
    const currentSlug = pathname.replace("/", "");
    if (currentSlug) {
      const section = slugToSection(currentSlug);
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
        return (
          <div className="flex flex-col gap-y-3">
            {data.about.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
            <p>
              Connect with me on{" "}
              {data.contact.map((c, idx) => (
                <Fragment key={c.name}>
                  {c.name === "Email" ? (
                    <span>jordanalihilado at gmail dot com</span>
                  ) : (
                    <Link
                      href={c.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
                      style={{ fontFamily: "Song Myung" }}
                    >
                      {c.name}
                    </Link>
                  )}
                  {idx < data.contact.length - 2
                    ? ", "
                    : idx === data.contact.length - 2
                    ? ", or at "
                    : ""}
                </Fragment>
              ))}
              . View my resume{" "}
              <Link
                href={data.resume_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
                style={{ fontFamily: "Song Myung" }}
              >
                here
              </Link>
              .
            </p>
          </div>
        );

      case "Projects":
        return (
          <div className="flex flex-col gap-y-5">
            {data.projects.map((project, index) => (
              <div key={index} className="flex flex-col gap-y-1.5">
                <Link
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
                  style={{ fontFamily: "Song Myung" }}
                >
                  <div className="font-normal">{project.title}</div>
                </Link>
                <div className="leading-snug text-neutral-500 dark:text-neutral-400">
                  {project.description}
                </div>
              </div>
            ))}
          </div>
        );

      case "Blogs":
        return <BlogsListClient posts={posts} />;

      case "Hobbies":
        return (
          <div className="flex flex-col gap-y-3">
            <p>{data.hobbies}</p>
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
