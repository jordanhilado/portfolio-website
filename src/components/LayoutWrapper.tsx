"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
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

/** About is the landing page; every other section lives at its own slug. */
const sectionHref = (section: Section) =>
  section === "About" ? "/" : `/${sectionToSlug(section)}`;

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
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  // A post preview is an admin route but shows the post as the site will, so
  // it takes the site layout and reads as part of Thoughts.
  const isPostPreview = pathname.startsWith("/admin/preview/");
  const isAdmin = pathname.startsWith("/admin") && !isPostPreview;
  const isHome = pathname === "/";

  // The site was briefly one long page, and its old section routes were
  // permanent redirects to /#projects and the like, which browsers keep. A
  // visitor still carrying one lands here with the hash; send them on to the
  // section's own page.
  useEffect(() => {
    if (!isHome) {
      return;
    }
    const slug = window.location.hash.slice(1);
    const section = sections.find((s) => sectionToSlug(s) === slug);
    if (section && section !== "About") {
      router.replace(sectionHref(section));
    }
  }, [isHome, sections, router]);

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
  // A section is current on its own page and on anything nested under it,
  // which is what keeps Thoughts lit while reading a post.
  const renderLink = (section: Section) => {
    const href = sectionHref(section);
    const isActive = isPostPreview
      ? section === "Thoughts"
      : href === "/"
        ? isHome
        : pathname === href || pathname.startsWith(`${href}/`);
    return (
      <Link
        key={section}
        href={href}
        aria-current={isActive ? "page" : undefined}
        className={`text-left md:text-right text-lg/5 tracking-tight font-songmyung font-bold transition-all whitespace-nowrap hover:text-neutral-900 dark:hover:text-neutral-100 w-fit shrink-0 ${
          isActive
            ? "text-neutral-900 dark:text-neutral-100"
            : "text-neutral-500 dark:text-neutral-400"
        }`}
      >
        {section}
      </Link>
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

  const themeToggle = (
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
  );

  return (
    <main className="flex min-h-screen items-start justify-center px-6 sm:px-10 md:px-16 py-8 md:py-10 tracking-tight">
      {/* Past md the page is a grid: the nav owns column one and runs down the
          full height, while the content sits in column two — under the hero on
          `/`, which is the only page that has one, so the hero is only as wide
          as the text below it. From lg an empty third
          column mirrors the nav's width, which is what lets justify-center land
          the content column on the middle of the page rather than centering the
          nav-plus-content pair. Below lg there is not room for that mirror, so
          the pair centers together the way it always has. */}
      <div className="grid w-full max-w-2xl md:max-w-none grid-cols-1 md:grid-cols-[5rem_minmax(0,545px)] lg:grid-cols-[5rem_minmax(0,545px)_5rem] md:justify-center gap-4 pt-6 md:pt-10">
        {/* Left Sidebar / Top Navigation on Mobile.
            Sticky past md so the section list stays put on long pages like
            Running and the posts; self-start is what lets it stick at all.
            top-20 must equal the nav's resting offset (main's md:py-10 plus
            the grid's md:pt-10) or it slides up before it catches.
            The extra bottom margin below md restores the wider gap the nav
            bar used to have under it, which the grid's single row gap
            would otherwise flatten.
            Below sm the bar reaches past the page's horizontal padding: those
            16px are the margin that keeps the four sections and the toggle on
            one line at full type size down to a ~305px viewport. */}
        <nav className={`flex flex-row md:flex-col flex-nowrap justify-evenly md:justify-start md:gap-x-0 gap-x-1 sm:gap-x-4 gap-y-1 -mx-2 sm:mx-0 items-center md:items-end mb-4 md:mb-0 md:col-start-1 md:row-start-1 ${isHome ? "md:row-span-2" : ""} md:sticky md:top-20 md:self-start`}>
          {sections.map(renderLink)}

          {themeToggle}
        </nav>

        {/* Zion Image, on the landing page only. It follows the nav in source
            order so below md, where the grid is one column, the bar sits on top
            as it does on every other page; past md the explicit column and row
            put it back beside the nav. */}
        {isHome && (
          <div className="w-full md:col-start-2 md:row-start-1">{hero}</div>
        )}

        {/* Content Area */}
        <div className={`w-full md:col-start-2 ${isHome ? "md:row-start-2" : "md:row-start-1"}`}>
          {children}
        </div>

        {/* Mirrors the nav column so the content column, not the pair, is what
            sits centered on the page. */}
        <div aria-hidden className="hidden lg:block lg:col-start-3 lg:row-start-1" />
      </div>
    </main>
  );
}
