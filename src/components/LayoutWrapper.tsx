"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import zionImage from "@/assets/zion.jpg";
import { sectionToSlug, type DefaultSection } from "@/constants/site";

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

type Section = DefaultSection;

/**
 * How far below the top of the viewport a section has to reach before the nav
 * calls it the current one. Sits below the sections' scroll-margin-top so a
 * section parked by an anchor click reads as active immediately.
 */
const ACTIVATION_LINE_PX = 120;

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
  const { resolvedTheme, setTheme } = useTheme();

  // Every section lives on the landing page now, so the nav is a set of anchors
  // and the highlight has to come from scroll position rather than the route.
  const [activeSlug, setActiveSlug] = useState<string>("");

  const isAdmin = pathname.startsWith("/admin");
  const showNavigation = !isAdmin && !pathname.startsWith("/thoughts/");

  // Joined so the effect keys off the section list's contents, not the array
  // identity, which the layout recreates on every render.
  const slugKey = sections.map(sectionToSlug).join("|");

  useEffect(() => {
    if (!showNavigation) {
      return;
    }

    const slugs = slugKey.split("|");
    let frame = 0;

    const update = () => {
      frame = 0;

      const present = slugs.filter((slug) => document.getElementById(slug));
      if (present.length === 0) {
        return;
      }

      let current = present[0];
      for (const slug of present) {
        const element = document.getElementById(slug);
        if (element && element.getBoundingClientRect().top <= ACTIVATION_LINE_PX) {
          current = slug;
        }
      }

      // The last section is usually too short to ever climb past the activation
      // line, so reaching the end of the page selects it outright.
      const scrolledToBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2;
      if (scrolledToBottom) {
        current = present[present.length - 1];
      }

      setActiveSlug(current);
    };

    const onScroll = () => {
      if (frame) {
        return;
      }
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [showNavigation, slugKey]);

  // resolvedTheme, not theme: theme is "system" until the user picks explicitly,
  // so comparing it against "dark" would set "dark" again on a dark-mode device
  // and swallow the first tap.
  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  // Skip wrapper entirely for admin pages
  if (isAdmin) {
    return <>{children}</>;
  }

  // Below md the nav is a horizontal bar. Its items stay flat children of the
  // one flex container so justify-evenly divides the free space across all of
  // them at once — nesting them in half-row wrappers made the seam between the
  // wrappers collect its own share of slack on top of theirs, which is what
  // opened an extra gap at the midpoint of the bar. The bar never wraps: every
  // section plus the theme toggle stays on one line at full type size, which the
  // narrow gap below sm is what makes room for.
  const renderLink = (section: Section) => {
    const slug = sectionToSlug(section);
    const isActive = activeSlug === slug;
    return (
      <a
        key={section}
        href={`#${slug}`}
        aria-current={isActive ? "true" : undefined}
        className={`text-left md:text-right text-lg/5 tracking-tight font-songmyung font-bold transition-all whitespace-nowrap hover:text-neutral-900 dark:hover:text-neutral-100 w-fit shrink-0 ${
          isActive
            ? "text-neutral-900 dark:text-neutral-100"
            : "text-neutral-500 dark:text-neutral-400"
        }`}
      >
        {section}
      </a>
    );
  };


  const hero = (
    <Image
      src={zionImage}
      alt={heroAlt}
      className="w-full h-auto object-contain"
      priority
    />
  );

  // Thought Post Layout - No Navigation
  if (!showNavigation) {
    return (
      <main className="flex min-h-screen items-start justify-center px-6 sm:px-10 md:px-16 py-8 md:py-10 tracking-tight">
        <div className="flex flex-col w-full max-w-2xl gap-y-4 pt-6 md:pt-10">
          <div className="w-full">{hero}</div>
          <div className="w-full">{children}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-start justify-center px-6 sm:px-10 md:px-16 py-8 md:py-10 tracking-tight">
      {/* Past md the page is a grid: the nav owns column one and runs down the
          full height, while the hero and the content stack in column two so the
          hero is only as wide as the text below it. From lg an empty third
          column mirrors the nav's width, which is what lets justify-center land
          the content column on the middle of the page rather than centering the
          nav-plus-content pair. Below lg there is not room for that mirror, so
          the pair centers together the way it always has. */}
      <div className="grid w-full max-w-2xl md:max-w-none grid-cols-1 md:grid-cols-[5rem_minmax(0,545px)] lg:grid-cols-[5rem_minmax(0,545px)_5rem] md:justify-center gap-4 pt-6 md:pt-10">
        {/* Zion Image */}
        <div className="w-full md:col-start-2 md:row-start-1">{hero}</div>

        {/* Left Sidebar / Top Navigation on Mobile.
            Sticky past md so the section list stays put on a page that is
            now one long scroll; self-start is what lets it stick at all.
            The extra bottom margin below md restores the wider gap the nav
            bar used to have under it, which the grid's single row gap
            would otherwise flatten.
            Below sm the bar reaches past the page's horizontal padding: those
            16px are the margin that keeps the four sections and the toggle on
            one line at full type size down to a ~305px viewport. */}
        <nav className="flex flex-row md:flex-col flex-nowrap justify-evenly md:justify-start md:gap-x-0 gap-x-1 sm:gap-x-4 gap-y-1 -mx-2 sm:mx-0 items-center md:items-end mb-4 md:mb-0 md:col-start-1 md:row-start-1 md:row-span-2 md:sticky md:top-10 md:self-start">
          {sections.map(renderLink)}

          {/* Theme Toggle Icon */}
          <div
            onClick={toggleTheme}
            className="md:mt-2 cursor-pointer transition-colors w-fit shrink-0 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
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
        <div className="w-full md:col-start-2 md:row-start-2">{children}</div>

        {/* Mirrors the nav column so the content column, not the pair, is what
            sits centered on the page. */}
        <div aria-hidden className="hidden lg:block lg:col-start-3 lg:row-start-1" />
      </div>
    </main>
  );
}
