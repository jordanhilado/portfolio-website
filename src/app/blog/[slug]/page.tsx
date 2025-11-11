import { prisma } from "@/lib/prisma";
import { MarkdownWithTOC } from "@/components/MarkdownWithTOC";
import Link from "next/link";
import Image from "next/image";

export const revalidate = 0;

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
  });

  if (!post || !post.published) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div>Not found</div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-start justify-center px-6 py-10">
      <article className="w-full max-w-3xl">
        <header className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
          <div className="text-xs text-neutral-500">
            Posted {new Date(post.createdAt).toLocaleDateString()} • Last modified{" "}
            {new Date(post.updatedAt).toLocaleDateString()}
          </div>
        </header>
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-auto rounded mb-6"
          />
        )}
        <MarkdownWithTOC content={post.content} />
        <div className="mt-8">
          <Link
            href="/blog"
            className="inline-block px-3 py-1.5 rounded-md border hover:bg-neutral-50 dark:hover:bg-neutral-900"
          >
            ← Back to all posts
          </Link>
        </div>
      </article>
    </main>
  );
}


