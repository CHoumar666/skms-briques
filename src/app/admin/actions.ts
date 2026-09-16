"use server";

import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE_SECONDS, createSessionToken, verifyAdminCredentials } from "@/lib/auth";
import { clearAttempts, isRateLimited, recordFailedAttempt } from "@/lib/rate-limit";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export async function connexionAdmin(formData: FormData) {
  const username = (formData.get("username") as string) ?? "";
  const password = (formData.get("password") as string) ?? "";
  const from = (formData.get("from") as string) || "/admin/ventes-du-jour";

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

  if (isRateLimited(ip)) {
    redirect(`/admin/connexion?error=limite&from=${encodeURIComponent(from)}`);
  }

  const valid = await verifyAdminCredentials(username, password);
  if (!valid) {
    recordFailedAttempt(ip);
    redirect(`/admin/connexion?error=1&from=${encodeURIComponent(from)}`);
  }

  clearAttempts(ip);
  const token = await createSessionToken(username);
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });

  redirect(from);
}

export async function deconnexionAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  redirect("/admin/connexion");
}
