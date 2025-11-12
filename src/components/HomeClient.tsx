"use client";

import { useState, useEffect, Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { data } from "../assets/data";
import zionImage from "../assets/zion.jpg";

const SunIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
  </svg>
);

const MoonIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z"
      clipRule="evenodd"
    />
  </svg>
);

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
            className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 hover:underline active:underline"
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
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Derive activeSection from pathname instead of storing in state
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

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSectionClick = (section: Section) => {
    if (section === activeSection) return;

    setIsTransitioning(true);

    const slug = sectionToSlug(section);
    router.push(`/${slug}`, { scroll: false });

    setTimeout(() => {
      setIsTransitioning(false);
    }, 75);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

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
                      className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 hover:underline active:underline"
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
                className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 hover:underline active:underline"
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
                  className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 hover:underline active:underline"
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
    <main className="flex min-h-screen items-start justify-center px-10 py-8 md:py-0 tracking-tight border-yellow-500">
      <div className="flex flex-col max-w-2xl gap-y-4 border-green-500 pt-10">
        {/* Zion Image */}
        <div className="w-full">
          <Image
            src={zionImage}
            alt={data.heroAlt}
            className="w-full max-w-fit h-auto"
            priority
          />
        </div>

        {/* Navigation and Content */}
        <div className="flex flex-col md:flex-row md:justify-between gap-y-8 md:gap-y-0 md:gap-x-16 border-blue-500">
          {/* Left Sidebar / Top Navigation on Mobile */}
          <nav className="flex flex-row md:flex-col justify-between md:gap-x-0 gap-x-2 gap-y-1 flex-wrap md:flex-nowrap md:justify-start items-center md:items-start border-purple-500">
            {data.sections.map((section) => (
              <button
                key={section}
                onClick={() => handleSectionClick(section)}
                className={`text-left text-base/5 tracking-tight font-songmyung font-bold transition-all whitespace-nowrap hover:text-neutral-900 dark:hover:text-neutral-100 w-fit ${
                  activeSection === section
                    ? "text-neutral-900 dark:text-neutral-100"
                    : "text-neutral-500 dark:text-neutral-400"
                }`}
              >
                {section}
              </button>
            ))}

            {/* Theme Toggle Icon */}
            {mounted && (
              <div
                onClick={toggleTheme}
                className="md:mt-2 cursor-pointer transition-colors w-fit text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                aria-label="Toggle theme"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleTheme();
                  }
                }}
              >
                {resolvedTheme === "dark" ? (
                  <SunIcon className="h-4 w-4" />
                ) : (
                  <MoonIcon className="h-4 w-4" />
                )}
              </div>
            )}
          </nav>

          {/* Content Area */}
          <div
            className={`w-full transition-opacity duration-100 border-red-500 ${
              isTransitioning ? "opacity-0" : "opacity-100"
            }`}
          >
            <div className="text-base/5 text-neutral-500 dark:text-neutral-400">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
