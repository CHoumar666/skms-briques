import "server-only";
import sql, { Role, User } from "./db";

export async function getUserByUsername(username: string): Promise<User | undefined> {
  const [row] = await sql<User[]>`SELECT * FROM users WHERE username = ${username}`;
  return row;
}

export async function getUserById(id: number): Promise<User | undefined> {
  const [row] = await sql<User[]>`SELECT * FROM users WHERE id = ${id}`;
  return row;
}

export async function listUsers(): Promise<User[]> {
  return sql<User[]>`SELECT * FROM users ORDER BY role DESC, username`;
}

export async function createUser(username: string, passwordHash: string, role: Role) {
  return sql`INSERT INTO users (username, password_hash, role) VALUES (${username}, ${passwordHash}, ${role})`;
}

export async function setUserActif(id: number, actif: boolean) {
  return sql`UPDATE users SET actif = ${actif} WHERE id = ${id} AND role = 'personnel'`;
}

export async function setUserPassword(id: number, passwordHash: string) {
  return sql`UPDATE users SET password_hash = ${passwordHash} WHERE id = ${id}`;
}
