"use client";

import { ajouterTransaction } from "./actions";

export default function TransactionForm() {
  return (
    <form action={ajouterTransaction} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
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

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Type</label>
        <select
          name="type"
          required
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
        >
          <option value="depense">Dépense</option>
          <option value="revenu">Revenu</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Catégorie</label>
        <input
          type="text"
          name="categorie"
          required
          placeholder="Ex: Transport, Salaires..."
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Montant (FCFA)</label>
        <input
          type="number"
          name="montant"
          min={0}
          required
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1 lg:col-span-2">
        <label className="text-sm font-medium text-slate-700">Description (optionnel)</label>
        <input
          type="text"
          name="description"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        className="lg:col-span-6 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors w-fit"
      >
        Ajouter
      </button>
    </form>
  );
}
