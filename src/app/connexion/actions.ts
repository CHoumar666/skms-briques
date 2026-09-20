"use server";

import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, createSessionToken, verifyAdminCredentials } from "@/lib/auth";
import { clearAttempts, isRateLimited, recordFailedAttempt } from "@/lib/rate-limit";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

function safeRedirectTarget(from: string | null): string {
  if (!from || !from.startsWith("/") || from.startsWith("//") || from.startsWith("/connexion")) return "/";
  return from;
}

export async function connexion(formData: FormData) {
  const username = (formData.get("username") as string) ?? "";
  const password = (formData.get("password") as string) ?? "";
  const from = safeRedirectTarget(formData.get("from") as string | null);

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

  if (isRateLimited(ip)) {
    redirect(`/connexion?error=limite&from=${encodeURIComponent(from)}`);
  }

  const valid = await verifyAdminCredentials(username, password);
  if (!valid) {
    recordFailedAttempt(ip);
    redirect(`/connexion?error=1&from=${encodeURIComponent(from)}`);
  }

  clearAttempts(ip);
  const token = await createSessionToken(username);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  redirect(from);
}

export async function deconnexion() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/connexion");
}
