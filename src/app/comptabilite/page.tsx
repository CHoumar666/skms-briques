import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { formatDate, formatMontant } from "@/lib/format";
import { getLedger, getStats } from "@/lib/queries";
import TransactionForm from "./TransactionForm";
import { requireUser } from "@/lib/session";
import { changerPaiement, supprimerLigne } from "./actions";

export const dynamic = "force-dynamic";

export default async function ComptabilitePage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  const user = await requireUser();
  const estProprietaire = user.role === "proprietaire";
  const params = await searchParams;
  const [stats, ledger] = await Promise.all([getStats(), getLedger()]);

  return (
    <div>
      <PageHeader title="Comptabilité" subtitle="Toutes les entrées et sorties d'argent" />

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label="Argent encaissé" value={formatMontant(stats.argentEncaisse)} tone="positive" />
          <StatCard label="Argent sorti" value={formatMontant(stats.argentSorti)} tone="negative" />
          <StatCard label="Solde en caisse" value={formatMontant(stats.soldeCaisse)} tone={stats.soldeCaisse >= 0 ? "positive" : "negative"} />
          <StatCard label="À payer aux fournisseurs" value={formatMontant(stats.aPayer)} />
          <StatCard label="À encaisser des clients" value={formatMontant(stats.aEncaisser)} />
        </div>
        <p className="text-sm text-slate-600">
          Le solde ne compte que l&apos;argent réellement payé ou encaissé. Une livraison « à payer » ou « sans paiement »
          n&apos;est pas une sortie d&apos;argent : elle augmente seulement le stock.
        </p>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">Ajouter une dépense ou un revenu</h2>
          <p className="text-sm text-slate-500 mb-4">
            Les livraisons et les ventes sont déjà comptées automatiquement. Utilise ce formulaire pour
            les autres mouvements (transport, salaires, loyer, etc.)
          </p>
          {params.erreur && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              Valeurs invalides : vérifiez la date, le type, la catégorie et le montant (&gt; 0).
            </p>
          )}
          <TransactionForm />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">Journal des opérations</h2>
            <a href="/comptabilite/export" className="text-sm text-orange-700 hover:underline">
              Exporter en CSV (Excel)
            </a>
          </div>

          {ledger.length === 0 ? (
            <p className="px-5 py-8 text-sm text-slate-500 text-center">Aucune opération enregistrée.</p>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Catégorie</th>
                  <th className="px-5 py-3 font-medium">Description</th>
                  <th className="px-5 py-3 font-medium">Saisi par</th>
                  <th className="px-5 py-3 font-medium">Paiement</th>
                  <th className="px-5 py-3 font-medium text-right">Montant</th>
                  {estProprietaire && <th className="px-5 py-3 font-medium"><span className="sr-only">Actions</span></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledger.map((ligne) => (
                  <tr key={ligne.id}>
                    <td className="px-5 py-3 whitespace-nowrap">{formatDate(ligne.date)}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          ligne.type === "revenu"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {ligne.type === "revenu" ? "Revenu" : "Dépense"}
                      </span>
                    </td>
                    <td className="px-5 py-3">{ligne.categorie}</td>
                    <td className="px-5 py-3 text-slate-500">{ligne.description ?? ""}</td>
                    <td className="px-5 py-3 text-slate-500">{ligne.saisi_par ?? "—"}</td>
                    <td className="px-5 py-3">
                      {ligne.source === "transaction" ? (
                        <span className="text-slate-600">Réglé</span>
                      ) : (
                        <form action={changerPaiement} className="flex items-center gap-2">
                          <input type="hidden" name="source" value={ligne.source} />
                          <input type="hidden" name="id" value={ligne.refId} />
                          <select
                            name="statut"
                            defaultValue={ligne.statut}
                            aria-label="Statut de paiement"
                            className="rounded-md border border-slate-300 px-2 py-1 text-xs"
                          >
                            {ligne.source === "livraison" ? (
                              <>
                                <option value="paye">Payée</option>
                                <option value="a_payer">À payer</option>
                                <option value="sans_paiement">Sans paiement</option>
                              </>
                            ) : (
                              <>
                                <option value="paye">Encaissée</option>
                                <option value="a_encaisser">À encaisser</option>
                              </>
                            )}
                          </select>
                          <button type="submit" className="text-xs text-orange-700 hover:underline">OK</button>
                        </form>
                      )}
                    </td>
                    <td
                      className={`px-5 py-3 text-right font-medium ${
                        !ligne.compteEnCaisse
                          ? "text-slate-500"
                          : ligne.type === "revenu"
                            ? "text-emerald-700"
                            : "text-red-700"
                      }`}
                    >
                      {ligne.compteEnCaisse ? (ligne.type === "revenu" ? "+" : "-") : ""}
                      {formatMontant(ligne.montant)}
                      {!ligne.compteEnCaisse && (
                        <span className="block text-xs font-normal">
                          {ligne.statut === "sans_paiement" ? "stock seulement" : "en attente"}
                        </span>
                      )}
                    </td>
                    {estProprietaire && (
                      <td className="px-5 py-3">
                        <form action={supprimerLigne}>
                          <input type="hidden" name="source" value={ligne.source} />
                          <input type="hidden" name="id" value={ligne.refId} />
                          <button type="submit" className="text-red-700 hover:underline">Supprimer</button>
                        </form>
                      </td>
                    )}
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
