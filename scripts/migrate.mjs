import { readFileSync } from "node:fs";
import postgres from "postgres";
import { loadEnvLocal } from "./load-env.mjs";

loadEnvLocal();

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL n'est pas défini dans .env.local. Colle d'abord l'adresse de connexion Supabase.");
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, { max: 1 });
const schema = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8");

try {
  await sql.unsafe(schema);
  console.log("Schéma appliqué avec succès sur Supabase.");
} catch (err) {
  console.error("Échec de la migration du schéma :", err.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
