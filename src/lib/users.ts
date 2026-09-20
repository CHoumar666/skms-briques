import "server-only";
import db, { Role, User } from "./db";

export function getUserByUsername(username: string): User | undefined {
  return db.prepare("SELECT * FROM users WHERE username = ?").get(username) as User | undefined;
}

export function getUserById(id: number): User | undefined {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as User | undefined;
}

export function listUsers(): User[] {
  return db.prepare("SELECT * FROM users ORDER BY role DESC, username").all() as User[];
}

export function createUser(username: string, passwordHash: string, role: Role) {
  return db
    .prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)")
    .run(username, passwordHash, role);
}

export function setUserActif(id: number, actif: boolean) {
  return db.prepare("UPDATE users SET actif = ? WHERE id = ? AND role = 'personnel'").run(actif ? 1 : 0, id);
}

export function setUserPassword(id: number, passwordHash: string) {
  return db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(passwordHash, id);
}
