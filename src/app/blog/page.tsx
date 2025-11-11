import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const revalidate = 0;

export default async function BlogIndexPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      coverImage: true,
    },
  });

  return (
    <main className="flex min-h-screen items-start justify-center px-6 py-10">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl font-semibold mb-6">Blog</h1>
        <div className="space-y-6">
          {posts.map((p) => (
            <div key={p.id} className="border rounded-md p-4">
              <Link
                href={`/blog/${p.slug}`}
                className="text-lg font-medium text-purple-600 hover:underline dark:text-purple-400"
              >
                {p.title}
              </Link>
              <div className="text-xs text-neutral-500">
                Posted {new Date(p.createdAt).toLocaleDateString()} • Last updated{" "}
                {new Date(p.updatedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <div className="text-sm text-neutral-500">No posts published yet.</div>
          )}
        </div>
      </div>
    </main>
  );
}


