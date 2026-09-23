// Transfère les données existantes de data/gestion.db (SQLite, sur cet ordinateur)
// vers Supabase. À lancer une seule fois, après "npm run db:migrate".
import { existsSync } from "node:fs";
import Database from "better-sqlite3";
import postgres from "postgres";
import { loadEnvLocal } from "./load-env.mjs";

loadEnvLocal();

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL n'est pas défini dans .env.local.");
  process.exit(1);
}
if (!existsSync("data/gestion.db")) {
  console.error("Aucune base locale trouvée (data/gestion.db). Rien à transférer.");
  process.exit(1);
}

const lite = new Database("data/gestion.db", { readonly: true });
const sql = postgres(process.env.DATABASE_URL, { max: 1 });

async function copierTable(nomTable, colonnes) {
  const lignes = lite.prepare(`SELECT * FROM ${nomTable}`).all();
  for (const ligne of lignes) {
    const valeurs = colonnes.map((c) => (c === "actif" ? !!ligne[c] : ligne[c]));
    await sql.unsafe(
      `INSERT INTO ${nomTable} (id, ${colonnes.join(", ")}) VALUES ($1, ${colonnes.map((_, i) => `$${i + 2}`).join(", ")})
       ON CONFLICT (id) DO NOTHING`,
      [ligne.id, ...valeurs]
    );
  }
  if (lignes.length > 0) {
    await sql.unsafe(`SELECT setval(pg_get_serial_sequence('${nomTable}', 'id'), (SELECT COALESCE(MAX(id), 1) FROM ${nomTable}))`);
  }
  console.log(`${nomTable} : ${lignes.length} ligne(s) transférée(s).`);
}

try {
  await copierTable("users", ["username", "password_hash", "role", "actif", "created_at"]);
  await copierTable("fournisseurs", ["nom", "telephone"]);
  await copierTable("clients", ["nom", "telephone", "adresse"]);
  await copierTable("livraisons", [
    "date",
    "fournisseur_id",
    "quantite",
    "prix_unitaire",
    "notes",
    "modele",
    "statut_paiement",
    "created_by",
    "created_at",
  ]);
  await copierTable("ventes", [
    "date",
    "client_id",
    "quantite",
    "prix_unitaire",
    "notes",
    "modele",
    "statut_paiement",
    "created_by",
    "created_at",
  ]);
  await copierTable("transactions", ["date", "type", "categorie", "montant", "description", "created_by", "created_at"]);
  await copierTable("audit_log", ["user_id", "action", "detail", "created_at"]);
  console.log("Transfert terminé.");
} catch (err) {
  console.error("Échec du transfert :", err.message);
  process.exitCode = 1;
} finally {
  lite.close();
  await sql.end();
}
