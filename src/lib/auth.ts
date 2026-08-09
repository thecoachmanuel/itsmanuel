import crypto from "crypto";
import fs from "fs";
import path from "path";

const SESSION_COOKIE_NAME = "admin_session";
const DEFAULT_SECRET = "manuel-admin-jwt-secret-key-2026-secure";

function cleanEnvValue(val?: string): string {
  if (!val) return "";
  let clean = val.trim();
  if (
    (clean.startsWith('"') && clean.endsWith('"')) ||
    (clean.startsWith("'") && clean.endsWith("'"))
  ) {
    clean = clean.slice(1, -1).trim();
  }
  return clean;
}

/**
 * Dynamically retrieves current admin credentials from .env.local, .env, or process.env.
 * Reading disk directly guarantees that any manual edits to .env.local take effect
 * immediately without requiring a server restart.
 */
export function getLiveAdminCredentials(): {
  username: string;
  password: string;
  sessionSecret: string;
} {
  let fileUsername = "";
  let filePassword = "";
  let fileSecret = "";

  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    try {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf-8");
        const lines = content.split(/\r?\n/);
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;
          const eqIdx = trimmed.indexOf("=");
          if (eqIdx > 0) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = cleanEnvValue(trimmed.slice(eqIdx + 1));

            if (key === "ADMIN_USERNAME" && val && !fileUsername) {
              fileUsername = val;
            }
            if (key === "ADMIN_PASSWORD" && val && !filePassword) {
              filePassword = val;
            }
            if (key === "ADMIN_SESSION_SECRET" && val && !fileSecret) {
              fileSecret = val;
            }
          }
        }
      }
    } catch {
      // Ignore file reading errors and fallback to process.env
    }
  }

  const username =
    fileUsername ||
    cleanEnvValue(process.env.ADMIN_USERNAME) ||
    "admin";

  const password =
    filePassword ||
    cleanEnvValue(process.env.ADMIN_PASSWORD) ||
    "admin123";

  const sessionSecret =
    fileSecret ||
    cleanEnvValue(process.env.ADMIN_SESSION_SECRET) ||
    DEFAULT_SECRET;

  return { username, password, sessionSecret };
}

function getSecretKey(): string {
  const { sessionSecret } = getLiveAdminCredentials();
  return sessionSecret;
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

// Validate credentials against current environment variables
export function validateAdminCredentials(username: string, password: string): boolean {
  const credentials = getLiveAdminCredentials();
  const inputUser = username.trim();
  const inputPass = password.trim();

  return inputUser === credentials.username && inputPass === credentials.password;
}

/**
 * Updates ADMIN_USERNAME and/or ADMIN_PASSWORD in .env.local file.
 */
export async function updateEnvCredentials(newUsername?: string, newPassword?: string): Promise<{ success: boolean; username: string }> {
  const envPath = path.join(process.cwd(), ".env.local");
  let content = "";

  try {
    if (fs.existsSync(envPath)) {
      content = await fs.promises.readFile(envPath, "utf-8");
    }
  } catch {
    content = "";
  }

  const currentCreds = getLiveAdminCredentials();
  const targetUsername = newUsername ? newUsername.trim() : currentCreds.username;
  const targetPassword = newPassword ? newPassword.trim() : currentCreds.password;

  let hasUsername = false;
  let hasPassword = false;

  const lines = content.split(/\r?\n/);
  const updatedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("ADMIN_USERNAME=")) {
      hasUsername = true;
      return `ADMIN_USERNAME=${targetUsername}`;
    }
    if (trimmed.startsWith("ADMIN_PASSWORD=")) {
      hasPassword = true;
      return `ADMIN_PASSWORD=${targetPassword}`;
    }
    return line;
  });

  if (!hasUsername) {
    updatedLines.push(`ADMIN_USERNAME=${targetUsername}`);
  }
  if (!hasPassword) {
    updatedLines.push(`ADMIN_PASSWORD=${targetPassword}`);
  }

  await fs.promises.writeFile(envPath, updatedLines.join("\n"), "utf-8");

  // Also update process.env in current process
  process.env.ADMIN_USERNAME = targetUsername;
  process.env.ADMIN_PASSWORD = targetPassword;

  return { success: true, username: targetUsername };
}

export { SESSION_COOKIE_NAME };
