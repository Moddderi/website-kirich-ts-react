import crypto from "node:crypto";

/**
 * Passwordless login for the client cabinet: a 6-digit code from e-mail, then a
 * signed session token. Everything is stateless (HMAC) → no extra DB tables or
 * Notion calls. Set AUTH_SECRET on the server; without it a key derived from
 * other server secrets is used.
 */
let fallbackSecret: string | null = null;
const secret = (): string => {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  const parts = [
    process.env.DATABASE_URL,
    process.env.NOTION_TOKEN,
    process.env.RESEND_API_KEY,
  ].filter(Boolean);
  if (parts.length > 0) {
    return crypto.createHash("sha256").update(parts.join("|")).digest("hex");
  }
  fallbackSecret ??= crypto.randomBytes(32).toString("hex");
  return fallbackSecret;
};

const hmac = (data: string): Buffer =>
  crypto.createHmac("sha256", secret()).update(data).digest();

const safeEqual = (a: string, b: string): boolean => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

/* ---------------------------- one-time code ---------------------------- */

const CODE_WINDOW_MS = 10 * 60 * 1000;

const codeForWindow = (email: string, window: number): string => {
  const value = hmac(`otp|${email}|${window}`).readUInt32BE(0) % 1_000_000;
  return String(value).padStart(6, "0");
};

/** Valid for the current 10-minute window and the previous one (10–20 minutes). */
export const createLoginCode = (email: string): string =>
  codeForWindow(email, Math.floor(Date.now() / CODE_WINDOW_MS));

export const verifyLoginCode = (email: string, code: string): boolean => {
  const now = Math.floor(Date.now() / CODE_WINDOW_MS);
  const clean = code.replace(/\s+/g, "");
  return [now, now - 1].some((w) => safeEqual(codeForWindow(email, w), clean));
};

/* ------------------------------- session ------------------------------- */

export const SESSION_DAYS = 90;

export const createSessionToken = (email: string): string => {
  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ e: email, x: exp })).toString("base64url");
  return `${payload}.${hmac(`sess|${payload}`).toString("base64url")}`;
};

/** Returns the e-mail of a valid, non-expired session token, otherwise null. */
export const verifySessionToken = (token: string | undefined): string | null => {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  if (!safeEqual(hmac(`sess|${payload}`).toString("base64url"), sig)) return null;
  try {
    const { e, x } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof e === "string" && typeof x === "number" && x > Date.now() ? e : null;
  } catch {
    return null;
  }
};
