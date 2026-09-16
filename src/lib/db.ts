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
  created_at: string;
};

export type Vente = {
  id: number;
  date: string;
  client_id: number | null;
  quantite: number;
  prix_unitaire: number;
  notes: string | null;
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
