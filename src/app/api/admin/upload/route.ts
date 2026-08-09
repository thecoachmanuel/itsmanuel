import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = verifySessionToken(sessionCookie);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Determine extension
    const extFromName = path.extname(file.name).toLowerCase();
    const validExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".svg",
      ".gif",
      ".ico",
      ".avif",
      ".bmp",
    ];

    const isImageMime =
      !file.type ||
      file.type.startsWith("image/") ||
      file.type === "application/octet-stream" ||
      file.type === "application/xml" ||
      file.type === "text/xml";

    if (!validExtensions.includes(extFromName) && !isImageMime) {
      return NextResponse.json(
        { error: "Please upload a valid image file (PNG, JPG, SVG, WebP, GIF, ICO, AVIF)." },
        { status: 400 }
      );
    }

    // Max 15MB
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds maximum limit of 15MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = extFromName || (file.type === "image/svg+xml" ? ".svg" : ".png");
    const baseName = path
      .basename(file.name, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .toLowerCase();
    const uniqueFileName = `${baseName || "asset"}_${Date.now()}${ext}`;

    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, uniqueFileName);
      await fs.writeFile(filePath, buffer);

      const publicUrl = `/uploads/${uniqueFileName}`;
      return NextResponse.json({
        success: true,
        url: publicUrl,
        fileName: uniqueFileName,
      });
    } catch (fsErr) {
      console.warn("Local disk write failed, falling back to data URL:", fsErr);
      // Fallback to Base64 data URL if filesystem is read-only (e.g. Vercel serverless)
      const mimeType = file.type || (ext === ".svg" ? "image/svg+xml" : "image/png");
      const base64Data = `data:${mimeType};base64,${buffer.toString("base64")}`;

      return NextResponse.json({
        success: true,
        url: base64Data,
        fileName: uniqueFileName,
      });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process image upload" },
      { status: 500 }
    );
  }
}
