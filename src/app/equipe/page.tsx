import PageHeader from "@/components/PageHeader";
import { formatDate } from "@/lib/format";
import { requireOwner } from "@/lib/session";
import { listUsers } from "@/lib/users";
import { basculerPersonnel, changerMotDePasse, creerPersonnel } from "./actions";

export const dynamic = "force-dynamic";

const ERREURS: Record<string, string> = {
  identifiant: "Identifiant invalide : 3 à 30 caractères (lettres, chiffres, . _ -).",
  motdepasse: "Mot de passe trop court : 10 caractères minimum.",
  existe: "Cet identifiant existe déjà.",
};

const input =
  "rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none";

export default async function EquipePage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string; ok?: string }>;
}) {
  await requireOwner();
  const params = await searchParams;
  const users = await listUsers();

  return (
    <div>
      <PageHeader title="Équipe" subtitle="Comptes du personnel qui saisit les livraisons, ventes et la comptabilité" />

      <div className="p-8 space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">Ajouter un membre du personnel</h2>
          {params.erreur && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {ERREURS[params.erreur] ?? "Valeurs invalides."}
            </p>
          )}
          {params.ok && (
            <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">Modification enregistrée.</p>
          )}
          <form action={creerPersonnel} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="flex flex-col gap-1">
              <label htmlFor="username" className="text-sm font-medium text-slate-700">Identifiant</label>
              <input id="username" name="username" required autoComplete="off" className={input} />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">Mot de passe (10 caractères min.)</label>
              <input id="password" name="password" type="password" required minLength={10} autoComplete="new-password" className={input} />
            </div>
            <button type="submit" className="rounded-lg bg-orange-700 px-4 py-2 text-sm font-medium text-white hover:bg-orange-800 transition-colors">
              Créer le compte
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">Comptes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th className="px-5 py-3 font-medium">Identifiant</th>
                  <th className="px-5 py-3 font-medium">Rôle</th>
                  <th className="px-5 py-3 font-medium">Créé le</th>
                  <th className="px-5 py-3 font-medium">Statut</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-5 py-3 font-medium text-slate-900">{u.username}</td>
                    <td className="px-5 py-3">{u.role === "proprietaire" ? "Propriétaire" : "Personnel"}</td>
                    <td className="px-5 py-3 whitespace-nowrap">{formatDate(u.created_at.slice(0, 10))}</td>
                    <td className="px-5 py-3">{u.actif ? "Actif" : "Désactivé"}</td>
                    <td className="px-5 py-3">
                      {u.role === "personnel" && (
                        <div className="flex flex-wrap items-center gap-3">
                          <form action={basculerPersonnel}>
                            <input type="hidden" name="id" value={u.id} />
                            <input type="hidden" name="actif" value={u.actif ? "0" : "1"} />
                            <button type="submit" className="text-orange-700 hover:underline">
                              {u.actif ? "Désactiver" : "Réactiver"}
                            </button>
                          </form>
                          <form action={changerMotDePasse} className="flex items-center gap-2">
                            <input type="hidden" name="id" value={u.id} />
                            <input
                              name="password"
                              type="password"
                              minLength={10}
                              required
                              placeholder="Nouveau mot de passe"
                              aria-label={`Nouveau mot de passe pour ${u.username}`}
                              className={input + " w-48"}
                            />
                            <button type="submit" className="text-orange-700 hover:underline">Changer</button>
                          </form>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
