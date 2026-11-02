import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

// Built once and served from the CDN. GET handlers stopped being static by
// default in Next 15, and the PDF only changes with a deploy.
export const dynamic = "force-static";

export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      "src/assets/resume/Jordan_Ali_Hilado_2026.pdf"
    );
    const file = await readFile(filePath);

    return new NextResponse(file, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="Jordan_Ali_Hilado_2026.pdf"',
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Resume not found" },
      { status: 404 }
    );
  }
}
