import SectionView from "@/components/SectionView";
import { getAbout } from "@/lib/site-content";
import { getRunningTotals } from "@/lib/runs";
import { applyRunningTotals } from "@/lib/running-totals";

// About is the landing page; the other sections each have their own route.
export default async function AboutPage() {
  const [{ aboutParagraphs, contactLinks }, runningTotals] = await Promise.all([
    getAbout(),
    getRunningTotals(),
  ]);

  // The About text takes the same <total_miles> and <total_runs> placeholders
  // as the Running blurb, filled with the same live Strava totals. They come
  // back as markdown links, which the About renderer already turns into
  // accent-colored links.
  const paragraphs = aboutParagraphs.map((paragraph) =>
    applyRunningTotals(paragraph, runningTotals)
  );

  return (
    <SectionView
      section="About"
      aboutParagraphs={paragraphs}
      contactLinks={contactLinks}
    />
  );
}

// Backstop only — content writes purge every section page on demand via
// revalidateContent(), so this timer just bounds staleness if a write
// path ever fails to invalidate. The same applies to each section route.
export const revalidate = 3600;
