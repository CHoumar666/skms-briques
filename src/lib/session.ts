import "server-only";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import type { User } from "@/lib/db";
import { getUserById } from "@/lib/users";
import { withTimeout } from "@/lib/with-timeout";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const payload = await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!payload) return null;
  const user = await withTimeout(getUserById(payload.userId));
  return user && user.actif ? user : null;
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  return user;
}

export async function requireOwner(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "proprietaire") redirect("/");
  return user;
}
