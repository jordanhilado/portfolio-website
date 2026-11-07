import type { Metadata } from "next";
import SectionView from "@/components/SectionView";
import { getRunningBlurb } from "@/lib/site-content";
import { getRaces } from "@/lib/races";
import { getAllRuns, getRunningTotals } from "@/lib/runs";
import { pageTitle } from "@/constants/site";

export const metadata: Metadata = { title: pageTitle("running") };

export default async function RunningPage() {
  const [running, races, runs, runningTotals] = await Promise.all([
    getRunningBlurb(),
    getRaces(),
    getAllRuns(),
    getRunningTotals(),
  ]);

  return (
    <SectionView
      section="Running"
      running={running}
      races={races}
      runs={runs}
      runningTotals={runningTotals}
    />
  );
}

export const revalidate = 3600;
