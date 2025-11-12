import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { slugify } from "@/lib/slugify";

const UpdatePostSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  content: z.string().min(1).optional(),
  published: z.boolean().optional(),
  coverImage: z.string().url().optional().or(z.literal("").transform(() => null)),
});

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
    });
    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error fetching post by id:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch post",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const adminEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
    const email = (session?.user?.email ?? "").toLowerCase().trim();
    if (!email || email !== adminEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const parsed = UpdatePostSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const current = await prisma.post.findUnique({ where: { id: params.id } });
    if (!current) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    let slug = current.slug;
    if (parsed.data.title && parsed.data.title !== current.title) {
      const baseSlug = slugify(parsed.data.title);
      let nextSlug = baseSlug;
      for (let i = 1; i < 50; i++) {
        const existing = await prisma.post.findUnique({ where: { slug: nextSlug } });
        if (!existing || existing.id === current.id) break;
        nextSlug = `${baseSlug}-${i}`;
      }
      slug = nextSlug;
    }

    const updated = await prisma.post.update({
      where: { id: params.id },
      data: {
        ...parsed.data,
        slug,
      },
    });

    return NextResponse.json({ post: updated });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { 
        error: "Failed to update post",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const adminEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
    const email = (session?.user?.email ?? "").toLowerCase().trim();
    if (!email || email !== adminEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.post.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { 
        error: "Failed to delete post",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}


