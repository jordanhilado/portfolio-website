"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";

type Distance = "FIVE_K" | "HALF_MARATHON" | "MARATHON";

// Shape is re-declared rather than imported from @/lib/races, which pulls in
// prisma — matching how RunGrid re-declares RunTile.
type RaceCardData = {
  id: string;
  name: string;
  date: string;
  time: string;
  pace: string;
  elevation: string;
  placing: string;
  distance: Distance;
  imageUrl: string | null;
  resultsUrl: string | null;
};

/** Printed on the stand-in square of a race that has no photo yet. */
const PLACEHOLDER_MILES: Record<Distance, string> = {
  MARATHON: "26.2",
  HALF_MARATHON: "13.1",
  FIVE_K: "3.1",
};

/**
 * Sizing hint passed to next/image, not a rendered size — the classes below are
 * what size the photo on screen. A run tile is roughly 127px wide in the widest
 * layout, so this covers it on a 2x display.
 */
const PHOTO_SOURCE_SIZE = 256;

/**
 * Makes the photo exactly as wide as one tile in RunGrid, which is a 3-column
 * grid with a 0.75rem gap that picks up a fourth column at `sm`. Percentages
 * resolve against the row's content box, and the row's `-mx-2 p-2` cancel out,
 * so that box is the same width the grid below it spans — the two squares line
 * up and stay lined up as the column resizes.
 */
const PHOTO_SIZE_CLASSES =
  "w-[calc((100%-1.5rem)/3)] sm:w-[calc((100%-2.25rem)/4)]";

/**
 * Tab order, left to right. Marathon leads because it is the tab open on load:
 * the longest distance is what the section is mostly about.
 */
const TABS: { distance: Distance; label: string }[] = [
  { distance: "MARATHON", label: "Marathon" },
  { distance: "HALF_MARATHON", label: "Half Marathon" },
  { distance: "FIVE_K", label: "5K" },
];

/**
 * The races, above the run grid, split into one tab per distance with one
 * horizontal card per race, photo on the left.
 *
 * Every string arrives preformatted from @/lib/races — this component holds no
 * state beyond the selected tab and does no arithmetic. It is a client
 * component because the tabs are local state and because SectionView is one.
 *
 * Borders and shadows are deliberately absent: the page has none anywhere, so
 * cards are separated by space, and a linked card borrows the run tiles' hover
 * tint rather than introducing a new affordance.
 */
