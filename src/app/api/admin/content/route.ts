import { NextRequest, NextResponse } from "next/server";
import { getSiteContent, saveSiteContent, updateSiteContent } from "@/lib/content-store";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = verifySessionToken(sessionCookie);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const content = await getSiteContent(true);
    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error("Failed to fetch site content:", error);
    return NextResponse.json(
      { error: "Failed to retrieve site content" },
      { status: 500 }
    );
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
    const { mode, data } = body;

    let updatedContent;
    if (mode === "full") {
      updatedContent = await saveSiteContent(data);
    } else {
      updatedContent = await updateSiteContent(data);
    }

    return NextResponse.json({
      success: true,
      message: "Changes saved and published live instantly!",
      content: updatedContent,
    });
  } catch (error) {
    console.error("Failed to update site content:", error);
    return NextResponse.json(
      { error: "Failed to save changes" },
      { status: 500 }
    );
  }
}
