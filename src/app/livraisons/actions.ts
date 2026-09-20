"use server";

import { createFournisseur, createLivraison } from "@/lib/queries";
import { parseDate, parseNonNegativeInt, parsePositiveInt } from "@/lib/validate";
import { requireSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function ajouterLivraison(formData: FormData) {
  await requireSession();
  const date = parseDate(formData.get("date"));
  const quantite = parsePositiveInt(formData.get("quantite"));
  const prixUnitaire = parseNonNegativeInt(formData.get("prix_unitaire"));

  if (!date || quantite === null || prixUnitaire === null) {
    redirect("/livraisons?erreur=1");
  }

  let fournisseurId = formData.get("fournisseur_id") as string;
  const nouveauFournisseur = (formData.get("nouveau_fournisseur") as string)?.trim();

  if (!fournisseurId && nouveauFournisseur) {
    const result = createFournisseur(nouveauFournisseur, "");
    fournisseurId = String(result.lastInsertRowid);
  }

  createLivraison({
    date,
    fournisseur_id: fournisseurId ? Number(fournisseurId) : null,
    quantite,
    prix_unitaire: prixUnitaire,
    notes: formData.get("notes") as string,
  });

  revalidatePath("/livraisons");
  revalidatePath("/");
}
