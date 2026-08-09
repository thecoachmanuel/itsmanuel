import crypto from "crypto";

const SESSION_COOKIE_NAME = "admin_session";
const DEFAULT_SECRET = "manuel-admin-jwt-secret-key-2026-secure";

function getSecretKey(): string {
  return process.env.ADMIN_SESSION_SECRET || DEFAULT_SECRET;
}

export interface AdminSession {
  username: string;
  role: string;
  exp: number;
}

// Generate an HMAC SHA-256 signed token
export function createSessionToken(username: string): string {
  const payload: AdminSession = {
    username,
    role: "admin",
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSecretKey())
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

// Verify and decode HMAC SHA-256 signed token
export function verifySessionToken(token?: string | null): AdminSession | null {
  if (!token) return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [encodedPayload, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", getSecretKey())
      .update(encodedPayload)
      .digest("base64url");

    // Timing safe comparison to prevent timing attacks
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload: AdminSession = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf-8")
    );

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

// Validate credentials against environment variables
export function validateAdminCredentials(username: string, password: string): boolean {
  const configuredUsername = (process.env.ADMIN_USERNAME || "admin").trim();
  const configuredPassword = (process.env.ADMIN_PASSWORD || "admin123").trim();

  return username.trim() === configuredUsername && password.trim() === configuredPassword;
}

export { SESSION_COOKIE_NAME };
