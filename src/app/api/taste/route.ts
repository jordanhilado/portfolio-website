import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidateContent } from "@/lib/revalidate";

// GET /api/taste - Get taste content
export async function GET() {
  try {
    const taste = await prisma.tasteContent.findFirst();

    return NextResponse.json({
      content: taste?.content ?? "",
      updatedAt: taste?.updatedAt ?? null,
    });
  } catch (error) {
    console.error("Error fetching taste:", error);
    return NextResponse.json(
      { error: "Failed to fetch taste" },
      { status: 500 }
    );
  }
}

// PUT /api/taste - Update taste content (admin only)
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const adminEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
    const email = (session?.user?.email ?? "").toLowerCase().trim();

    if (!email || email !== adminEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    if (typeof content !== "string") {
      return NextResponse.json(
        { error: "Content must be a string" },
        { status: 400 }
      );
    }

    let taste = await prisma.tasteContent.findFirst();

    if (taste) {
      taste = await prisma.tasteContent.update({
        where: { id: taste.id },
        data: { content },
      });
    } else {
      taste = await prisma.tasteContent.create({
        data: { content },
      });
    }

    revalidateContent();

    return NextResponse.json({
      content: taste.content,
      updatedAt: taste.updatedAt,
    });
  } catch (error) {
    console.error("Error updating taste:", error);
    return NextResponse.json(
      { error: "Failed to update taste" },
      { status: 500 }
    );
  }
}
