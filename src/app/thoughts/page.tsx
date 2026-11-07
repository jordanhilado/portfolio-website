import type { Metadata } from "next";
import SectionView from "@/components/SectionView";
import { getPosts } from "@/lib/site-content";
import { pageTitle } from "@/constants/site";

export const metadata: Metadata = { title: pageTitle("thoughts") };

export default async function ThoughtsPage() {
  const posts = await getPosts();

  return <SectionView section="Thoughts" posts={posts} />;
}

export const revalidate = 3600;
