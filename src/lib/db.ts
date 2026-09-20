import "server-only";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, "gestion.db"));
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS fournisseurs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    telephone TEXT
  );

  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    telephone TEXT,
    adresse TEXT
  );

  CREATE TABLE IF NOT EXISTS livraisons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    fournisseur_id INTEGER REFERENCES fournisseurs(id),
    quantite INTEGER NOT NULL,
    prix_unitaire INTEGER NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ventes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    client_id INTEGER REFERENCES clients(id),
    quantite INTEGER NOT NULL,
    prix_unitaire INTEGER NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('proprietaire', 'personnel')),
    actif INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('depense', 'revenu')),
    categorie TEXT NOT NULL,
    montant INTEGER NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

function ajouterColonne(table: string, colonne: string, definition: string) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!cols.some((c) => c.name === colonne)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${colonne} ${definition}`);
}

ajouterColonne("livraisons", "created_by", "INTEGER REFERENCES users(id)");
ajouterColonne("ventes", "created_by", "INTEGER REFERENCES users(id)");
ajouterColonne("transactions", "created_by", "INTEGER REFERENCES users(id)");
ajouterColonne("livraisons", "modele", "TEXT");
ajouterColonne("ventes", "modele", "TEXT");
ajouterColonne("livraisons", "statut_paiement", "TEXT NOT NULL DEFAULT 'paye'");
ajouterColonne("ventes", "statut_paiement", "TEXT NOT NULL DEFAULT 'paye'");

db.exec(`
  CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    action TEXT NOT NULL,
    detail TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

export default db;

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
  created_at: string;
};

export type Transaction = {
  id: number;
  date: string;
  type: "depense" | "revenu";
  categorie: string;
  montant: number;
  description: string | null;
  created_at: string;
};

export type StatutLivraison = "paye" | "a_payer" | "sans_paiement";
export type StatutVente = "paye" | "a_encaisser";

export type Role = "proprietaire" | "personnel";

export type User = {
  id: number;
  username: string;
  password_hash: string;
  role: Role;
  actif: number;
  created_at: string;
};
