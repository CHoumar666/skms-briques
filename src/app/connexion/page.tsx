import { connexion } from "./actions";

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const params = await searchParams;
  const from = params.from ?? "/tableau-de-bord";

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900 mb-1">Connexion</h1>
        <p className="text-sm text-slate-500 mb-6">Accès réservé au propriétaire et au personnel de SKMS Brique.</p>

        {params.error === "limite" && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            Trop de tentatives échouées. Réessayez dans 15 minutes.
          </p>
        )}
        {params.error === "1" && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            Identifiant ou mot de passe incorrect.
          </p>
        )}

        <form action={connexion} className="space-y-4">
          <input type="hidden" name="from" value={from} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Identifiant</label>
            <input
              name="username"
              type="text"
              required
              autoFocus
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Mot de passe</label>
            <input
              name="password"
              type="password"
              required
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}
