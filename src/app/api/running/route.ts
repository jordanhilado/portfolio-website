import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidateContent } from "@/lib/revalidate";

// GET /api/running - Get running content
export async function GET() {
  try {
    const running = await prisma.runningContent.findFirst();

    return NextResponse.json({
      content: running?.content ?? "",
      updatedAt: running?.updatedAt ?? null,
    });
  } catch (error) {
    console.error("Error fetching running:", error);
    return NextResponse.json(
      { error: "Failed to fetch running" },
      { status: 500 }
    );
  }
}

// PUT /api/running - Update running content (admin only)
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

    let running = await prisma.runningContent.findFirst();

    if (running) {
      running = await prisma.runningContent.update({
        where: { id: running.id },
        data: { content },
      });
    } else {
      running = await prisma.runningContent.create({
        data: { content },
      });
    }

    revalidateContent();

    return NextResponse.json({
      content: running.content,
      updatedAt: running.updatedAt,
    });
  } catch (error) {
    console.error("Error updating running:", error);
    return NextResponse.json(
      { error: "Failed to update running" },
      { status: 500 }
    );
  }
}
