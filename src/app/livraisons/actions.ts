"use server";

import { createFournisseur, createLivraison } from "@/lib/queries";
import { parseDate, parseNonNegativeInt, parsePositiveInt } from "@/lib/validate";
import { estModele } from "@/lib/modeles";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function ajouterLivraison(formData: FormData) {
  const user = await requireUser();
  const date = parseDate(formData.get("date"));
  const quantite = parsePositiveInt(formData.get("quantite"));
  const modele = formData.get("modele");
  const statut = formData.get("statut_paiement");
  const statutValide = statut === "paye" || statut === "a_payer" || statut === "sans_paiement";
  const prixSaisi = formData.get("prix_unitaire");
  const prixUnitaire =
    statut === "sans_paiement" && (prixSaisi === null || prixSaisi === "") ? 0 : parseNonNegativeInt(prixSaisi);

  if (!date || quantite === null || prixUnitaire === null || !statutValide || !estModele(modele)) {
    redirect("/livraisons?erreur=1");
  }

  let fournisseurId = formData.get("fournisseur_id") as string;
  const nouveauFournisseur = (formData.get("nouveau_fournisseur") as string)?.trim();

  if (!fournisseurId && nouveauFournisseur) {
    const result = await createFournisseur(nouveauFournisseur, "");
    fournisseurId = String(result.id);
  }

  await createLivraison({
    created_by: user.id,
    statut_paiement: statut,
    modele,
    date,
    fournisseur_id: fournisseurId ? Number(fournisseurId) : null,
    quantite,
    prix_unitaire: prixUnitaire,
    notes: formData.get("notes") as string,
  });

  revalidatePath("/livraisons");
  revalidatePath("/tableau-de-bord");
}
