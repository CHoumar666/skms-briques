import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { formatDate, formatMontant, todayISO } from "@/lib/format";
import { getStockParModele, getStats, listLivraisons, listVentes, listVentesParDate } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TableauDeBordPage() {
  const user = await requireUser();
  const today = todayISO();
  const [stats, stockModeles, livraisons, ventes, ventesDuJour] = await Promise.all([
    getStats(),
    getStockParModele(),
    listLivraisons(),
    listVentes(),
    listVentesParDate(today),
  ]);
  const dernieresLivraisons = livraisons.slice(0, 5);
  const dernieresVentes = ventes.slice(0, 5);

  if (user.role === "personnel") {
    const livraisonsDuJour = livraisons.filter((l) => l.date === today);

    return (
      <div>
        <PageHeader
          title={`Bonjour, ${user.username}`}
          subtitle={`Espace du personnel — ${formatDate(today)}`}
        />
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stockModeles.map((m) => (
              <StatCard key={m.id} label={`Stock ${m.label}`} value={m.stock.toLocaleString("fr-FR")} />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Stock de briques" value={stats.stockBriques.toLocaleString("fr-FR")} />
            <StatCard label="Ventes saisies aujourd'hui" value={String(ventesDuJour.length)} />
            <StatCard label="Livraisons reçues aujourd'hui" value={String(livraisonsDuJour.length)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { href: "/ventes", titre: "Enregistrer une vente", texte: "Saisir la vente et éditer le reçu." },
              { href: "/livraisons", titre: "Enregistrer une livraison", texte: "Noter les briques reçues des fournisseurs." },
              { href: "/comptabilite", titre: "Tenir la comptabilité", texte: "Saisir les dépenses et revenus, consulter le journal." },
            ].map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-orange-400 transition-colors"
              >
                <p className="font-semibold text-slate-900">{a.titre}</p>
                <p className="mt-1 text-sm text-slate-500">{a.texte}</p>
              </Link>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="px-5 py-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900">Dernières ventes</h2>
            </div>
            {dernieresVentes.length === 0 ? (
              <p className="px-5 py-8 text-sm text-slate-500 text-center">Aucune vente enregistrée.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {dernieresVentes.map((v) => (
                  <li key={v.id} className="flex items-center justify-between px-5 py-3 text-sm">
                    <div>
                      <p className="font-medium text-slate-900">{v.client_nom ?? "Client au comptant"}</p>
                      <p className="text-slate-500">{formatDate(v.date)} · {v.quantite.toLocaleString("fr-FR")} briques</p>
                    </div>
                    <Link href={`/recus/${v.id}`} className="text-orange-700 hover:underline">
                      Reçu
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Tableau de bord" subtitle="Vue d'ensemble de l'activité de SKMS Brique" />

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Stock de briques" value={stats.stockBriques.toLocaleString("fr-FR")} />
          <StatCard label="Argent encaissé" value={formatMontant(stats.argentEncaisse)} tone="positive" />
          <StatCard label="Argent sorti" value={formatMontant(stats.argentSorti)} tone="negative" />
          <StatCard label="Solde en caisse" value={formatMontant(stats.soldeCaisse)} tone={stats.soldeCaisse >= 0 ? "positive" : "negative"} />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stockModeles.map((m) => (
            <StatCard key={m.id} label={`Stock ${m.label}`} value={m.stock.toLocaleString("fr-FR")} />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard label="À payer aux fournisseurs" value={formatMontant(stats.aPayer)} />
          <StatCard label="À encaisser des clients" value={formatMontant(stats.aEncaisser)} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900">Dernières livraisons reçues</h2>
              <Link href="/livraisons" className="text-sm text-orange-700 hover:underline">Voir tout</Link>
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
                    <span className="text-right"><span className="block font-medium text-slate-900">{formatMontant(l.quantite * l.prix_unitaire)}</span><span className="block text-xs text-slate-500">{l.statut_paiement === "paye" ? "payée" : l.statut_paiement === "a_payer" ? "à payer" : "stock seulement"}</span></span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900">Dernières ventes</h2>
              <Link href="/ventes" className="text-sm text-orange-700 hover:underline">Voir tout</Link>
            </div>
            {dernieresVentes.length === 0 ? (
              <p className="px-5 py-8 text-sm text-slate-500 text-center">Aucune vente enregistrée.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {dernieresVentes.map((v) => (
                  <li key={v.id} className="flex items-center justify-between px-5 py-3 text-sm">
                    <div>
                      <p className="font-medium text-slate-900">{v.client_nom ?? "Client au comptant"}</p>
                      <p className="text-slate-500">{formatDate(v.date)} · {v.quantite.toLocaleString("fr-FR")} briques</p>
                    </div>
                    <span className="text-right"><span className="block font-medium text-slate-900">{formatMontant(v.quantite * v.prix_unitaire)}</span><span className="block text-xs text-slate-500">{v.statut_paiement === "paye" ? "encaissée" : "à encaisser"}</span></span>
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
