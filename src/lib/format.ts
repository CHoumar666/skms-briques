export function formatMontant(montant: number): string {
  return `${Math.round(montant).toLocaleString("fr-FR")} FCFA`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function moisActuel(): string {
  return new Date().toISOString().slice(0, 7);
}

export function formatMoisLabel(mois: string): string {
  const [annee, m] = mois.split("-").map(Number);
  return new Date(annee, m - 1, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}
