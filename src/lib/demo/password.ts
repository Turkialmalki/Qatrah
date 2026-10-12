import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// Passwords only ever live in memory in demo mode, but they are still hashed
// rather than stored in the clear so nothing leaks through a stack trace or a
// serialized store dump.

const KEY_LEN = 32;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const key = scryptSync(password, salt, KEY_LEN);
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [saltHex, keyHex] = stored.split(":");
  if (!saltHex || !keyHex) return false;

  const key = Buffer.from(keyHex, "hex");
  if (key.length !== KEY_LEN) return false;

  const candidate = scryptSync(password, Buffer.from(saltHex, "hex"), KEY_LEN);
  return timingSafeEqual(key, candidate);
}
