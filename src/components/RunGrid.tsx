"use client";

import { useState, useSyncExternalStore } from "react";

// Shape is re-declared rather than imported from @/lib/runs, which pulls in
// prisma — matching how HomeClient re-declares ListPost and Project.
type RunTile = {
  id: string;
  stravaId: string;
  pathD: string;
  miles: string;
  date: string;
  dateShort: string;
};

/** One page of tiles: 4 columns by 4 rows past `sm`. */
const RUNS_PER_PAGE_WIDE = 16;

/**
 * Narrow phones drop to 3 columns, and a full 16 tiles there would run five and
 * a third rows tall — enough to push the arrows off screen. A square 3×3 page
 * keeps the block roughly as tall as the wide one.
 */
const RUNS_PER_PAGE_NARROW = 9;

/** Matches Tailwind's `sm`, where the grid picks up its fourth column. */
const WIDE_QUERY = "(min-width: 640px)";

function subscribeToWidth(onChange: () => void) {
  const query = window.matchMedia(WIDE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * Page size has to be read in JS because paging is state, not CSS — a media
 * query can hide the extra tiles but cannot renumber the pages.
 *
 * useSyncExternalStore rather than an effect so the server snapshot (the wide
 * page, matching what the markup is built for) is what hydration compares
 * against, and the narrow value lands in the same commit instead of a frame
 * later as a visible reflow.
 */
function useRunsPerPage() {
  const isWide = useSyncExternalStore(
    subscribeToWidth,
    () => window.matchMedia(WIDE_QUERY).matches,
    () => true,
  );
  return isWide ? RUNS_PER_PAGE_WIDE : RUNS_PER_PAGE_NARROW;
}

/**
 * A wall of square tiles, one per run, each showing the route's GPS trace.
 *
 * Column counts are tuned to the actual content width, which is narrower than
 * the max-w-2xl wrapper suggests: past `md` the nav column and its gap-x-16
 * leave roughly 530px, so there is nothing for an md:/lg: variant to do.
 *
 * Every run for the year is already in the payload — the page renders as one
 * document — so paging is local state rather than a fetch or a route param.
 */
export default function RunGrid({ runs }: { runs: RunTile[] }) {
  const [page, setPage] = useState(0);
  const runsPerPage = useRunsPerPage();

  if (runs.length === 0) {
    return null;
  }

  const pageCount = Math.ceil(runs.length / runsPerPage);
  // Clamped in case a shorter `runs` array arrives after a revalidation, or the
  // window narrows into the smaller page size, while the reader is on a page
  // that no longer exists.
  const currentPage = Math.min(page, pageCount - 1);
  const start = currentPage * runsPerPage;
  const visible = runs.slice(start, start + runsPerPage);

  return (
    <div className="mt-8 flex flex-col gap-y-4">
      {/* Unlabelled on purpose, as the race cards above are: the Running
          section heading covers the whole block, and every tile already names
          its distance and date in an aria-label. */}
      <div className="grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-4">
        {visible.map((run) => (
          <a
            key={run.id}
            href={`https://www.strava.com/activities/${run.stravaId}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${run.miles} mile run on ${run.date} — open on Strava`}
            className="group flex flex-col gap-y-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 dark:focus-visible:ring-sky-400"
          >
            <div className="aspect-square w-full bg-transparent group-hover:bg-neutral-100 dark:group-hover:bg-neutral-900 transition-colors">
              <svg
                viewBox="0 0 100 100"
                aria-hidden="true"
                focusable="false"
                className="h-full w-full text-sky-600 group-hover:text-sky-700 dark:text-sky-400 dark:group-hover:text-sky-300 transition-colors"
              >
                {/* non-scaling-stroke keeps every route a 1.5px hairline
                    regardless of tile size, so the grid reads as one system. */}
                <path
                  d={run.pathD}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
            <div className="flex items-baseline justify-between gap-x-1.5 leading-tight">
              <span className="text-xs text-neutral-900 dark:text-neutral-100">
                {run.miles} mi
              </span>
              {/* Year omitted so distance and date fit one line on narrow
                  phones; the full date is in the aria-label above. */}
              <span className="whitespace-nowrap text-xs text-neutral-400 dark:text-neutral-600">
                {run.dateShort}
              </span>
            </div>
          </a>
        ))}
        {/* A short last page would pull the arrows up the screen, so the grid
            always occupies a full page's worth of slots. The caption row
            mirrors a tile's exactly rather than approximating it: `text-xs`
            carries its own paired line-height, so a stand-in built from
            different classes lands a pixel off and rows of pure placeholders
            stack that error into a visible shift. */}
        {Array.from({ length: runsPerPage - visible.length }, (_, index) => (
          <div
            key={`placeholder-${index}`}
            aria-hidden="true"
            className="flex flex-col gap-y-1.5"
          >
            <div className="aspect-square w-full" />
            <div className="flex items-baseline justify-between gap-x-1.5 leading-tight">
              <span className="text-xs">&nbsp;</span>
            </div>
          </div>
        ))}
      </div>

      {pageCount > 1 && (
        <nav
          aria-label="Run pages"
          className="flex items-center justify-between text-xs"
        >
          <PageButton
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage === 0}
            label="Previous page of runs"
          >
            ← Newer
          </PageButton>
          {/* aria-live so keyboard and screen-reader users hear where the
              arrows landed them; the tiles themselves give no such cue. */}
          <span
            aria-live="polite"
            className="text-neutral-500 dark:text-neutral-400"
          >
            {currentPage + 1} / {pageCount}
          </span>
          <PageButton
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage === pageCount - 1}
            label="Next page of runs"
          >
            Older →
          </PageButton>
        </nav>
      )}
    </div>
  );
}

function PageButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="rounded-sm text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 disabled:cursor-default disabled:text-neutral-400 disabled:hover:text-neutral-400 dark:disabled:text-neutral-600 dark:disabled:hover:text-neutral-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 dark:focus-visible:ring-sky-400"
    >
      {children}
    </button>
  );
}
