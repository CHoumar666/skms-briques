"use client";

import { useRef, useState } from "react";
import { ajouterLivraison } from "./actions";
import type { Fournisseur } from "@/lib/db";

export default function LivraisonForm({ fournisseurs }: { fournisseurs: Fournisseur[] }) {
  const [nouveauFournisseur, setNouveauFournisseur] = useState(false);
  const [statut, setStatut] = useState("paye");
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await ajouterLivraison(formData);
        formRef.current?.reset();
        setNouveauFournisseur(false);
        setStatut("paye");
      }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end"
    >
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Date</label>
        <input
          type="date"
          name="date"
          required
          defaultValue={new Date().toISOString().slice(0, 10)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1 lg:col-span-2">
        <label className="text-sm font-medium text-slate-700">Fournisseur</label>
        {!nouveauFournisseur ? (
          <select
            name="fournisseur_id"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
            onChange={(e) => {
              if (e.target.value === "__nouveau__") setNouveauFournisseur(true);
            }}
          >
            <option value="">Sélectionner...</option>
            {fournisseurs.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nom}
              </option>
            ))}
            <option value="__nouveau__">+ Nouveau fournisseur</option>
          </select>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              name="nouveau_fournisseur"
              required
              autoFocus
              placeholder="Nom du fournisseur"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setNouveauFournisseur(false)}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Annuler
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Quantité (briques)</label>
        <input
          type="number"
          name="quantite"
          min={1}
          required
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Prix unitaire (FCFA)</label>
        <input
          type="number"
          name="prix_unitaire"
          min={0}
          required={statut !== "sans_paiement"}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors"
      >
        Ajouter
      </button>

      <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-4">
        <label className="text-sm font-medium text-slate-700">Notes (optionnel)</label>
        <input
          type="text"
          name="notes"
          placeholder="Ex: transport inclus, camion n°2..."
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-2">
        <label htmlFor="statut_paiement" className="text-sm font-medium text-slate-700">Paiement</label>
        <select
          id="statut_paiement"
          name="statut_paiement"
          defaultValue="paye"
          onChange={(e) => setStatut(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
        >
          <option value="paye">Payée (l&apos;argent sort de la caisse)</option>
          <option value="a_payer">À payer plus tard (dette fournisseur)</option>
          <option value="sans_paiement">Sans paiement (stock seulement)</option>
        </select>
      </div>
    </form>
  );
}
