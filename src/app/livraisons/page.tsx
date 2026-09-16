import PageHeader from "@/components/PageHeader";
import { formatDate, formatMontant } from "@/lib/format";
import { listFournisseurs, listLivraisons } from "@/lib/queries";
import LivraisonForm from "./LivraisonForm";

export const dynamic = "force-dynamic";

export default async function LivraisonsPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  const params = await searchParams;
  const livraisons = listLivraisons();
  const fournisseurs = listFournisseurs();
  const totalQuantite = livraisons.reduce((sum, l) => sum + l.quantite, 0);
  const totalMontant = livraisons.reduce((sum, l) => sum + l.quantite * l.prix_unitaire, 0);

  return (
    <div>
      <PageHeader
        title="Livraisons reçues"
        subtitle="Briques reçues des fournisseurs"
      />

      <div className="p-8 space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">Enregistrer une livraison</h2>
          {params.erreur && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              Valeurs invalides : vérifiez la date, la quantité (&gt; 0) et le prix unitaire.
            </p>
          )}
          <LivraisonForm fournisseurs={fournisseurs} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">Historique</h2>
            <p className="text-sm text-slate-500">
              {totalQuantite.toLocaleString("fr-FR")} briques · {formatMontant(totalMontant)}
            </p>
          </div>

          {livraisons.length === 0 ? (
            <p className="px-5 py-8 text-sm text-slate-500 text-center">Aucune livraison enregistrée.</p>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Fournisseur</th>
                  <th className="px-5 py-3 font-medium text-right">Quantité</th>
                  <th className="px-5 py-3 font-medium text-right">Prix unitaire</th>
                  <th className="px-5 py-3 font-medium text-right">Total</th>
                  <th className="px-5 py-3 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {livraisons.map((l) => (
                  <tr key={l.id}>
                    <td className="px-5 py-3 whitespace-nowrap">{formatDate(l.date)}</td>
                    <td className="px-5 py-3">{l.fournisseur_nom ?? "—"}</td>
                    <td className="px-5 py-3 text-right">{l.quantite.toLocaleString("fr-FR")}</td>
                    <td className="px-5 py-3 text-right">{formatMontant(l.prix_unitaire)}</td>
                    <td className="px-5 py-3 text-right font-medium">
                      {formatMontant(l.quantite * l.prix_unitaire)}
                    </td>
                    <td className="px-5 py-3 text-slate-500">{l.notes ?? ""}</td>
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
