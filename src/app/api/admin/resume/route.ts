import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { defaultResumeData } from "@/lib/default-resume";
import { ResumeData } from "@/types/resume";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const BACKUP_FILE = path.join(process.cwd(), "data", "resume.json");

// Helper to ensure data directory exists
function ensureDataDir() {
  const dir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Read from JSON file
function readResumeFromDisk(): ResumeData | null {
  try {
    if (fs.existsSync(BACKUP_FILE)) {
      const raw = fs.readFileSync(BACKUP_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Could not read resume from disk backup:", err);
  }
  return null;
}

// Save to JSON file
function saveResumeToDisk(data: ResumeData) {
  try {
    ensureDataDir();
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not save resume to disk backup:", err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = verifySessionToken(sessionCookie);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Try to read from MongoDB
    try {
      const db = await getDb();
      if (db) {
        const resumeDoc = await db.collection("resume").findOne<ResumeData>({});
        if (resumeDoc) {
          const { _id, ...cleanDoc } = resumeDoc;
          return NextResponse.json({ success: true, resume: cleanDoc, source: "mongodb" });
        }
      }
    } catch (e) {
      console.warn("MongoDB fetch notice for resume:", e);
    }

    // 2. Try disk backup
    const diskData = readResumeFromDisk();
    if (diskData) {
      return NextResponse.json({ success: true, resume: diskData, source: "disk" });
    }

    // 3. Fallback to default seed data
    return NextResponse.json({ success: true, resume: defaultResumeData, source: "default" });
  } catch (error) {
    console.error("GET /api/admin/resume error:", error);
    return NextResponse.json({ error: "Failed to fetch resume data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = verifySessionToken(sessionCookie);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const resumeData: ResumeData = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    // 1. Save to MongoDB
    let savedToMongo = false;
    try {
      const db = await getDb();
      if (db) {
        await db.collection("resume").updateOne(
          {},
          { $set: { ...resumeData, updatedAt: new Date().toISOString() } },
          { upsert: true }
        );
        savedToMongo = true;
      }
    } catch (e) {
      console.warn("MongoDB save notice for resume:", e);
    }

    // 2. Save to disk backup
    saveResumeToDisk(resumeData);

    return NextResponse.json({
      success: true,
      resume: resumeData,
      savedToMongo,
      message: savedToMongo ? "Saved to database and disk" : "Saved to local cache",
    });
  } catch (error) {
    console.error("POST /api/admin/resume error:", error);
    return NextResponse.json({ error: "Failed to save resume data" }, { status: 500 });
  }
}
