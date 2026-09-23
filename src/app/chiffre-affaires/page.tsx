import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { formatMoisLabel, formatMontant, moisActuel } from "@/lib/format";
import { getRapportMensuel } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ChiffreAffairesPage({
  searchParams,
}: {
  searchParams: Promise<{ mois?: string }>;
}) {
  await requireUser();
  const params = await searchParams;
  const mois = /^\d{4}-\d{2}$/.test(params.mois ?? "") ? (params.mois as string) : moisActuel();
  const rapport = await getRapportMensuel(mois);

  return (
    <div>
      <PageHeader
        title="Chiffre d'affaires"
        subtitle={`Résumé de ${formatMoisLabel(mois)}`}
        action={
          <form className="flex items-center gap-2">
            <label htmlFor="mois" className="sr-only">Mois</label>
            <input
              id="mois"
              type="month"
              name="mois"
              defaultValue={mois}
              max={moisActuel()}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors"
            >
              Voir
            </button>
          </form>
        }
      />

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Revenus du mois" value={formatMontant(rapport.argentEncaisse)} tone="positive" />
          <StatCard label="Dépenses du mois" value={formatMontant(rapport.argentSorti)} tone="negative" />
          <StatCard label="Solde du mois" value={formatMontant(rapport.solde)} tone={rapport.solde >= 0 ? "positive" : "negative"} />
        </div>
        <p className="text-sm text-slate-600">
          Ne compte que l&apos;argent réellement encaissé ou payé ce mois-ci — pas les ventes ou
          livraisons encore en attente de paiement.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="px-5 py-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900">Dépenses par catégorie</h2>
            </div>
            {rapport.depensesParCategorie.length === 0 ? (
              <p className="px-5 py-8 text-sm text-slate-500 text-center">Aucune dépense ce mois-ci.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {rapport.depensesParCategorie.map((l) => (
                  <li key={l.categorie} className="flex items-center justify-between px-5 py-3 text-sm">
                    <span className="text-slate-700">{l.categorie}</span>
                    <span className="font-medium text-red-700">{formatMontant(l.montant)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="px-5 py-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900">Revenus par catégorie</h2>
            </div>
            {rapport.revenusParCategorie.length === 0 ? (
              <p className="px-5 py-8 text-sm text-slate-500 text-center">Aucun revenu ce mois-ci.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {rapport.revenusParCategorie.map((l) => (
                  <li key={l.categorie} className="flex items-center justify-between px-5 py-3 text-sm">
                    <span className="text-slate-700">{l.categorie}</span>
                    <span className="font-medium text-emerald-700">{formatMontant(l.montant)}</span>
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
