import { NextRequest, NextResponse } from "next/server";
import {
  verifySessionToken,
  SESSION_COOKIE_NAME,
  getLiveAdminCredentials,
  updateEnvCredentials,
  createSessionToken,
} from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = verifySessionToken(sessionCookie);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username } = getLiveAdminCredentials();

    return NextResponse.json({
      success: true,
      username,
    });
  } catch (error) {
    console.error("Error reading admin credentials:", error);
    return NextResponse.json(
      { error: "Failed to read credentials" },
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
    const { newUsername, newPassword, currentPassword } = body;

    if (!currentPassword) {
      return NextResponse.json(
        { error: "Current password is required to update credentials" },
        { status: 400 }
      );
    }

    const currentCreds = getLiveAdminCredentials();
    if (currentPassword.trim() !== currentCreds.password) {
      return NextResponse.json(
        { error: "Incorrect current password" },
        { status: 403 }
      );
    }

    if (newPassword && newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const updated = await updateEnvCredentials(newUsername, newPassword);

    // Refresh session cookie with the new username if changed
    const response = NextResponse.json({
      success: true,
      username: updated.username,
      message: "Admin credentials updated in .env.local successfully!",
    });

    const newToken = createSessionToken(updated.username);
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Failed to update credentials in env:", error);
    return NextResponse.json(
      { error: "Failed to update environment credentials" },
      { status: 500 }
    );
  }
}
