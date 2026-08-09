import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidateContent } from "@/lib/revalidate";
import { INVALID_YEAR, parseProjectYear } from "@/lib/projects";

// PUT /api/projects/[id] - Update a project (admin only)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    const adminEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
    const email = (session?.user?.email ?? "").toLowerCase().trim();
    
    if (!email || email !== adminEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    const { title, description, link, order, year } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (link !== undefined) updateData.link = link;
    if (order !== undefined) updateData.order = order;
    // Omitting `year` leaves it as it was; sending one replaces it. There is no
    // way to clear it — the column is required.
    if (year !== undefined) {
      const parsedYear = parseProjectYear(year);
      if (parsedYear === INVALID_YEAR) {
        return NextResponse.json(
          { error: "Year must be a four-digit year" },
          { status: 400 }
        );
      }
      updateData.year = parsedYear;
    }

    const project = await prisma.project.update({
      where: { id: params.id },
      data: updateData,
    });
    
    revalidateContent();

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete a project (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    const adminEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
    const email = (session?.user?.email ?? "").toLowerCase().trim();
    
    if (!email || email !== adminEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    await prisma.project.delete({
      where: { id: params.id },
    });
    
    revalidateContent();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}

