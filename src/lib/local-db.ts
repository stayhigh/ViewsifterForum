import type { Topic } from "./types";

// Local SQLite fallback for development only.
// Uses dynamic import so better-sqlite3 is not bundled into Cloudflare worker.

export async function getLocalDb(): Promise<any> {
  const Database = (await import("better-sqlite3")).default;
  const path = (await import("node:path")).default;
  const { fileURLToPath } = await import("node:url");

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const DB_PATH = path.join(__dirname, "..", "..", ".db", "viewsforum.sqlite");

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  return db;
}

let cachedTopics: Topic[] | null = null;

export async function getLocalTopics(): Promise<Topic[]> {
  if (cachedTopics) return cachedTopics;

  try {
    const db = await getLocalDb();
    const rows = db
      .prepare("SELECT * FROM topics ORDER BY created_at DESC")
      .all() as Topic[];
    db.close();
    cachedTopics = rows;
    return rows;
  } catch {
    // Fallback to JSON seed data
    const seedTopics: Topic[] = (await import("../data/seed-topics.json")).default;
    cachedTopics = seedTopics;
    return seedTopics;
  }
}
