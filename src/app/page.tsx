"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { data } from "../assets/data";
import zionImage from "../assets/zion.jpg";

// Custom SVG icons
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

type Section = "About" | "Projects" | "Blogs" | "Hobbies" | "Contact";

// Helper functions to convert between section names and URL slugs
const sectionToSlug = (section: Section): string => {
  return section
    .toLowerCase()
    .replace(/\s+&\s+/g, "-")
    .replace(/\s+/g, "-");
};

const slugToSection = (slug: string): Section | null => {
  const sectionMap: Record<string, Section> = {
    about: "About",
    projects: "Projects",
    blogs: "Blogs",
    hobbies: "Hobbies",
    contact: "Contact",
  };
  return sectionMap[slug] || null;
};

export default function Home() {
  const pathname = usePathname();

  // Initialize activeSection based on the current pathname
  const getInitialSection = (): Section => {
    const currentSlug = pathname.replace("/", "");
    if (currentSlug) {
      const section = slugToSection(currentSlug);
      if (section) {
        return section;
      }
    }
    return "About";
  };

  const [activeSection, setActiveSection] = useState<Section>(
    getInitialSection()
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const sections: Section[] = [
    "About",
    "Projects",
    "Blogs",
    "Hobbies",
    "Contact",
  ];

  // useEffect to set mounted state after hydration and sync with URL changes
  useEffect(() => {
    setMounted(true);

    // Handle browser back/forward buttons
    const handlePopState = () => {
      const currentPath = window.location.pathname.replace("/", "");
      const section = slugToSection(currentPath) || "About";
      setActiveSection(section);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Sync activeSection when pathname changes (e.g., direct navigation)
  useEffect(() => {
    const currentSlug = pathname.replace("/", "");
    const section = slugToSection(currentSlug) || "About";
    if (section !== activeSection) {
      setActiveSection(section);
    }
  }, [pathname]);

  const handleSectionClick = (section: Section) => {
    if (section === activeSection) return;

    setIsTransitioning(true);

    // Update URL using History API to avoid page navigation
    const slug = sectionToSlug(section);
    window.history.pushState({}, "", `/${slug}`);

    setTimeout(() => {
      setActiveSection(section);
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
          <div className="flex flex-col gap-y-3 font-light text-xs md:text-base leading-snug">
            <p>
              Jordan is currently a software engineer at Microsoft. Previously,
              he worked on software engineering for Disney Animation and Handle
              Delivery.
            </p>
            <p>
              In his free time, he works on building Heaptree, training for
              marathons, or reading about technology (history, startups,
              emerging research).
            </p>
            <p>
              He grew up in Los Angeles and is currently based in San Francisco.
            </p>
          </div>
        );

      case "Projects":
        return (
          <div className="flex flex-col gap-y-5 font-light text-xs md:text-base">
            {data.projects.map((project, index) => (
              <div key={index} className="flex flex-col gap-y-1.5">
                <Link
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-700 hover:text-green-800 hover:underline active:underline"
                >
                  <div className="font-normal">{project.title}</div>
                </Link>
                <div className="leading-snug">{project.description}</div>
              </div>
            ))}
          </div>
        );

      case "Blogs":
        return (
          <div className="flex flex-col gap-y-3 font-light text-xs md:text-base leading-snug">
            <p>Coming soon...</p>
          </div>
        );

      case "Hobbies":
        return (
          <div className="flex flex-col gap-y-3 font-light text-xs md:text-base leading-snug">
            <p>
              Running, reading, building side projects, and exploring new
              technologies.
            </p>
          </div>
        );

      case "Contact":
        return (
          <div className="flex flex-col gap-y-3 font-light text-xs md:text-base leading-snug">
            <p>
              Connect with me on{" "}
              <Link
                href="https://github.com/jordanhilado"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 hover:text-green-800 hover:underline active:underline"
              >
                GitHub
              </Link>
              ,{" "}
              <Link
                href="https://www.linkedin.com/in/jordanhilado/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 hover:text-green-800 hover:underline active:underline"
              >
                LinkedIn
              </Link>
              ,{" "}
              <Link
                href="https://x.com/jordanhilado"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 hover:text-green-800 hover:underline active:underline"
              >
                X
              </Link>
              , or at jordanalihilado at gmail dot com! View my resume{" "}
              <Link
                href={data.resume_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 hover:text-green-800 hover:underline active:underline"
              >
                here
              </Link>
              .
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-10 py-8 md:py-0 tracking-tighter border-yellow-500">
      <div className="flex flex-col max-w-2xl gap-y-4 border-green-500">
        {/* Zion Image */}
        <div className="w-full">
          <Image
            src={zionImage}
            alt="Zion National Park"
            className="w-full max-w-fit h-auto"
            priority
          />
        </div>

        {/* Navigation and Content */}
        <div className="flex flex-col md:flex-row md:justify-between gap-y-8 md:gap-y-0 md:gap-x-16 border-blue-500">
          {/* Left Sidebar / Top Navigation on Mobile */}
          <nav className="flex flex-row md:flex-col justify-between md:gap-x-0 gap-x-2 gap-y-1 flex-wrap md:flex-nowrap md:justify-start items-center md:items-start border-purple-500">
            {sections.map((section) => (
              <button
                key={section}
                onClick={() => handleSectionClick(section)}
                className={`text-left text-sm md:text-base font-songmyung tracking-tight font-bold transition-all whitespace-nowrap hover:underline hover:underline-offset-2 w-fit ${
                  activeSection === section
                    ? "underline underline-offset-2"
                    : ""
                }`}
              >
                {section}
              </button>
            ))}

            {/* Theme Toggle Icon */}
            {mounted && (
              <div
                onClick={toggleTheme}
                className="md:mt-2 cursor-pointer transition-opacity hover:opacity-70 w-fit"
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
                {theme === "dark" ? (
                  <SunIcon className="h-4 w-4" />
                ) : (
                  <MoonIcon className="h-4 w-4" />
                )}
              </div>
            )}
          </nav>

          {/* Content Area */}
          <div
            className={`w-full md:w-[700px] min-h-[400px] transition-opacity duration-100 border-red-500 ${
              isTransitioning ? "opacity-0" : "opacity-100"
            }`}
          >
            {renderContent()}
          </div>
        </div>
      </div>
    </main>
  );
}
