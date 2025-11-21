import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/about - Get about content
export async function GET() {
  try {
    // Get the first (and should be only) about content entry
    const aboutContent = await prisma.aboutContent.findFirst();

    if (!aboutContent) {
      return NextResponse.json(
        { error: "About content not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      paragraphs: JSON.parse(aboutContent.content),
      contactLinks: aboutContent.contactLinks ? JSON.parse(aboutContent.contactLinks) : [],
      updatedAt: aboutContent.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching about content:", error);
    return NextResponse.json(
      { error: "Failed to fetch about content" },
      { status: 500 }
    );
  }
}

// PUT /api/about - Update about content (admin only)
export async function PUT(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    const adminEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
    const email = (session?.user?.email ?? "").toLowerCase().trim();
    
    if (!email || email !== adminEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    const { paragraphs, contactLinks } = body;
    
    if (paragraphs !== undefined && !Array.isArray(paragraphs)) {
      return NextResponse.json(
        { error: "Paragraphs must be an array" },
        { status: 400 }
      );
    }
    
    if (contactLinks !== undefined && !Array.isArray(contactLinks)) {
      return NextResponse.json(
        { error: "ContactLinks must be an array" },
        { status: 400 }
      );
    }
    
    // Get existing content or create new
    let aboutContent = await prisma.aboutContent.findFirst();
    
    const updateData: {
      content?: string;
      contactLinks?: string;
    } = {};
    
    if (paragraphs !== undefined) {
      updateData.content = JSON.stringify(paragraphs);
    }
    
    if (contactLinks !== undefined) {
      updateData.contactLinks = JSON.stringify(contactLinks);
    }
    
    if (aboutContent) {
      // Update existing
      aboutContent = await prisma.aboutContent.update({
        where: { id: aboutContent.id },
        data: updateData,
      });
    } else {
      // Create new with defaults for missing fields
      aboutContent = await prisma.aboutContent.create({
        data: {
          content: updateData.content ?? JSON.stringify([]),
          contactLinks: updateData.contactLinks ?? JSON.stringify([]),
        },
      });
    }
    
    return NextResponse.json({
      paragraphs: JSON.parse(aboutContent.content),
      contactLinks: aboutContent.contactLinks ? JSON.parse(aboutContent.contactLinks) : [],
      updatedAt: aboutContent.updatedAt,
    });
  } catch (error) {
    console.error("Error updating about content:", error);
    return NextResponse.json(
      { error: "Failed to update about content" },
      { status: 500 }
    );
  }
}

