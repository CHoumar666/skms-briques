"use client";

import { useState } from "react";
import { ajouterVente } from "./actions";
import type { Client } from "@/lib/db";

export default function VenteForm({ clients }: { clients: Client[] }) {
  const [nouveauClient, setNouveauClient] = useState(false);

  return (
    <form action={ajouterVente} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
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
        <label className="text-sm font-medium text-slate-700">Client</label>
        {!nouveauClient ? (
          <select
            name="client_id"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
            onChange={(e) => {
              if (e.target.value === "__nouveau__") setNouveauClient(true);
            }}
          >
            <option value="">Sélectionner...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
            <option value="__nouveau__">+ Nouveau client</option>
          </select>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              name="nouveau_client"
              required
              autoFocus
              placeholder="Nom du client"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setNouveauClient(false)}
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
          required
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors"
      >
        Enregistrer & générer le reçu
      </button>

      <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-6">
        <label className="text-sm font-medium text-slate-700">Notes (optionnel)</label>
        <input
          type="text"
          name="notes"
          placeholder="Ex: livraison chantier X..."
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
        />
      </div>
    </form>
  );
}
