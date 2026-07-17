import { marked } from "marked";
import type { Topic, Category, Comment } from "./types";
import { getLocalTopics } from "./local-db";

// Data access layer.
// Priority: D1 → local SQLite → JSON fallback

/**
 * Wrap a D1 query with fallback. If D1 succeeds but returns an empty array,
 * we also fall back — because the platform proxy has empty tables while
 * local SQLite has the real data.
 */
async function safeD1Call<T>(
  fn: () => Promise<T>,
  fallback: () => Promise<T>,
  checkEmpty = true
): Promise<T> {
  try {
    const result = await fn();
    // D1 may succeed but return empty/null if tables exist without data.
    // Fall back to local source when D1 returns nothing.
    if (result == null) return fallback();
    if (checkEmpty && Array.isArray(result) && result.length === 0) {
      return fallback();
    }
    return result;
  } catch {
    return fallback();
  }
}

export async function getAllTopics(env?: any): Promise<Topic[]> {
  if (env?.DB) {
    return safeD1Call(
      async () => {
        const result = await env.DB.prepare(
          "SELECT * FROM topics ORDER BY created_at DESC"
        ).all();
        return (result.results || result) as Topic[];
      },
      () => getLocalTopics()
    );
  }
  return getLocalTopics();
}

export async function getTopicsByCategory(
  category: Category,
  env?: any
): Promise<Topic[]> {
  if (env?.DB) {
    return safeD1Call(
      async () => {
        const result = await env.DB.prepare(
          "SELECT * FROM topics WHERE category = ? ORDER BY created_at DESC"
        )
          .bind(category)
          .all();
        return (result.results || result) as Topic[];
      },
      async () => (await getLocalTopics()).filter((t) => t.category === category)
    );
  }
  return (await getLocalTopics()).filter((t) => t.category === category);
}

export async function getTopicBySlug(
  slug: string,
  env?: any
): Promise<Topic | undefined> {
  if (env?.DB) {
    return safeD1Call(
      async () => {
        const result = await env.DB.prepare(
          "SELECT * FROM topics WHERE slug = ?"
        )
          .bind(slug)
          .first();
        return (result as Topic) || undefined;
      },
      async () => (await getLocalTopics()).find((t) => t.slug === slug),
      false // single result — don't check for empty array
    );
  }
  return (await getLocalTopics()).find((t) => t.slug === slug);
}

export function renderMarkdown(content: string): string {
  return marked(content) as string;
}

export async function getCommentsByTopicId(
  topicId: number,
  env?: any
): Promise<Comment[]> {
  if (env?.DB) {
    try {
      const result = await env.DB.prepare(
        `SELECT c.id, c.topic_id, c.user_id, u.name as user_name, u.avatar as user_avatar,
                c.content, c.created_at
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.topic_id = ? AND c.deleted_at IS NULL
         ORDER BY c.created_at ASC`
      )
        .bind(topicId)
        .all();
      const rows = (result as any).results || result || [];
      if (Array.isArray(rows) && rows.length > 0) return rows as Comment[];
    } catch {
      // fall through to local
    }
  }
  // Local fallback: dynamically import local-db
  try {
    const { getLocalDb } = await import("./local-db");
    const db = await getLocalDb();
    if (db) {
      const rows = db
        .prepare(
          `SELECT c.id, c.topic_id, c.user_id, u.name as user_name, u.avatar as user_avatar,
                  c.content, c.created_at
           FROM comments c
           JOIN users u ON c.user_id = u.id
           WHERE c.topic_id = ? AND c.deleted_at IS NULL
           ORDER BY c.created_at ASC`
        )
        .all(topicId) as Comment[];
      return rows;
    }
  } catch {
    // no local DB
  }
  return [];
}

export function getExcerpt(content: string, maxLen = 120): string {
  const plain = content
    .replace(/[#*>`\n\r]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > maxLen ? plain.slice(0, maxLen) + "…" : plain;
}

export async function getLikesCount(
  targetId: number,
  targetType: "topic" | "comment",
  env?: any
): Promise<number> {
  if (env?.DB) {
    try {
      const result = await env.DB.prepare(
        "SELECT COUNT(*) as count FROM likes WHERE target_id = ? AND target_type = ?"
      )
        .bind(targetId, targetType)
        .first();
      const n = (result as any)?.count;
      return typeof n === "number" ? n : 0;
    } catch {
      return 0;
    }
  }
  return 0;
}

export async function userHasLiked(
  userId: number,
  targetId: number,
  targetType: "topic" | "comment",
  env?: any
): Promise<boolean> {
  if (env?.DB) {
    try {
      const row = await env.DB.prepare(
        "SELECT id FROM likes WHERE user_id = ? AND target_id = ? AND target_type = ?"
      )
        .bind(userId, targetId, targetType)
        .first();
      return !!row;
    } catch {
      return false;
    }
  }
  return false;
}
