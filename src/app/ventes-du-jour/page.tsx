import { libelleModele } from "@/lib/modeles";
import { requireOwner } from "@/lib/session";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { formatDate, formatMontant, todayISO } from "@/lib/format";
import { listVentesParDate } from "@/lib/queries";

// Dépend de la date du jour et des ventes live : jamais de mise en cache statique.
export const dynamic = "force-dynamic";

export default async function VentesDuJourPage() {
  await requireOwner();
  const today = todayISO();
  const ventes = await listVentesParDate(today);
  const totalQuantite = ventes.reduce((sum, v) => sum + v.quantite, 0);
  const totalMontant = ventes.reduce((sum, v) => sum + v.quantite * v.prix_unitaire, 0);
  const totalEncaisse = ventes.filter((v) => v.statut_paiement === "paye").reduce((sum, v) => sum + v.quantite * v.prix_unitaire, 0);

  return (
    <div>
      <PageHeader
        title="Ventes du jour"
        subtitle={`Ventes enregistrées le ${formatDate(today)}`}
      />

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Nombre de ventes" value={String(ventes.length)} />
          <StatCard label="Briques vendues" value={totalQuantite.toLocaleString("fr-FR")} />
          <StatCard label="Total vendu" value={formatMontant(totalMontant)} />
          <StatCard label="Total encaissé" value={formatMontant(totalEncaisse)} tone="positive" />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">Détail des ventes du jour</h2>
          </div>

          {ventes.length === 0 ? (
            <p className="px-5 py-8 text-sm text-slate-500 text-center">
              Aucune vente enregistrée aujourd&apos;hui.
            </p>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Modèle</th>
                  <th className="px-5 py-3 font-medium text-right">Quantité</th>
                  <th className="px-5 py-3 font-medium text-right">Prix unitaire</th>
                  <th className="px-5 py-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ventes.map((v) => (
                  <tr key={v.id}>
                    <td className="px-5 py-3">{v.client_nom ?? "Client au comptant"}</td>
                    <td className="px-5 py-3">{libelleModele(v.modele)}</td>
                    <td className="px-5 py-3 text-right">{v.quantite.toLocaleString("fr-FR")}</td>
                    <td className="px-5 py-3 text-right">{formatMontant(v.prix_unitaire)}</td>
                    <td className="px-5 py-3 text-right font-medium">
                      {formatMontant(v.quantite * v.prix_unitaire)}
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
