import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
type AdminListPost = {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export default async function AdminDashboard() {
  // Extra server-side check (middleware already protects)
  const session = await getServerSession(authOptions);
  const adminEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
  const email = (session?.user?.email ?? "").toLowerCase().trim();
  if (!email || email !== adminEmail) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Unauthorized</p>
      </main>
    );
  }

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      published: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return (
    <main className="flex min-h-screen px-6 sm:px-10 md:px-16 py-10 justify-center">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Admin • Posts</h1>
          <Link
            href="/admin/new"
            className="px-3 py-1.5 rounded-md bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
          >
            New Post
          </Link>
        </div>
        <div className="space-y-4">
          {posts.map((post: AdminListPost) => (
            <div key={post.id} className="border rounded-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{post.title}</div>
                  <div className="text-xs text-neutral-500">
                    {post.published ? "Published" : "Draft"} • Created{" "}
                    {new Date(post.createdAt).toLocaleDateString()} • Updated{" "}
                    {new Date(post.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/edit/${post.id}`}
                    className="px-2 py-1 rounded border"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/blogs/${post.slug}`}
                    className="px-2 py-1 rounded border"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <div className="text-sm text-neutral-500">No posts yet.</div>
          )}
        </div>
      </div>
    </main>
  );
}
