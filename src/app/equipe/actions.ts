"use server";

import { hashPassword } from "@/lib/auth";
import { requireOwner } from "@/lib/session";
import { createUser, getUserByUsername, setUserActif, setUserPassword } from "@/lib/users";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const USERNAME_RE = /^[a-zA-Z0-9._-]{3,30}$/;

export async function creerPersonnel(formData: FormData) {
  await requireOwner();
  const username = ((formData.get("username") as string) ?? "").trim();
  const password = (formData.get("password") as string) ?? "";

  if (!USERNAME_RE.test(username)) redirect("/equipe?erreur=identifiant");
  if (password.length < 10) redirect("/equipe?erreur=motdepasse");
  if (await getUserByUsername(username)) redirect("/equipe?erreur=existe");

  await createUser(username, await hashPassword(password), "personnel");
  revalidatePath("/equipe");
  redirect("/equipe?ok=cree");
}

export async function basculerPersonnel(formData: FormData) {
  await requireOwner();
  const id = Number(formData.get("id"));
  const actif = formData.get("actif") === "1";
  if (Number.isInteger(id)) await setUserActif(id, actif);
  revalidatePath("/equipe");
}

export async function changerMotDePasse(formData: FormData) {
  await requireOwner();
  const id = Number(formData.get("id"));
  const password = (formData.get("password") as string) ?? "";
  if (!Number.isInteger(id) || password.length < 10) redirect("/equipe?erreur=motdepasse");
  await setUserPassword(id, await hashPassword(password));
  revalidatePath("/equipe");
  redirect("/equipe?ok=modifie");
}
