import HomeClient from "@/components/HomeClient";
import { getSiteContent } from "@/lib/site-content";
import { DEFAULT_SECTIONS, sectionToSlug } from "@/constants/site";

// Server Component that fetches content at build time and on revalidation
export default async function SectionPage() {
  const content = await getSiteContent();

  return <HomeClient {...content} />;
}

// Generate static params for all sections
export async function generateStaticParams() {
  return DEFAULT_SECTIONS.map((section) => ({
    slug: sectionToSlug(section),
  }));
}

// Backstop only — content writes purge these pages on demand via
// revalidateContent(), so this timer just bounds staleness if a write
// path ever fails to invalidate.
export const revalidate = 3600;
