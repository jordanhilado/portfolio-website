"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import zionImage from "@/assets/zion.jpg";

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

export default function LayoutWrapper({
  children,
  sections,
  heroAlt,
}: {
  children: React.ReactNode;
  sections: Section[];
  heroAlt: string;
}) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Skip wrapper entirely for admin pages
  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  // Determine if we should show navigation based on the route
  const showNavigation = !pathname.startsWith("/blogs/");

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

  return (
    <main className="flex min-h-screen items-start justify-center px-6 sm:px-10 md:px-16 py-8 md:py-10 tracking-tight">
      <div className="flex flex-col w-full max-w-2xl gap-y-4 pt-6 md:pt-10">
        {/* Zion Image */}
        <div className="w-full">
          <Image
            src={zionImage}
            alt={heroAlt}
            className="w-full h-auto object-contain"
            priority
          />
        </div>

        {showNavigation ? (
          /* Navigation and Content Layout */
          <div className="flex flex-col md:flex-row md:justify-between gap-y-8 md:gap-y-0 md:gap-x-16">
            {/* Left Sidebar / Top Navigation on Mobile */}
            <nav className="flex flex-row md:flex-col justify-between md:gap-x-0 gap-x-2 gap-y-1 flex-wrap md:flex-nowrap md:justify-start items-center md:items-start">
              {sections.map((section) => {
                const href =
                  section === "About" ? "/" : `/${sectionToSlug(section)}`;
                return (
                  <Link
                    key={section}
                    href={href}
                    prefetch={true}
                    className={`text-left text-lg/5 md:text-base/5 tracking-tight font-songmyung font-bold transition-all whitespace-nowrap hover:text-neutral-900 dark:hover:text-neutral-100 w-fit ${
                      activeSection === section
                        ? "text-neutral-900 dark:text-neutral-100"
                        : "text-neutral-500 dark:text-neutral-400"
                    }`}
                  >
                    {section}
                  </Link>
                );
              })}

              {/* Theme Toggle Icon */}
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
                style={{ minWidth: "16px", minHeight: "16px" }}
              >
                {/* Render both icons, CSS controls visibility based on theme */}
                <SunIcon className="h-4 w-4 block dark:hidden" />
                <MoonIcon className="h-4 w-4 hidden dark:block" />
              </div>
            </nav>

            {/* Content Area */}
            <div className="w-full">{children}</div>
          </div>
        ) : (
          /* Blog Post Layout - No Navigation */
          <div className="w-full">{children}</div>
        )}
      </div>
    </main>
  );
}