export default function RaceCards({ races }: { races: RaceCardData[] }) {
  // A distance with no races gets no tab rather than an empty panel.
  const tabs = TABS.filter((tab) =>
    races.some((race) => race.distance === tab.distance),
  );
  const [selected, setSelected] = useState<Distance>("MARATHON");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const idPrefix = useId();

  if (tabs.length === 0) {
    return null;
  }

  // Falls back to the first tab that exists, so the block never opens on a
  // panel whose tab was filtered out above.
  const active = tabs.some((tab) => tab.distance === selected)
    ? selected
    : tabs[0].distance;
  const activeIndex = tabs.findIndex((tab) => tab.distance === active);
  const visible = races.filter((race) => race.distance === active);
  const tabId = (distance: Distance) => `${idPrefix}-tab-${distance}`;
  const panelId = `${idPrefix}-panel`;

  // The WAI-ARIA tabs pattern: one tab stop for the whole row, arrows move
  // between tabs and select as they go, Home and End jump to either end.
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const last = tabs.length - 1;
    const next =
      event.key === "ArrowRight"
        ? activeIndex === last
          ? 0
          : activeIndex + 1
        : event.key === "ArrowLeft"
          ? activeIndex === 0
            ? last
            : activeIndex - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) {
      return;
    }
    event.preventDefault();
    setSelected(tabs[next].distance);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="mt-8 flex flex-col gap-y-3">
      {/* Styled as a smaller echo of the site nav: the current tab is the
          dark one and the rest sit grey until hovered, so it reads as "where
          you are" with no new chrome. flex-wrap is only a safety net — the
          three labels fit on one line at 320px. The py-1.5 on each tab, pulled
          back by the row's -my-1.5, gives a ~36px touch target without adding
          visible space above the cards. */}
      <div
        role="tablist"
        aria-label="Races by distance"
        className="-my-1.5 flex flex-wrap gap-x-5"
      >
        {tabs.map((tab, index) => {
          const isActive = tab.distance === active;
          return (
            <button
              key={tab.distance}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={tabId(tab.distance)}
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setSelected(tab.distance)}
              onKeyDown={onKeyDown}
              className={`whitespace-nowrap py-1.5 font-songmyung text-base/5 font-bold tracking-tight transition-colors hover:text-neutral-900 dark:hover:text-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 dark:focus-visible:ring-sky-400 ${
                isActive
                  ? "text-neutral-900 dark:text-neutral-100"
                  : "text-neutral-500 dark:text-neutral-400"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={panelId}
        aria-labelledby={tabId(active)}
        className="flex flex-col gap-y-2"
      >
        {visible.map((race) => (
          <RaceRow key={race.id} race={race} />
        ))}
      </div>
    </div>
  );
}

/**
 * Separates the three figures on the stats line.
 *
 * Two shades quieter than the numbers so it reads as punctuation rather than
 * content — the same treatment the morse decoration gets beside the section
 * headings — which also keeps it from being confused with the slash inside
 * "6:44/mi".
 */
function Slash() {
  return (
    <span className="px-1.5 text-neutral-400 dark:text-neutral-600">/</span>
  );
}

function RaceRow({ race }: { race: RaceCardData }) {
  const content = (
    <>
      {race.imageUrl ? (
        <Image
          src={race.imageUrl}
          alt={race.name}
          width={PHOTO_SOURCE_SIZE}
          height={PHOTO_SOURCE_SIZE}
          // Sources are square, but object-cover keeps a stray non-square one
          // from distorting rather than cropping.
          className={`aspect-square h-auto shrink-0 object-cover ${PHOTO_SIZE_CLASSES}`}
        />
      ) : (
        // Same footprint as the photo so the row does not reflow once a real
        // image lands. The distance in miles marks it as a deliberate stand-in
        // rather than an image that failed to load. Hidden from assistive
        // tech: the card's name and tab already say the distance.
        <div
          aria-hidden="true"
          className={`flex aspect-square shrink-0 items-center justify-center bg-neutral-100 dark:bg-neutral-900 ${PHOTO_SIZE_CLASSES}`}
        >
          <span className="font-songmyung text-xl tracking-tight text-neutral-400 sm:text-2xl dark:text-neutral-600">
            {PLACEHOLDER_MILES[race.distance]}
          </span>
        </div>
      )}
      {/* Stretches to the photo's height and pushes its two groups apart, so
          the name sits on the photo's top edge and the placing on its bottom
          one. min-w-0 is what keeps a long name inside the ~545px content
          column rather than overflowing it. */}
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-y-2 self-stretch">
        <div className="flex flex-col gap-y-1">
          {/* Wraps rather than truncates — a clipped race name loses more than
              a second line costs. */}
          <span className="break-words font-songmyung text-lg leading-tight text-sky-600 group-hover:text-sky-700 dark:text-sky-400 dark:group-hover:text-sky-300 transition-colors">
            {race.name}
          </span>
          {/* The three numbers that describe the run itself, on one line in
              the mono face: they line up as a column of figures rather than
              reading as prose. */}
          {/* Each figure is unbreakable but the line between them is not: on
              a phone the text column is ~170-210px, narrower than the three
              figures together, and without a break point the elevation ran
              off the edge of the screen. */}
          <span className="flex flex-wrap font-sfmono text-sm tabular-nums text-neutral-900 dark:text-neutral-100">
            <span className="whitespace-nowrap">
              {race.time}
              <Slash />
            </span>
            <span className="whitespace-nowrap">
              {race.pace}
              <Slash />
            </span>
            <span className="whitespace-nowrap">{race.elevation}</span>
          </span>
        </div>
        {/* Placing and date share the bottom line. flex-wrap is the
            narrow-screen escape hatch: the date keeps its width, so once the
            placing no longer fits beside it the date drops to its own line
            rather than being squeezed. */}
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-xs text-neutral-500 dark:text-neutral-400">
          <span className="min-w-0 break-words">{race.placing}</span>
          <span className="shrink-0 whitespace-nowrap text-neutral-400 dark:text-neutral-600">
            {race.date}
          </span>
        </div>
      </div>
    </>
  );

  // The whole card lights up on hover, linked or not — -mx-2 p-2 is what lets
  // that tint extend past the text without indenting the row relative to
  // everything else in the section. The tint is RunGrid's, so hovering a race
  // and hovering a run tile do the same thing.
  // cursor-pointer is spelled out rather than left to the anchor's default so
  // the hover reads the same on a race whose results link has not been filled
  // in yet.
  const rowClasses =
    "group -mx-2 flex cursor-pointer items-center gap-x-4 p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-900";

  if (!race.resultsUrl) {
    return <div className={rowClasses}>{content}</div>;
  }

  return (
    <a
      href={race.resultsUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${race.name}, ${race.time} — race results`}
      className={`${rowClasses} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 dark:focus-visible:ring-sky-400`}
    >
      {content}
    </a>
  );
}
