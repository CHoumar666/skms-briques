import { getLedger } from "@/lib/queries";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

function cellule(valeur: string | number | null): string {
  let texte = String(valeur ?? "");
  if (/^[=+\-@\t\r]/.test(texte)) texte = "'" + texte;
  return `"${texte.replace(/"/g, '""')}"`;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return new Response("Non autorisé", { status: 401 });

  const ledger = await getLedger();
  const lignes = ledger.map((l) =>
    [l.date, l.type === "revenu" ? "Revenu" : "Dépense", l.categorie, l.description, l.saisi_par, ({ paye: "Payé", a_payer: "À payer", a_encaisser: "À encaisser", sans_paiement: "Sans paiement" })[l.statut], l.compteEnCaisse ? (l.type === "revenu" ? l.montant : -l.montant) : 0, l.montant]
      .map(cellule)
      .join(";")
  );
  const csv = "﻿" + ["Date;Type;Catégorie;Description;Saisi par;Paiement;Mouvement de caisse (FCFA);Montant de l'opération (FCFA)", ...lignes].join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="journal-comptable-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
