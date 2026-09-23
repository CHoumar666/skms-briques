import { libelleModele } from "@/lib/modeles";
import { requireUser } from "@/lib/session";
import PageHeader from "@/components/PageHeader";
import { formatDate, formatMontant } from "@/lib/format";
import { getStockParModele, listClients, listVentes } from "@/lib/queries";
import VenteForm from "./VenteForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function VentesPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string; modele?: string }>;
}) {
  await requireUser();
  const params = await searchParams;
  const [ventes, clients, stockModeles] = await Promise.all([listVentes(), listClients(), getStockParModele()]);
  const totalQuantite = ventes.reduce((sum, v) => sum + v.quantite, 0);
  const totalMontant = ventes.reduce((sum, v) => sum + v.quantite * v.prix_unitaire, 0);

  return (
    <div>
      <PageHeader title="Ventes & reçus" subtitle="Briques vendues aux clients" />

      <div className="p-8 space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">Enregistrer une vente</h2>
          {params.erreur === "stock" && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              Stock insuffisant pour ce modèle. Stock disponible : {stockModeles.map((m) => `${m.label} : ${m.stock.toLocaleString("fr-FR")}`).join(" · ")}. Enregistre d&apos;abord la livraison correspondante.
            </p>
          )}
          {params.erreur && params.erreur !== "stock" && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              Valeurs invalides : vérifiez la date, le modèle, la quantité (&gt; 0) et le prix unitaire.
            </p>
          )}
          <p className="mb-4 text-sm text-slate-600">
            Stock : {stockModeles.map((m) => `${m.label} : ${m.stock.toLocaleString("fr-FR")}`).join(" · ")}
          </p>
          <VenteForm clients={clients} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">Historique</h2>
            <p className="text-sm text-slate-500">
              {totalQuantite.toLocaleString("fr-FR")} briques · {formatMontant(totalMontant)}
            </p>
          </div>

          {ventes.length === 0 ? (
            <p className="px-5 py-8 text-sm text-slate-500 text-center">Aucune vente enregistrée.</p>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Modèle</th>
                  <th className="px-5 py-3 font-medium text-right">Quantité</th>
                  <th className="px-5 py-3 font-medium text-right">Prix unitaire</th>
                  <th className="px-5 py-3 font-medium text-right">Total</th>
                  <th className="px-5 py-3 font-medium">Paiement</th>
                  <th className="px-5 py-3 font-medium">Saisi par</th>
                  <th className="px-5 py-3 font-medium">Reçu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ventes.map((v) => (
                  <tr key={v.id}>
                    <td className="px-5 py-3 whitespace-nowrap">{formatDate(v.date)}</td>
                    <td className="px-5 py-3">{v.client_nom ?? "—"}</td>
                    <td className="px-5 py-3">{libelleModele(v.modele)}</td>
                    <td className="px-5 py-3 text-right">{v.quantite.toLocaleString("fr-FR")}</td>
                    <td className="px-5 py-3 text-right">{formatMontant(v.prix_unitaire)}</td>
                    <td className="px-5 py-3 text-right font-medium">
                      {formatMontant(v.quantite * v.prix_unitaire)}
                    </td>
                    <td className="px-5 py-3">{v.statut_paiement === "paye" ? "Encaissée" : "À encaisser"}</td>
                    <td className="px-5 py-3 text-slate-500">{v.saisi_par ?? "—"}</td>
                    <td className="px-5 py-3">
                      <Link href={`/recus/${v.id}`} className="text-orange-600 hover:underline">
                        Voir le reçu
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
