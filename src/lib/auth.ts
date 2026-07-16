import bcrypt from "bcryptjs";
import type { User } from "./types";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createSessionToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function registerUser(
  env: any,
  email: string,
  password: string,
  name: string
): Promise<User> {
  const passwordHash = await hashPassword(password);
  const result = await env.DB.prepare(
    `INSERT INTO users (google_id, email, name, avatar, password_hash) 
     VALUES (NULL, ?, ?, '', ?)`
  )
    .bind(email, name, passwordHash)
    .run();

  // D1 .run() returns { meta: { last_row_id } } via wrapper
  const id = result.meta?.last_row_id || result.lastInsertRowid || 0;

  return {
    id,
    googleId: "",
    email,
    name,
    avatar: "",
  };
}

export async function loginUser(
  env: any,
  email: string,
  password: string
): Promise<User | null> {
  const row = await env.DB.prepare(
    "SELECT id, google_id, email, name, avatar, password_hash FROM users WHERE email = ?"
  )
    .bind(email)
    .first();

  if (!row) return null;

  const valid = await verifyPassword(password, row.password_hash);
  if (!valid) return null;

  return {
    id: row.id as number,
    googleId: (row.google_id as string) || "",
    email: row.email as string,
    name: row.name as string,
    avatar: (row.avatar as string) || "",
  };
}
