import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  try {
    const post = await prisma.post.findUnique({
      where: { slug: params.slug },
    });
    if (!post || !post.published) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error fetching post by slug:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch post",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}


