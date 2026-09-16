import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { formatDate, formatMontant } from "@/lib/format";
import { getStats, listLivraisons, listVentes } from "@/lib/queries";
import Link from "next/link";

// Données live (ventes, livraisons) : la page ne doit jamais être mise en cache statique.
export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const stats = getStats();
  const dernieresLivraisons = listLivraisons().slice(0, 5);
  const dernieresVentes = listVentes().slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Tableau de bord"
        subtitle="Vue d'ensemble de l'activité de la briqueterie"
      />

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Stock de briques" value={stats.stockBriques.toLocaleString("fr-FR")} />
          <StatCard label="Total revenus (ventes)" value={formatMontant(stats.totalRevenus)} tone="positive" />
          <StatCard label="Total dépenses (achats)" value={formatMontant(stats.totalDepenses)} tone="negative" />
          <StatCard
            label="Solde"
            value={formatMontant(stats.solde)}
            tone={stats.solde >= 0 ? "positive" : "negative"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900">Dernières livraisons reçues</h2>
              <Link href="/livraisons" className="text-sm text-orange-600 hover:underline">
                Voir tout
              </Link>
            </div>
            {dernieresLivraisons.length === 0 ? (
              <p className="px-5 py-8 text-sm text-slate-500 text-center">Aucune livraison enregistrée.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {dernieresLivraisons.map((l) => (
                  <li key={l.id} className="flex items-center justify-between px-5 py-3 text-sm">
                    <div>
                      <p className="font-medium text-slate-900">{l.fournisseur_nom ?? "Fournisseur inconnu"}</p>
                      <p className="text-slate-500">{formatDate(l.date)} · {l.quantite.toLocaleString("fr-FR")} briques</p>
                    </div>
                    <span className="font-medium text-slate-900">{formatMontant(l.quantite * l.prix_unitaire)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900">Dernières ventes</h2>
              <Link href="/ventes" className="text-sm text-orange-600 hover:underline">
                Voir tout
              </Link>
            </div>
            {dernieresVentes.length === 0 ? (
              <p className="px-5 py-8 text-sm text-slate-500 text-center">Aucune vente enregistrée.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {dernieresVentes.map((v) => (
                  <li key={v.id} className="flex items-center justify-between px-5 py-3 text-sm">
                    <div>
                      <p className="font-medium text-slate-900">{v.client_nom ?? "Client inconnu"}</p>
                      <p className="text-slate-500">{formatDate(v.date)} · {v.quantite.toLocaleString("fr-FR")} briques</p>
                    </div>
                    <span className="font-medium text-slate-900">{formatMontant(v.quantite * v.prix_unitaire)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
