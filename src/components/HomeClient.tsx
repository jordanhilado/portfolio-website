"use client";

import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import RaceCards from "@/components/RaceCards";
import RunGrid from "@/components/RunGrid";
import {
  RESUME_URL,
  sectionToSlug,
  type DefaultSection,
} from "@/constants/site";
import { formatPostDate } from "@/lib/date";
import { formatReadingTime } from "@/lib/reading-time";
import { parseMarkdownLink } from "@/lib/markdown-links";
import {
  applyRunningTotals,
  type RunningTotals,
} from "@/lib/running-totals";

type Section = DefaultSection;

type ListPost = {
  id: string;
  slug: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  readMinutes: number;
};

type Project = {
  id: string;
  title: string;
  description: string;
  link: string;
  order: number;
  year: number;
};

type RunTile = {
  id: string;
  stravaId: string;
  pathD: string;
  miles: string;
  date: string;
  dateShort: string;
  dateCompact: string;
};

type RaceCardData = {
  id: string;
  name: string;
  date: string;
  time: string;
  pace: string;
  elevation: string;
  placing: string;
  imageUrl: string | null;
  resultsUrl: string | null;
};

// Sits opposite each section heading as a quiet second rendering of the same
// word. Spelled out rather than generated from a letter table because it is
// decoration for three fixed labels, not a translator.
const SECTION_MORSE: Partial<Record<Section, string>> = {
  Projects: ".--. .-. --- .--- . -.-. - ...",
  Thoughts: "- .... --- ..- --. .... - ...",
  Running: ".-. ..- -. -. .. -. --.",
};

/**
 * Photographs that sit behind a section heading, keyed by section.
 *
 * Lives in the same Supabase bucket as the race photos, which is the host
 * next.config.js already allows through next/image — a photo anywhere else
 * would need that list widened first.
 */
const SECTION_HEADER_IMAGE: Partial<Record<Section, string>> = {
  Projects:
    "https://snxrkwpgkkydsbizqsaz.supabase.co/storage/v1/object/public/race-photos/tahoe-1.JPG",
  Thoughts:
    "https://snxrkwpgkkydsbizqsaz.supabase.co/storage/v1/object/public/race-photos/graffiti.jpg",
  Running:
    "https://snxrkwpgkkydsbizqsaz.supabase.co/storage/v1/object/public/race-photos/water.jpg",
};

/**
 * Sizing hint for the header photo: the content column tops out at 545px, and
 * below md it is the full viewport minus the page's horizontal padding.
 */
const HEADER_IMAGE_SIZES = "(min-width: 768px) 545px, 100vw";

function ThoughtsListClient({ posts }: { posts: ListPost[] }) {
  return (
    // gap-y-1 rather than gap-y-5, same as Projects: each entry carries its own
    // p-2, so the space between two of them still adds up to 20px.
    <div className="flex flex-col gap-y-1">
      {posts.map((p) => (
        // Title and date are one target that lights up together, matching the
        // project entries above.
        <Link
          key={p.id}
          href={`/thoughts/${p.slug}`}
          className="group -mx-2 flex cursor-pointer flex-col gap-y-1.5 p-2 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 dark:hover:bg-neutral-900 dark:focus-visible:ring-sky-400"
        >
          <div className="font-songmyung text-lg font-normal leading-tight text-sky-600 transition-colors group-hover:text-sky-700 dark:text-sky-400 dark:group-hover:text-sky-300">
            {p.title}
          </div>
          {/* Same shape as a project entry: the reading time reads as the
              entry's body, the date is pinned bottom-right in the quieter
              tone the project year uses. */}
          <div className="flex items-end justify-between gap-x-4">
            <div className="text-sm leading-snug text-neutral-500 dark:text-neutral-400">
              {formatReadingTime(p.readMinutes)}
            </div>
            <div className="shrink-0 text-xs leading-snug tabular-nums text-neutral-400 dark:text-neutral-600">
              {formatPostDate(p.createdAt)}
            </div>
          </div>
        </Link>
      ))}
      {posts.length === 0 && (
        <div className="text-neutral-500 dark:text-neutral-400">...</div>
      )}
    </div>
  );
}

/**
 * Anchor treatment for the Running blurb.
 *
 * Its links — the two mileage totals, plus anything the markdown itself
 * carries — all point off-site, so they open in a new tab the way the run
 * tiles and race cards below them do. The accent colour comes from the
 * wrapper's `prose-a`; this only adds the hover and focus states, which
 * typography styles do not supply.
 *
 * The underline typography puts on every link is deferred to hover: the two
 * mileage totals sit mid-sentence, and a permanent rule under them reads as
 * emphasis on the numbers rather than as the quiet accent the rest of the
 * page uses.
 */
