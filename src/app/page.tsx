import HomeClient from "@/components/HomeClient";
import { getSiteContent } from "@/lib/site-content";
import { getRaces } from "@/lib/races";
import { getRunningTotals, getRunsForYear, RUNS_YEAR } from "@/lib/runs";

// Server Component that fetches content at build time and on revalidation.
// Every section renders here — the landing page is one scrollable document and
// the nav is a set of anchors into it — so this route loads all of the content.
export default async function Home() {
  const [content, races, runs, runningTotals] = await Promise.all([
    getSiteContent(),
    getRaces(),
    getRunsForYear(RUNS_YEAR),
    getRunningTotals(),
  ]);

  return (
    <HomeClient
      {...content}
      races={races}
      runs={runs}
      runningTotals={runningTotals}
    />
  );
}

// Backstop only — content writes purge this page on demand via
// revalidateContent(), so this timer just bounds staleness if a write
// path ever fails to invalidate.
export const revalidate = 3600;
