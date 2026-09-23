import "server-only";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL n'est pas défini. Colle l'adresse de connexion Supabase dans .env.local (voir README)."
  );
}

// `prepare: false` : compatible avec le pooler transactionnel de Supabase.
const sql = postgres(connectionString, { prepare: false });

export default sql;

export type StatutLivraison = "paye" | "a_payer" | "sans_paiement";
export type StatutVente = "paye" | "a_encaisser";
export type Role = "proprietaire" | "personnel";

export type Fournisseur = {
  id: number;
  nom: string;
  telephone: string | null;
};

export type Client = {
  id: number;
  nom: string;
  telephone: string | null;
  adresse: string | null;
};

export type Livraison = {
  id: number;
  date: string;
  fournisseur_id: number | null;
  quantite: number;
  prix_unitaire: number;
  notes: string | null;
  modele: string | null;
  statut_paiement: StatutLivraison;
  created_by: number | null;
  created_at: string;
};

export type Vente = {
  id: number;
  date: string;
  client_id: number | null;
  quantite: number;
  prix_unitaire: number;
  notes: string | null;
  modele: string | null;
  statut_paiement: StatutVente;
  created_by: number | null;
  created_at: string;
};

export type Transaction = {
  id: number;
  date: string;
  type: "depense" | "revenu";
  categorie: string;
  montant: number;
  description: string | null;
  created_by: number | null;
  created_at: string;
};

export type User = {
  id: number;
  username: string;
  password_hash: string;
  role: Role;
  actif: boolean;
  created_at: string;
};
