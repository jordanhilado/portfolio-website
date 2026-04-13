import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/hobbies - Get hobbies content
export async function GET() {
  try {
    const hobbies = await prisma.hobbiesContent.findFirst();

    return NextResponse.json({
      content: hobbies?.content ?? "",
      updatedAt: hobbies?.updatedAt ?? null,
    });
  } catch (error) {
    console.error("Error fetching hobbies:", error);
    return NextResponse.json(
      { error: "Failed to fetch hobbies" },
      { status: 500 }
    );
  }
}

// PUT /api/hobbies - Update hobbies content (admin only)
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

    let hobbies = await prisma.hobbiesContent.findFirst();

    if (hobbies) {
      hobbies = await prisma.hobbiesContent.update({
        where: { id: hobbies.id },
        data: { content },
      });
    } else {
      hobbies = await prisma.hobbiesContent.create({
        data: { content },
      });
    }

    return NextResponse.json({
      content: hobbies.content,
      updatedAt: hobbies.updatedAt,
    });
  } catch (error) {
    console.error("Error updating hobbies:", error);
    return NextResponse.json(
      { error: "Failed to update hobbies" },
      { status: 500 }
    );
  }
}
