import type { Metadata } from "next";
import SectionView from "@/components/SectionView";
import { getTaste } from "@/lib/site-content";
import { SITE_NAME } from "@/constants/site";

export const metadata: Metadata = { title: `Taste · ${SITE_NAME}` };

export default async function TastePage() {
  const taste = await getTaste();
  return <SectionView section="Taste" taste={taste} />;
}

export const revalidate = 3600;
