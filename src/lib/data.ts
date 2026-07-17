import { marked } from "marked";
import type { Topic, Category } from "./types";
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

export function getExcerpt(content: string, maxLen = 120): string {
  const plain = content
    .replace(/[#*>`\n\r]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > maxLen ? plain.slice(0, maxLen) + "…" : plain;
}
