import { prisma } from "@/lib/prisma";
import HomeClient from "@/components/HomeClient";
import { DEFAULT_HOBBIES, DEFAULT_SECTIONS } from "@/constants/site";

type ListPost = {
  id: string;
  slug: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

type Project = {
  id: string;
  title: string;
  description: string;
  link: string;
  order: number;
};

// Server Component that fetches data at build time
export default async function SectionPage() {
  let posts: ListPost[] = [];
  let projects: Project[] = [];
  let aboutParagraphs: string[] = [];
  let contactLinks: string[] = [];
  const hobbies = DEFAULT_HOBBIES;
  const sections = [...DEFAULT_SECTIONS];

  try {
    const fetchedPosts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Convert dates to strings for client component
    posts = fetchedPosts.map((post) => ({
      ...post,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to load posts:", error);
  }

  try {
    // Fetch projects
    const fetchedProjects = await prisma.project.findMany({
      orderBy: { order: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        link: true,
        order: true,
      },
    });
    projects = fetchedProjects;
  } catch (error) {
    console.error("Failed to load projects:", error);
  }

  try {
    // Fetch about content
    const aboutContent = await prisma.aboutContent.findFirst();
    if (aboutContent) {
      aboutParagraphs = JSON.parse(aboutContent.content);
      if (aboutContent.contactLinks) {
        contactLinks = JSON.parse(aboutContent.contactLinks);
      }
    }
  } catch (error) {
    console.error("Failed to load about content:", error);
  }

  return (
    <HomeClient
      posts={posts}
      projects={projects}
      aboutParagraphs={aboutParagraphs}
      contactLinks={contactLinks}
      hobbies={hobbies}
      sections={sections as ("About" | "Projects" | "Blogs" | "Hobbies")[]}
    />
  );
}

// Generate static params for all sections
export async function generateStaticParams() {
  return [
    { slug: "about" },
    { slug: "projects" },
    { slug: "blogs" },
    { slug: "hobbies" },
  ];
}

// Enable ISR (Incremental Static Regeneration) - revalidate every 60 seconds
export const revalidate = 60;
