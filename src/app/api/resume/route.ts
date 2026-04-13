import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

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
