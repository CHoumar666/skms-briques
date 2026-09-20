export const MODELES = [
  { id: "12_creux", label: "12 creux" },
  { id: "12_pleins", label: "12 pleins" },
  { id: "15_creux", label: "15 creux" },
  { id: "15_pleins", label: "15 pleins" },
] as const;

export type ModeleId = (typeof MODELES)[number]["id"];

export function estModele(valeur: unknown): valeur is ModeleId {
  return MODELES.some((m) => m.id === valeur);
}

export function libelleModele(id: string | null | undefined): string {
  return MODELES.find((m) => m.id === id)?.label ?? "Non précisé";
}