function RunningLink({
  href,
  children,
}: {
  href?: string;
  children?: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-sm no-underline transition-colors hover:underline hover:text-sky-700 dark:hover:text-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 dark:focus-visible:ring-sky-400"
    >
      {children}
    </a>
  );
}

interface HomeClientProps {
  posts: ListPost[];
  projects?: Project[];
  aboutParagraphs: string[];
  contactLinks?: string[];
  running?: string;
  races?: RaceCardData[];
  runs?: RunTile[];
  /** Null when Strava could not be reached for this render. */
  runningTotals?: RunningTotals | null;
  sections: Section[];
}

export default function HomeClient({
  posts,
  projects,
  aboutParagraphs,
  contactLinks = [],
  running = "",
  races = [],
  runs = [],
  runningTotals = null,
  sections,
}: HomeClientProps) {
  const renderContent = (section: Section) => {
    switch (section) {
      case "About":
        return aboutParagraphs.length === 0 && contactLinks.length === 0 ? (
          <div className="text-neutral-500 dark:text-neutral-400">...</div>
        ) : (
          <div className="flex flex-col gap-y-3">
            {aboutParagraphs.map((paragraph, index) => {
              const parsed = parseMarkdownLink(paragraph);
              return (
                <p key={index} className="text-pretty">
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
                          // Inline in a paragraph, so it matches the body font
                          // rather than the display face used for standalone
                          // links elsewhere on the page. The underline arrives
                          // on hover only, as it does on the Running totals.
                          className="font-sfpro text-sky-600 hover:underline hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
                        >
                          {part.text}
                        </Link>
                      );
                    }
                  })}
                </p>
              );
            })}
            {(contactLinks.length > 0 || true) && (
              <p>
                <a
                  href={RESUME_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg text-sky-600 hover:underline hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 font-songmyung"
                >
                  Resume
                </a>
                {contactLinks.length > 0 && " / "}
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
                              className="text-lg text-sky-600 hover:underline hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 font-songmyung"
                            >
                              {part.text}
                            </Link>
                          );
                        }
                      })}
                      {!isLast && " / "}
                    </Fragment>
                  );
                })}
              </p>
            )}
          </div>
        );

      case "Projects":
        return (
          // gap-y-1 rather than the gap-y-5 the other lists use: each entry now
          // carries its own p-2, so the space between two of them adds up to
          // the same 20px it always was.
          <div className="flex flex-col gap-y-1">
            {projects && projects.length > 0 ? (
              projects.map((project) => (
                // The whole entry is the link and the whole entry lights up,
                // matching a race card in RaceCards — description included,
                // rather than the title alone being clickable.
                <Link
                  key={project.id}
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group -mx-2 flex cursor-pointer flex-col gap-y-1.5 p-2 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 dark:hover:bg-neutral-900 dark:focus-visible:ring-sky-400"
                >
                  <div className="font-songmyung text-lg font-normal leading-tight text-sky-600 group-hover:text-sky-700 dark:text-sky-400 dark:group-hover:text-sky-300 transition-colors">
                    {project.title}
                  </div>
                  {/* items-end pins the year to the bottom-right corner of the
                      entry no matter how many lines the description wraps to. */}
                  <div className="flex items-end justify-between gap-x-4">
                    <div className="text-pretty leading-snug text-neutral-500 dark:text-neutral-400">
                      {project.description}
                    </div>
                    <div className="shrink-0 text-xs leading-snug tabular-nums text-neutral-400 dark:text-neutral-600">
                      {project.year}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-neutral-500 dark:text-neutral-400">...</div>
            )}
          </div>
        );

      case "Thoughts":
        return <ThoughtsListClient posts={posts} />;

      case "Running":
        // Wrapped rather than fragmented so the section's gap-y does not stack
        // on top of RunGrid's own top margin.
        return (
          <div>
            <div className="prose dark:prose-invert prose-base max-w-none prose-p:text-neutral-500 dark:prose-p:text-neutral-400 prose-p:leading-5 prose-a:text-sky-600 dark:prose-a:text-sky-400">
              {/* The stored blurb carries the lifetime mileage as placeholders;
                  they become accent-coloured links to Strava here, so the
                  numbers are never edited by hand. */}
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{ a: RunningLink }}
              >
                {running ? applyRunningTotals(running, runningTotals) : "..."}
              </ReactMarkdown>
            </div>
            {/* Both blocks sit outside the prose wrapper on purpose: typography
                styles would restyle their anchors, images and svg margins. */}
            <RaceCards races={races} />
            <RunGrid runs={runs} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-y-14 pb-0 md:pb-20 text-base/5 text-neutral-500 dark:text-neutral-400">
      {sections.map((section, index) => {
        const slug = sectionToSlug(section);
        // The first section opens the page directly under the hero, so a
        // heading there would only restate what the reader is already looking
        // at. Every section below it needs one to break up the scroll.
        const showHeading = index > 0;
        // Only ever a backdrop for a heading, so a section that renders without
        // one gets no band either.
        const headerImage = showHeading ? SECTION_HEADER_IMAGE[section] : undefined;

        // Over a photograph the heading pair switches to white — the neutral
        // greys it uses on the page background would sink into the water — and
        // the pair centers itself on the band's height while staying on the
        // left edge the rest of the column shares.
        const heading = showHeading ? (
          <h2
            id={`${slug}-heading`}
            // items-center, not items-baseline: the morse is set smaller than
            // the label, and sharing a baseline would hang it off the bottom of
            // the line rather than sitting it in the middle.
            className={`flex w-fit flex-wrap items-center gap-x-3 font-songmyung text-lg/5 font-bold tracking-tight ${
              headerImage
                ? "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.55)]"
                : "text-neutral-900 dark:text-neutral-100"
            }`}
          >
            <span>{section}</span>
            {/* Hidden from assistive tech: it would otherwise land in the
                section's accessible name as a run of dots and dashes. */}
            {SECTION_MORSE[section] && (
              <span
                aria-hidden
                // Set well below the label: at the heading's own size the
                // longest of these runs — Projects' and Thoughts' — outgrow a
                // phone's content column and drop onto a second line, and
                // decoration is not worth a line break. leading-none keeps the
                // shrunken text from carrying a taller line box than its
                // glyphs, which is what lets items-center land it on the middle
                // of the label rather than a few pixels below.
                //
                // Off the photograph the color steps a shade past the body grey
                // so it reads as texture; over one it takes the heading's own
                // white, since a dimmer grey would be the first thing the water
                // swallows. Either way the heading's tight tracking is undone
                // so the dots and dashes do not clump into single glyphs.
                className={`text-xs leading-none tracking-[0.15em] ${
                  headerImage ? "" : "text-neutral-400 dark:text-neutral-600"
                }`}
              >
                {SECTION_MORSE[section]}
              </span>
            )}
          </h2>
        ) : null;

        return (
          <section
            key={section}
            id={slug}
            aria-label={showHeading ? undefined : section}
            aria-labelledby={showHeading ? `${slug}-heading` : undefined}
            // scroll-margin keeps a jumped-to heading clear of the viewport
            // edge, and sits above the line LayoutWrapper's scroll spy
            // activates on so the nav highlight agrees with where the click
            // landed.
            className="flex scroll-mt-6 flex-col gap-y-4 md:scroll-mt-10"
          >
            {/* Repeats the nav label on purpose: on one long page the nav only
                says where you are, the heading says what you are reading. */}
            {headerImage ? (
              // The heading pair sits on the photograph rather than beside it.
              // No height of its own: the band is the heading's line box plus
              // its padding, and `fill` + object-cover crop the photo down to
              // whatever that comes to — so the image is a band behind a
              // heading rather than a banner the heading is placed on. The
              // padding is what centers the pair vertically, while the heading
              // keeps the left edge the rest of the column shares.
              //
              // A scrim that fades out to the right keeps the text legible over
              // whatever the crop happens to land on without flattening the
              // rest of the frame. `isolate` bounds the negative z-indexes to
              // this band so they cannot slip behind the page itself.
              <div className="relative isolate flex w-full items-center overflow-hidden px-4 py-4">
                <Image
                  src={headerImage}
                  alt=""
                  aria-hidden
                  fill
                  sizes={HEADER_IMAGE_SIZES}
                  className="-z-10 object-cover"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 -z-10 bg-gradient-to-r from-black/55 via-black/30 to-black/10"
                />
                {heading}
              </div>
            ) : (
              heading
            )}
            {renderContent(section)}
          </section>
        );
      })}
    </div>
  );
}
