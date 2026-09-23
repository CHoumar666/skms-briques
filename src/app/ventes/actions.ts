"use server";

import { createClient, createVente, getStockModele } from "@/lib/queries";
import { parseDate, parseNonNegativeInt, parsePositiveInt } from "@/lib/validate";
import { estModele } from "@/lib/modeles";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function ajouterVente(formData: FormData) {
  const user = await requireUser();
  const date = parseDate(formData.get("date"));
  const quantite = parsePositiveInt(formData.get("quantite"));
  const prixUnitaire = parseNonNegativeInt(formData.get("prix_unitaire"));

  const modele = formData.get("modele");
  const statut = formData.get("statut_paiement");

  if (!date || quantite === null || prixUnitaire === null || (statut !== "paye" && statut !== "a_encaisser") || !estModele(modele)) {
    redirect("/ventes?erreur=1");
  }

  if (quantite > (await getStockModele(modele))) {
    redirect(`/ventes?erreur=stock&modele=${modele}`);
  }

  let clientId = formData.get("client_id") as string;
  const nouveauClient = (formData.get("nouveau_client") as string)?.trim();

  if (!clientId && nouveauClient) {
    const result = await createClient(nouveauClient, "", "");
    clientId = String(result.id);
  }

  const result = await createVente({
    created_by: user.id,
    statut_paiement: statut,
    modele,
    date,
    client_id: clientId ? Number(clientId) : null,
    quantite,
    prix_unitaire: prixUnitaire,
    notes: formData.get("notes") as string,
  });

  revalidatePath("/ventes");
  revalidatePath("/tableau-de-bord");
  redirect(`/recus/${result.id}`);
}
