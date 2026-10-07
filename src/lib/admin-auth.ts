import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "sys_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 8;
function sessionKey() {
  return process.env.ADMIN_SESSION_SECRET || "";
}

function sign(payload: string) {
  return createHmac("sha256", sessionKey()).update(payload).digest("base64url");
}

export function adminCredentialsAreConfigured() {
  return Boolean(
    process.env.ADMIN_USER_ID &&
      process.env.ADMIN_PASSWORD &&
      process.env.ADMIN_PASSWORD.length >= 12 &&
      process.env.ADMIN_SESSION_SECRET,
  );
}

export function userIdsMatch(candidate: unknown) {
  const expectedUserId = process.env.ADMIN_USER_ID;
  if (typeof candidate !== "string" || !expectedUserId) return false;

  const expected = Buffer.from(expectedUserId);
  const received = Buffer.from(candidate);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export function createAdminSession() {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = String(expiresAt);
  return `${payload}.${sign(payload)}`;
}

export function isValidAdminSession(token: string | undefined) {
  if (!token || !sessionKey()) return false;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return false;
  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return false;

  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function isAdminAuthenticated(request?: Request) {
  const authorization = request?.headers.get("authorization");
  if (authorization?.startsWith("Bearer ") && isValidAdminSession(authorization.slice(7))) {
    return true;
  }
  const cookieStore = await cookies();
  return isValidAdminSession(cookieStore.get(ADMIN_COOKIE)?.value);
}

export function passwordsMatch(candidate: unknown) {
  if (typeof candidate !== "string") return false;

  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedPassword || expectedPassword.length < 12) return false;
  const expected = Buffer.from(expectedPassword);
  const received = Buffer.from(candidate);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export const adminCookieOptions = process.env.NODE_ENV === "production"
  ? {
      httpOnly: true,
      sameSite: "none" as const,
      secure: true,
      partitioned: true,
      path: "/",
      maxAge: SESSION_MAX_AGE,
    }
  : {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: false,
      path: "/",
      maxAge: SESSION_MAX_AGE,
    };
