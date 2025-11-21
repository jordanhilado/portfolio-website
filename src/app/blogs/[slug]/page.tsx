import { prisma } from "@/lib/prisma";
import { MarkdownWithTOC } from "@/components/MarkdownWithTOC";
import { BlogPostClient } from "@/components/BlogPostClient";
import { notFound } from "next/navigation";
import { formatBlogDate } from "@/lib/date";

type Post = {
  id: string;
  slug: string;
  title: string;
  content: string;
  published: boolean;
  coverImage: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Generate static params for all blog posts at build time
export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true },
  });

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Fetch post data at build time
async function getPost(slug: string): Promise<Post | null> {
  try {
    const post = await prisma.post.findUnique({
      where: { slug },
    });

    if (!post || !post.published) {
      return null;
    }

    return post;
  } catch (error) {
    console.error("Failed to load post:", error);
    return null;
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  // Calculate reading time (assuming average reading speed of 200 words per minute)
  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime;
  };

  const readingTime = calculateReadingTime(post.content);

  const formattedDate = formatBlogDate(post.createdAt);

  return (
    <BlogPostClient
      post={{
        ...post,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      }}
      readingTime={readingTime}
      formattedDate={formattedDate}
    />
  );
}

// Enable ISR (Incremental Static Regeneration) - revalidate every 60 seconds
export const revalidate = 60;
