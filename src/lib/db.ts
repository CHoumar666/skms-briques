import "server-only";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL n'est pas défini. Colle l'adresse de connexion Supabase dans .env.local (voir README)."
  );
}

// `prepare: false` : compatible avec le pooler transactionnel de Supabase.
// `max` limité + `connect_timeout` : le pooler accepte peu de connexions à la
// fois ; sans ça, trop de requêtes en parallèle peuvent rester bloquées au lieu
// d'échouer proprement.
// `types` : par défaut, Postgres renvoie les dates comme de vrais objets Date
// JavaScript (SQLite ne renvoyait que du texte). Tout le code compare/affiche
// ces valeurs comme des chaînes ("2026-09-23") ; on force donc Postgres à les
// renvoyer telles quelles, sans les transformer en objets Date.
const sql = postgres(connectionString, {
  prepare: false,
  max: 5,
  idle_timeout: 20,
  connect_timeout: 10,
  types: {
    date: {
      to: 1082,
      from: [1082, 1114, 1184], // date, timestamp, timestamptz
      serialize: (x: string) => x,
      parse: (x: string) => x,
    },
  },
});

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
