import { createInterface } from "node:readline";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { randomBytes, pbkdf2Sync } from "node:crypto";
import Database from "better-sqlite3";

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

mkdirSync("data", { recursive: true });
const db = new Database("data/gestion.db");
db.exec(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('proprietaire', 'personnel')), actif INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')))`);
const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
if (existing) db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hash, existing.id);
else db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'proprietaire')").run(username, hash);

const envFile = ".env.local";
const lines = existsSync(envFile) ? readFileSync(envFile, "utf8").split("\n").filter((l) => l && !l.startsWith("ADMIN_")) : [];
if (!lines.some((l) => l.startsWith("SESSION_SECRET="))) lines.push(`SESSION_SECRET=${randomBytes(32).toString("hex")}`);
writeFileSync(envFile, lines.join("\n") + "\n");
console.log(`Mot de passe enregistré pour "${username}". Redémarre le serveur si besoin.`);
