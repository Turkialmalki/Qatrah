import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Session cookie for demo mode: `<userId>.<hmac>`.
 *
 * Signed so a visitor cannot sign in as someone else by editing the cookie.
 * The secret falls back to a constant when unset, which is fine here because
 * the accounts and their passwords are published — set DEMO_SESSION_SECRET if
 * you ever put non-demo data behind it.
 */
export const SESSION_COOKIE = "qatrah_session";

const SECRET = process.env.DEMO_SESSION_SECRET ?? "qatrah-demo-session-secret";
const MAX_AGE = 60 * 60 * 24 * 7; // one week

function signature(userId: string): string {
  return createHmac("sha256", SECRET).update(userId).digest("hex");
}

export function signSession(userId: string): string {
  return `${userId}.${signature(userId)}`;
}

/** Returns the user id when the token is intact, otherwise null. */
export function readSession(token: string | undefined): string | null {
  if (!token) return null;

  const separator = token.lastIndexOf(".");
  if (separator <= 0) return null;

  const userId = token.slice(0, separator);
  const provided = Buffer.from(token.slice(separator + 1), "hex");
  const expected = Buffer.from(signature(userId), "hex");

  if (provided.length !== expected.length) return null;
  return timingSafeEqual(provided, expected) ? userId : null;
}

export async function currentUserId(): Promise<string | null> {
  const store = await cookies();
  return readSession(store.get(SESSION_COOKIE)?.value);
}

export async function startSession(userId: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, signSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
