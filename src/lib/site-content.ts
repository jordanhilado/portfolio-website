import { prisma } from "@/lib/prisma";
import { readingTimeMinutes } from "@/lib/reading-time";

export type ListPost = {
  id: string;
  slug: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  /** Estimated whole minutes to read, derived from the post body. */
  readMinutes: number;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  link: string;
  order: number;
  year: number;
};

/**
 * One loader per section, since each section is now its own route and loads
 * only what it renders.
 *
 * Failures are logged and swallowed: an unavailable table renders that page's
 * empty state rather than an error page.
 */
export async function getPosts(): Promise<ListPost[]> {
  try {
    const fetchedPosts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Convert dates to strings for client component. `content` is read here to
    // size the post and then dropped — the list shows the estimate, and
    // shipping every post body to the client to recompute it would dwarf the
    // rest of the page payload.
    return fetchedPosts.map(({ content: body, ...post }) => ({
      ...post,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      readMinutes: readingTimeMinutes(body),
    }));
  } catch (error) {
    console.error("Failed to load posts:", error);
    return [];
  }
}

export async function getProjects(): Promise<Project[]> {
  try {
    return await prisma.project.findMany({
      orderBy: { order: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        link: true,
        order: true,
        year: true,
      },
    });
  } catch (error) {
    console.error("Failed to load projects:", error);
    return [];
  }
}

export async function getAbout(): Promise<{
  aboutParagraphs: string[];
  contactLinks: string[];
}> {
  try {
    const aboutContent = await prisma.aboutContent.findFirst();
    if (aboutContent) {
      return {
        aboutParagraphs: JSON.parse(aboutContent.content),
        contactLinks: aboutContent.contactLinks
          ? JSON.parse(aboutContent.contactLinks)
          : [],
      };
    }
  } catch (error) {
    console.error("Failed to load about content:", error);
  }
  return { aboutParagraphs: [], contactLinks: [] };
}

export async function getRunningBlurb(): Promise<string> {
  try {
    const runningContent = await prisma.runningContent.findFirst();
    return runningContent?.content ?? "";
  } catch (error) {
    console.error("Failed to load running:", error);
    return "";
  }
}

export async function getTaste(): Promise<string> {
  try {
    const taste = await prisma.tasteContent.findFirst();
    return taste?.content ?? "";
  } catch (error) {
    console.error("Failed to load taste:", error);
    return "";
  }
}
