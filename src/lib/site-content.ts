import { prisma } from "@/lib/prisma";
import { DEFAULT_SECTIONS, type DefaultSection } from "@/constants/site";
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

export type SiteContent = {
  posts: ListPost[];
  projects: Project[];
  aboutParagraphs: string[];
  contactLinks: string[];
  running: string;
  sections: DefaultSection[];
};

/**
 * Loads every piece of content the landing page renders.
 *
 * Both `/` and `/[slug]` render the same HomeClient with identical props —
 * the active section is derived client-side from the pathname — so they
 * share this loader rather than keeping two copies of it in sync.
 *
 * Each section is fetched independently and failures are swallowed so that
 * one unavailable table degrades a single section instead of the whole page.
 */
export async function getSiteContent(): Promise<SiteContent> {
  const content: SiteContent = {
    posts: [],
    projects: [],
    aboutParagraphs: [],
    contactLinks: [],
    running: "",
    sections: [...DEFAULT_SECTIONS],
  };

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
    content.posts = fetchedPosts.map(({ content: body, ...post }) => ({
      ...post,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      readMinutes: readingTimeMinutes(body),
    }));
  } catch (error) {
    console.error("Failed to load posts:", error);
  }

  try {
    content.projects = await prisma.project.findMany({
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
  }

  try {
    const aboutContent = await prisma.aboutContent.findFirst();
    if (aboutContent) {
      content.aboutParagraphs = JSON.parse(aboutContent.content);
      if (aboutContent.contactLinks) {
        content.contactLinks = JSON.parse(aboutContent.contactLinks);
      }
    }
  } catch (error) {
    console.error("Failed to load about content:", error);
  }

  try {
    const runningContent = await prisma.runningContent.findFirst();
    if (runningContent && runningContent.content) {
      content.running = runningContent.content;
    }
  } catch (error) {
    console.error("Failed to load running:", error);
  }

  return content;
}
