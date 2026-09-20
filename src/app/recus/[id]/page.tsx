import { libelleModele } from "@/lib/modeles";
import { requireUser } from "@/lib/session";
import PrintButton from "@/components/PrintButton";
import { formatDate, formatMontant } from "@/lib/format";
import { getVente } from "@/lib/queries";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function RecuPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const vente = getVente(Number(id));

  if (!vente) return notFound();

  const total = vente.quantite * vente.prix_unitaire;
  const numeroRecu = `REC-${String(vente.id).padStart(5, "0")}`;

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white">
      <div className="print:hidden flex items-center justify-between px-8 py-6">
        <Link href="/ventes" className="text-sm text-slate-500 hover:text-slate-700">
          ← Retour aux ventes
        </Link>
        <PrintButton />
      </div>

      <div className="mx-auto max-w-2xl bg-white shadow-sm print:shadow-none border border-slate-200 print:border-0 rounded-xl print:rounded-none p-10 mb-10">
        <div className="flex items-start justify-between border-b border-slate-200 pb-6">
          <div>
            <p className="text-xl font-semibold text-slate-900">SKMS Brique</p>
            <p className="text-sm text-slate-500">Vente et livraison de briques</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-slate-900">REÇU</p>
            <p className="text-sm text-slate-500">{numeroRecu}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 py-6 text-sm">
          <div>
            <p className="text-slate-500 mb-1">Client</p>
            <p className="font-medium text-slate-900">{vente.client_nom ?? "Client au comptant"}</p>
            {vente.client_telephone && <p className="text-slate-600">{vente.client_telephone}</p>}
            {vente.client_adresse && <p className="text-slate-600">{vente.client_adresse}</p>}
          </div>
          <div className="text-right">
            <p className="text-slate-500 mb-1">Date</p>
            <p className="font-medium text-slate-900">{formatDate(vente.date)}</p>
          </div>
        </div>

        <table className="w-full text-sm border-t border-slate-200">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="py-3 font-medium">Description</th>
              <th className="py-3 font-medium text-right">Quantité</th>
              <th className="py-3 font-medium text-right">Prix unitaire</th>
              <th className="py-3 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-100">
              <td className="py-3">
                Briques {libelleModele(vente.modele)}
                {vente.notes && <span className="block text-slate-500">{vente.notes}</span>}
              </td>
              <td className="py-3 text-right">{vente.quantite.toLocaleString("fr-FR")}</td>
              <td className="py-3 text-right">{formatMontant(vente.prix_unitaire)}</td>
              <td className="py-3 text-right">{formatMontant(total)}</td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-end border-t border-slate-200 pt-4 mt-2">
          <div className="w-56 flex justify-between text-base font-semibold text-slate-900">
            <span>Total</span>
            <span>{formatMontant(total)}</span>
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-slate-400">
          Merci pour votre confiance — SKMS Brique, Gestion Briques
        </p>
      </div>
    </div>
  );
}
