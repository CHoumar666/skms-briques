import "server-only";
import sql from "./db";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export async function isRateLimited(cle: string): Promise<boolean> {
  const [entry] = await sql<{ nombre: number; expire_a: string }[]>`
    SELECT nombre, expire_a FROM login_attempts WHERE cle = ${cle}
  `;
  if (!entry || new Date(entry.expire_a).getTime() < Date.now()) return false;
  return entry.nombre >= MAX_ATTEMPTS;
}

export async function recordFailedAttempt(cle: string): Promise<void> {
  const expireA = new Date(Date.now() + WINDOW_MS);
  await sql`
    INSERT INTO login_attempts (cle, nombre, expire_a)
    VALUES (${cle}, 1, ${expireA})
    ON CONFLICT (cle) DO UPDATE SET
      nombre = CASE WHEN login_attempts.expire_a < now() THEN 1 ELSE login_attempts.nombre + 1 END,
      expire_a = CASE WHEN login_attempts.expire_a < now() THEN ${expireA} ELSE login_attempts.expire_a END
  `;
}

export async function clearAttempts(cle: string): Promise<void> {
  await sql`DELETE FROM login_attempts WHERE cle = ${cle}`;
}
