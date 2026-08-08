import HomeClient from "@/components/HomeClient";
import { getSiteContent } from "@/lib/site-content";

// Server Component that fetches content at build time and on revalidation
export default async function Home() {
  const content = await getSiteContent();

  return <HomeClient {...content} />;
}

// Backstop only — content writes purge these pages on demand via
// revalidateContent(), so this timer just bounds staleness if a write
// path ever fails to invalidate.
export const revalidate = 3600;
