import { NextRequest, NextResponse } from "next/server";
import {
  getContactMessages,
  deleteContactMessage,
  markContactMessageRead,
  getUnreadMessagesCount,
} from "@/lib/content-store";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = verifySessionToken(sessionCookie);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messages = await getContactMessages();
    const unreadCount = await getUnreadMessagesCount();

    return NextResponse.json({
      success: true,
      messages,
      unreadCount,
    });
  } catch (error) {
    console.error("Failed to retrieve contact messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch contact messages" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = verifySessionToken(sessionCookie);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
    }

    const deleted = await deleteContactMessage(id);

    return NextResponse.json({
      success: true,
      deleted,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete contact message:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = verifySessionToken(sessionCookie);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, read } = body;

    if (!id) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
    }

    await markContactMessageRead(id, read !== undefined ? read : true);

    return NextResponse.json({
      success: true,
      message: "Message status updated",
    });
  } catch (error) {
    console.error("Failed to update message status:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}
