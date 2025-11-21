import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type ReorderPayload = {
  orderedIds: string[];
};

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const adminEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
    const email = (session?.user?.email ?? "").toLowerCase().trim();

    if (!email || email !== adminEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as ReorderPayload;
    const { orderedIds } = body ?? {};

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json(
        { error: "orderedIds must be a non-empty array" },
        { status: 400 }
      );
    }

    const updates = orderedIds.map((id, index) =>
      prisma.project.update({
        where: { id },
        data: { order: index },
      })
    );

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering projects:", error);
    return NextResponse.json(
      { error: "Failed to reorder projects" },
      { status: 500 }
    );
  }
}


