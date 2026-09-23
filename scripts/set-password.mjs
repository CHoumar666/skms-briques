import { createInterface } from "node:readline";
import { randomBytes, pbkdf2Sync } from "node:crypto";
import postgres from "postgres";
import { loadEnvLocal } from "./load-env.mjs";

loadEnvLocal();

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL n'est pas défini dans .env.local. Colle d'abord l'adresse de connexion Supabase.");
  process.exit(1);
}

function ask(question) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const write = rl._writeToOutput;
    rl._writeToOutput = (s) => (s.includes(question) ? write.call(rl, s) : write.call(rl, "*"));
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });
}

const username = process.argv[2] || "proprietaire";
const password = await ask(`Nouveau mot de passe pour "${username}" (12 caractères minimum) : `);
if (password.length < 12) {
  console.error("Mot de passe trop court (12 caractères minimum).");
  process.exit(1);
}
if (password !== (await ask("Confirmer le mot de passe : "))) {
  console.error("Les deux mots de passe ne correspondent pas.");
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const hash = `${salt}:${pbkdf2Sync(password, Buffer.from(salt, "hex"), 100000, 32, "sha256").toString("hex")}`;

const sql = postgres(process.env.DATABASE_URL, { max: 1 });

try {
  const [existant] = await sql`SELECT id FROM users WHERE username = ${username}`;
  if (existant) {
    await sql`UPDATE users SET password_hash = ${hash}, actif = TRUE WHERE id = ${existant.id}`;
  } else {
    await sql`INSERT INTO users (username, password_hash, role) VALUES (${username}, ${hash}, 'proprietaire')`;
  }
  console.log(`Mot de passe enregistré pour "${username}" sur Supabase.`);
} catch (err) {
  console.error("Échec :", err.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
