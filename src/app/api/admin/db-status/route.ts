import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = verifySessionToken(sessionCookie);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const startTime = Date.now();
    const db = await getDb();

    if (!db) {
      return NextResponse.json({
        connected: false,
        status: "disconnected",
        message: "MONGODB_URI not configured or server unreachable. Using resilient local cache.",
        databaseName: null,
        latencyMs: 0,
      });
    }

    // Ping the database
    await db.command({ ping: 1 });
    const latencyMs = Date.now() - startTime;

    const docCount = await db.collection("site_content").countDocuments();

    return NextResponse.json({
      connected: true,
      status: "connected",
      message: "MongoDB connected successfully",
      databaseName: db.databaseName,
      documentCount: docCount,
      latencyMs,
    });
  } catch (error) {
    return NextResponse.json({
      connected: false,
      status: "error",
      message: error instanceof Error ? error.message : "Database connection failed",
      latencyMs: 0,
    });
  }
}
