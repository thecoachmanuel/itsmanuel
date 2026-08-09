import { EmailTemplate } from "@/components/email-template";
import { render } from "@react-email/render";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid JSON request body" },
      { status: 400 }
    );
  }

  const { name, email, message, projectType, timeline, honeypot } = body || {};

  // Honeypot check (bots will fill this hidden field)
  if (honeypot) {
    return NextResponse.json(
      { error: "Spam detected" },
      { status: 400 }
    );
  }

  // Validate required fields
  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Validate input lengths to prevent resource exhaustion/DoS attacks
  if (
    name.length > 100 ||
    email.length > 250 ||
    message.length > 5000 ||
    (projectType && projectType.length > 100) ||
    (timeline && timeline.length > 100)
  ) {
    return NextResponse.json(
      { error: "Input text exceeds maximum allowed limit" },
      { status: 400 }
    );
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: "Invalid email format" },
      { status: 400 }
    );
  }

  // Validate message length
  if (message.trim().length < 30) {
    return NextResponse.json(
      { error: "Message should be at least 30 characters long" },
      { status: 400 }
    );
  }

  // Block disposable email providers
  const blockList = ["tempmail", "mailinator", "10minutemail", "guerrillamail"];
  const domain = email.split("@")[1];
  if (domain && blockList.some((blocked) => domain.includes(blocked))) {
    return NextResponse.json(
      { error: "Temporary email addresses are not allowed" },
      { status: 403 }
    );
  }

  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.replace(/\s+/g, "");
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.SMTP_PORT) || 465;
  const smtpSecure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === "true"
    : smtpPort === 465;
  const toEmail = process.env.CONTACT_RECEIVER_EMAIL?.trim() || smtpUser;

  if (!smtpUser || !smtpPass) {
    return NextResponse.json(
      {
        error:
          "SMTP is not configured. Please set SMTP_USER and SMTP_PASS in your environment variables.",
      },
      { status: 500 }
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const emailHtml = await render(
      EmailTemplate({ name, email, message, projectType, timeline })
    );
    const emailText = await render(
      EmailTemplate({ name, email, message, projectType, timeline }),
      { plainText: true }
    );

    const info = await transporter.sendMail({
      from: `"Portfolio Contact" <${smtpUser}>`,
      to: toEmail,
      replyTo: `${name} <${email}>`,
      subject: `New Message from Portfolio - ${projectType || "General Inquiry"}`,
      text: emailText,
      html: emailHtml,
    });

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to send email via SMTP";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
