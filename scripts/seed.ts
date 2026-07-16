import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", ".db", "viewsforum.sqlite");

const db = new Database(DB_PATH);
db.pragma("foreign_keys = ON");

// Read seed data
const topics = JSON.parse(
  readFileSync(path.join(__dirname, "..", "src", "data", "seed-topics.json"), "utf-8")
);

// Create a seed user (id=1) for all seed topics
const seedUser = db.prepare("SELECT id FROM users WHERE google_id = ?").get("seed_user");
let userId: number;

if (!seedUser) {
  const result = db.prepare(
    "INSERT INTO users (google_id, name, avatar, email) VALUES (?, ?, ?, ?)"
  ).run("seed_user", "ViewsForum", "", "seed@viewsforum.local");
  userId = Number(result.lastInsertRowid);
} else {
  userId = (seedUser as any).id;
}

// Insert topics
const insert = db.prepare(
  "INSERT OR IGNORE INTO topics (slug, user_id, category, title, content, created_at) VALUES (?, ?, ?, ?, ?, ?)"
);

const insertTopics = db.transaction(() => {
  for (const topic of topics) {
    insert.run(topic.slug, userId, topic.category, topic.title, topic.content, topic.created_at);
  }
});

insertTopics();

const count = (db.prepare("SELECT COUNT(*) as c FROM topics").get() as any).c;
console.log(`Seeded ${count} topics.`);
db.close();
