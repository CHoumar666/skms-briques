import "server-only";

// Filet de sécurité pour les pages : si une requête Supabase reste bloquée
// (ex. connexion mal refermée sur le pooler après un redémarrage), la page
// échoue proprement au bout de quelques secondes au lieu de rester chargée
// indéfiniment. `statement_timeout` côté Postgres ne suffit pas : le pooler
// transactionnel de Supabase ne le transmet pas de façon fiable.
export function withTimeout<T>(
  promise: Promise<T>,
  ms = 12000,
  message = "La base de données met trop de temps à répondre. Réessaie dans un instant."
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      const timer = setTimeout(() => reject(new Error(message)), ms);
      promise.finally(() => clearTimeout(timer));
    }),
  ]);
}
