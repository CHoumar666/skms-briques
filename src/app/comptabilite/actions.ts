"use server";

import { createTransaction } from "@/lib/queries";
import { parseDate, parsePositiveInt } from "@/lib/validate";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function ajouterTransaction(formData: FormData) {
  await requireUser();
  const date = parseDate(formData.get("date"));
  const montant = parsePositiveInt(formData.get("montant"));
  const type = formData.get("type");
  const categorie = (formData.get("categorie") as string)?.trim();

  if (!date || montant === null || (type !== "depense" && type !== "revenu") || !categorie) {
    redirect("/comptabilite?erreur=1");
  }

  createTransaction({
    date,
    type,
    categorie,
    montant,
    description: formData.get("description") as string,
  });

  revalidatePath("/comptabilite");
  revalidatePath("/tableau-de-bord");
}
