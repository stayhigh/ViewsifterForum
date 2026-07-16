import Database from "better-sqlite3";
import { readFileSync, readdirSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", ".db", "viewsforum.sqlite");
const MIGRATIONS_DIR = path.join(__dirname, "..", "migrations");

// Ensure .db directory exists
mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Create migrations tracking table
db.exec(`
  CREATE TABLE IF NOT EXISTS _migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

// Get applied migrations
const applied = new Set(
  db.prepare("SELECT name FROM _migrations").all().map((r: any) => r.name)
);

// Apply pending migrations in order
const files = readdirSync(MIGRATIONS_DIR)
  .filter((f) => f.endsWith(".sql"))
  .sort();

for (const file of files) {
  if (applied.has(file)) {
    console.log(`  ✓ ${file} (already applied)`);
    continue;
  }

  const sql = readFileSync(path.join(MIGRATIONS_DIR, file), "utf-8");
  db.exec(sql);
  db.prepare("INSERT INTO _migrations (name) VALUES (?)").run(file);
  console.log(`  ✓ ${file}`);
}

db.close();
console.log("Database setup complete.");
