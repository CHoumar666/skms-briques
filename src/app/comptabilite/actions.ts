"use server";

import { createTransaction, supprimerOperation, type SourceOperation } from "@/lib/queries";
import { parseDate, parsePositiveInt } from "@/lib/validate";
import { requireOwner, requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function ajouterTransaction(formData: FormData) {
  const user = await requireUser();
  const date = parseDate(formData.get("date"));
  const montant = parsePositiveInt(formData.get("montant"));
  const type = formData.get("type");
  const categorie = (formData.get("categorie") as string)?.trim();

  if (!date || montant === null || (type !== "depense" && type !== "revenu") || !categorie) {
    redirect("/comptabilite?erreur=1");
  }

  createTransaction({
    created_by: user.id,
    date,
    type,
    categorie,
    montant,
    description: formData.get("description") as string,
  });

  revalidatePath("/comptabilite");
  revalidatePath("/tableau-de-bord");
}

export async function supprimerLigne(formData: FormData) {
  const user = await requireOwner();
  const source = formData.get("source");
  const id = Number(formData.get("id"));
  if ((source === "livraison" || source === "vente" || source === "transaction") && Number.isInteger(id)) {
    supprimerOperation(source as SourceOperation, id, user.id);
  }
  revalidatePath("/comptabilite");
  revalidatePath("/tableau-de-bord");
}
