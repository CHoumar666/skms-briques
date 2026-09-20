"use server";

import { createClient, createVente } from "@/lib/queries";
import { parseDate, parseNonNegativeInt, parsePositiveInt } from "@/lib/validate";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function ajouterVente(formData: FormData) {
  await requireUser();
  const date = parseDate(formData.get("date"));
  const quantite = parsePositiveInt(formData.get("quantite"));
  const prixUnitaire = parseNonNegativeInt(formData.get("prix_unitaire"));

  if (!date || quantite === null || prixUnitaire === null) {
    redirect("/ventes?erreur=1");
  }

  let clientId = formData.get("client_id") as string;
  const nouveauClient = (formData.get("nouveau_client") as string)?.trim();

  if (!clientId && nouveauClient) {
    const result = createClient(nouveauClient, "", "");
    clientId = String(result.lastInsertRowid);
  }

  const result = createVente({
    date,
    client_id: clientId ? Number(clientId) : null,
    quantite,
    prix_unitaire: prixUnitaire,
    notes: formData.get("notes") as string,
  });

  revalidatePath("/ventes");
  revalidatePath("/tableau-de-bord");
  redirect(`/recus/${result.lastInsertRowid}`);
}
