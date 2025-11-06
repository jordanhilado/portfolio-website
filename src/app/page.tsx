"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import { useTheme } from "next-themes";
import { useRouter, usePathname } from "next/navigation";
import { data } from "../assets/data";
import zionImage from "../assets/zion.jpg";

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
  const [activeSection, setActiveSection] = useState<Section>("About");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const sections: Section[] = [
    "About",
    "Projects",
    "Blogs",
    "Hobbies",
    "Contact",
  ];

  // useEffect to set mounted state after hydration and read URL
  useEffect(() => {
    setMounted(true);

    // Read the current URL path and set the section accordingly
    const currentSlug = pathname.replace("/", "");
    if (currentSlug) {
      const section = slugToSection(currentSlug);
      if (section) {
        setActiveSection(section);
      }
    }
  }, [pathname]);

  const handleSectionClick = (section: Section) => {
    if (section === activeSection) return;

    setIsTransitioning(true);

    // Update URL
    const slug = sectionToSlug(section);
    router.push(`/${slug}`, { scroll: false });

    setTimeout(() => {
      setActiveSection(section);
      setIsTransitioning(false);
    }, 100);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const renderContent = () => {
    switch (activeSection) {
      case "About":
        return (
          <div className="flex flex-col gap-y-3 font-light text-base leading-normal">
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
          <div className="flex flex-col gap-y-5 font-light text-base">
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
                <div className="leading-normal">{project.description}</div>
              </div>
            ))}
          </div>
        );

      case "Blogs":
        return (
          <div className="flex flex-col gap-y-3 font-light text-base leading-normal">
            <p>Coming soon...</p>
          </div>
        );

      case "Hobbies":
        return (
          <div className="flex flex-col gap-y-3 font-light text-base leading-normal">
            <p>
              Running, reading, building side projects, and exploring new
              technologies.
            </p>
          </div>
        );

      case "Contact":
        return (
          <div className="flex flex-col gap-y-3 font-light text-base leading-normal">
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
    <main className="flex min-h-screen items-center justify-center px-5 py-8 md:py-0 tracking-tighter border-yellow-500">
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
          <nav className="flex flex-row md:flex-col justify-between md:gap-x-0 gap-y-1 flex-wrap md:flex-nowrap md:justify-start items-center md:items-start border-purple-500">
            {sections.map((section) => (
              <button
                key={section}
                onClick={() => handleSectionClick(section)}
                className={`text-left font-songmyung tracking-tight font-bold transition-all whitespace-nowrap hover:underline hover:underline-offset-2 w-fit ${
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
