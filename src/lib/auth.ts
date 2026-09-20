export const SESSION_COOKIE = "session";
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;
export const SESSION_MAX_AGE_SECONDS = SESSION_DURATION_MS / 1000;

export type SessionPayload = { userId: number; role: "proprietaire" | "personnel" };

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  return bytes;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

async function hmac(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return toHex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data)));
}

async function derivePasswordHash(password: string, saltHex: string, iterations = 100_000): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: fromHex(saltHex) as BufferSource, iterations, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return toHex(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const saltHex = toHex(salt.buffer);
  return `${saltHex}:${await derivePasswordHash(password, saltHex)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash || !password) return false;
  return timingSafeEqual(await derivePasswordHash(password, salt), hash);
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET n'est pas défini dans l'environnement");
  return secret;
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const body = `${payload.userId}.${payload.role}.${Date.now() + SESSION_DURATION_MS}`;
  return `${body}.${await hmac(body, getSecret())}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 4) return null;

  const [userIdStr, role, expiryStr, signature] = parts;
  const expiry = Number(expiryStr);
  const userId = Number(userIdStr);
  if (!Number.isInteger(userId) || !Number.isFinite(expiry) || Date.now() > expiry) return null;
  if (role !== "proprietaire" && role !== "personnel") return null;

  const expected = await hmac(`${userIdStr}.${role}.${expiryStr}`, getSecret());
  return timingSafeEqual(signature, expected) ? { userId, role } : null;
}
