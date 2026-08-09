"use client";

import Image from "next/image";

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
  imageUrl: string | null;
  resultsUrl: string | null;
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
 * The races, above the run grid: one horizontal card each, photo on the left.
 *
 * Every string arrives preformatted from @/lib/races — this component holds no
 * state and does no arithmetic. It is a client component only because
 * HomeClient is one.
 *
 * Borders and shadows are deliberately absent: the page has none anywhere, so
 * cards are separated by space, and a linked card borrows the run tiles' hover
 * tint rather than introducing a new affordance.
 */
export default function RaceCards({ races }: { races: RaceCardData[] }) {
  if (races.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 flex flex-col gap-y-4">
      {/* Unlabelled on purpose: the Running section heading covers the whole
          block, and each card already names its race in an aria-label. */}
      <div className="flex flex-col gap-y-2">
        {races.map((race) => (
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
        // Same footprint as the photo so the row does not reflow once the
        // real images land.
        <div
          aria-hidden="true"
          className={`aspect-square shrink-0 bg-neutral-100 dark:bg-neutral-900 ${PHOTO_SIZE_CLASSES}`}
        />
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
          <span className="font-sfmono text-sm tabular-nums text-neutral-900 dark:text-neutral-100">
            {race.time}
            <Slash />
            {race.pace}
            <Slash />
            {race.elevation}
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
