import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminDashboardClient from "@/components/AdminDashboardClient";

type AdminListPost = {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type Project = {
  id: string;
  title: string;
  description: string;
  link: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

type AboutContent = {
  id: string;
  content: string;
  contactLinks?: string | null;
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

  // Fetch posts
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

  // Fetch projects
  let projects: Project[] = [];
  try {
    projects = await prisma.project.findMany({
      orderBy: { order: "asc" },
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
  }

  // Fetch about content
  let aboutContent: AboutContent | null = null;
  try {
    aboutContent = await prisma.aboutContent.findFirst();
  } catch (error) {
    console.error("Error fetching about content:", error);
  }

  // Convert dates to strings for client component
  const postsData = posts.map((post) => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  }));

  const projectsData = projects.map((project) => ({
    ...project,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  }));

  const aboutData = aboutContent
    ? {
        ...aboutContent,
        updatedAt: aboutContent.updatedAt.toISOString(),
        paragraphs: JSON.parse(aboutContent.content),
        contactLinks: aboutContent.contactLinks ? JSON.parse(aboutContent.contactLinks) : [],
      }
    : null;

  return (
    <AdminDashboardClient
      posts={postsData}
      projects={projectsData}
      aboutContent={aboutData}
    />
  );
}
