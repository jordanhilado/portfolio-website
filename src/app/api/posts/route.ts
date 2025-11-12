import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { slugify } from "@/lib/slugify";

const CreatePostSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(1),
  published: z.boolean().optional().default(true),
  coverImage: z.string().url().optional().or(z.literal("").transform(() => undefined)),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const publishedParam = searchParams.get("published");
    const takeParam = searchParams.get("take");

    const where =
      publishedParam === null
        ? {}
        : { published: publishedParam === "true" ? true : publishedParam === "false" ? false : undefined };

    const take = takeParam ? Math.min(parseInt(takeParam, 10) || 20, 100) : undefined;

    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        published: true,
        coverImage: true,
      },
      take,
    });
    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch posts",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const adminEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
  const email = (session?.user?.email ?? "").toLowerCase().trim();
  if (!email || email !== adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = CreatePostSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { title, content, published, coverImage } = parsed.data;
  let baseSlug = slugify(title);
  if (!baseSlug) {
    return NextResponse.json({ error: "Invalid title" }, { status: 400 });
  }
  // Ensure unique slug
  let slug = baseSlug;
  // Try up to a few variants
  for (let i = 1; i < 50; i++) {
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (!existing) break;
    slug = `${baseSlug}-${i}`;
  }

  const post = await prisma.post.create({
    data: {
      slug,
      title,
      content,
      published: published ?? true,
      coverImage: coverImage || undefined,
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}


