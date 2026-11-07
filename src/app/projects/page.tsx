import type { Metadata } from "next";
import SectionView from "@/components/SectionView";
import { getProjects } from "@/lib/site-content";
import { pageTitle } from "@/constants/site";

export const metadata: Metadata = { title: pageTitle("projects") };

export default async function ProjectsPage() {
  const projects = await getProjects();

  return <SectionView section="Projects" projects={projects} />;
}

export const revalidate = 3600;
