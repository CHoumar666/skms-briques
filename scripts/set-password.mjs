import { createInterface } from "node:readline";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { randomBytes, pbkdf2Sync } from "node:crypto";

const ENV_FILE = ".env.local";

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

const password = await ask("Nouveau mot de passe (12 caractères minimum) : ");
if (password.length < 12) {
  console.error("Mot de passe trop court (12 caractères minimum).");
  process.exit(1);
}
const confirm = await ask("Confirmer le mot de passe : ");
if (password !== confirm) {
  console.error("Les deux mots de passe ne correspondent pas.");
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const hash = pbkdf2Sync(password, Buffer.from(salt, "hex"), 100000, 32, "sha256").toString("hex");

const lines = existsSync(ENV_FILE) ? readFileSync(ENV_FILE, "utf8").split("\n").filter(Boolean) : [];
const setVar = (key, value) => {
  const i = lines.findIndex((l) => l.startsWith(key + "="));
  if (i >= 0) lines[i] = `${key}=${value}`;
  else lines.push(`${key}=${value}`);
};
setVar("ADMIN_USERNAME", process.env.ADMIN_USERNAME || "proprietaire");
setVar("ADMIN_PASSWORD_HASH", `${salt}:${hash}`);
if (!lines.some((l) => l.startsWith("SESSION_SECRET="))) setVar("SESSION_SECRET", randomBytes(32).toString("hex"));
writeFileSync(ENV_FILE, lines.join("\n") + "\n");
console.log("Mot de passe enregistré. Redémarre le serveur pour l'appliquer.");
