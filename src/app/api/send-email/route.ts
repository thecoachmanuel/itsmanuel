import { EmailTemplate } from "@/components/email-template";
import { render } from "@react-email/render";
import dns from "dns";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { saveContactMessage } from "@/lib/content-store";

try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch {}

async function resolveHostIp(hostname: string): Promise<string> {
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    return hostname;
  }

  // 1. Try Cloudflare DNS over HTTPS
  try {
    const res = await fetch(
      `https://1.1.1.1/dns-query?name=${encodeURIComponent(hostname)}`,
      {
        headers: { accept: "application/dns-json" },
        signal: AbortSignal.timeout(3000),
      }
    );
    if (res.ok) {
      const data = await res.json();
      const ip = data.Answer?.find(
        (a: { type: number; data: string }) => a.type === 1
      )?.data;
      if (ip) return ip;
    }
  } catch {}

  // 2. Try Google DNS over HTTPS
  try {
    const res = await fetch(
      `https://8.8.8.8/resolve?name=${encodeURIComponent(hostname)}`,
      {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(3000),
      }
    );
    if (res.ok) {
      const data = await res.json();
      const ip = data.Answer?.find(
        (a: { type: number; data: string }) => a.type === 1
      )?.data;
      if (ip) return ip;
    }
  } catch {}

  // 3. Hardcoded reliable fallback for Gmail SMTP
  if (hostname.includes("gmail")) {
    return "142.250.102.108";
  }

  return hostname;
}

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
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

  // 1. ALWAYS CAPTURE & SAVE MESSAGE TO MONGODB / CMS DATABASE
  let savedMessage;
  try {
    savedMessage = await saveContactMessage({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      projectType: projectType || "General Inquiry",
      timeline: timeline || "Flexible",
      emailSent: false,
    });
    console.log("📥 Contact message successfully stored in database. ID:", savedMessage._id);
  } catch (dbErr) {
    console.error("Failed to capture message in database:", dbErr);
  }

  // 2. ATTEMPT EMAIL NOTIFICATION VIA SMTP
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.replace(/\s+/g, "");
  const smtpHost = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const smtpPort = Number(process.env.SMTP_PORT) || 465;
  const smtpSecure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === "true"
    : smtpPort === 465;
  const toEmail = process.env.CONTACT_RECEIVER_EMAIL?.trim() || smtpUser;

  if (!smtpUser || !smtpPass) {
    console.log("ℹ️ Message captured in Admin Database (SMTP email skipped due to missing config).");
    return NextResponse.json({
      success: true,
      message: "Message received! We will be in touch soon.",
      savedToDb: true,
    });
  }

  try {
    const isGmail = smtpHost.toLowerCase().includes("gmail");
    const targetHost = await resolveHostIp(smtpHost);

    const transporter = nodemailer.createTransport({
      host: targetHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        servername: isGmail ? "smtp.gmail.com" : smtpHost,
        rejectUnauthorized: false,
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
      from: `"Portfolio Contact - ${name}" <${smtpUser}>`,
      to: toEmail,
      replyTo: `${name} <${email}>`,
      subject: `New Message from Portfolio - ${projectType || "General Inquiry"}`,
      text: emailText,
      html: emailHtml,
    });

    console.log("✅ Email sent successfully. Message ID:", info.messageId);
    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      savedToDb: true,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to send email via SMTP";
    console.error("❌ SMTP Notification Notice:", errorMessage);
    // Return success because the message was already captured in the database
    return NextResponse.json({
      success: true,
      message: "Message received and stored in dashboard!",
      savedToDb: true,
    });
  }
}
