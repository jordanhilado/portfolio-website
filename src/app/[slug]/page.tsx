import { prisma } from "@/lib/prisma";
import HomeClient from "@/components/HomeClient";

type ListPost = {
  id: string;
  slug: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

// Server Component that fetches data at build time
export default async function SectionPage() {
  let posts: ListPost[] = [];

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
    // Return empty array on error, client will show empty state
  }

  return <HomeClient posts={posts} />;
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
