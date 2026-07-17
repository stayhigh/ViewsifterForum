import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  const env = (locals as any).runtime?.env;
  
  if (!env?.DB) {
    return new Response(JSON.stringify({ error: "No DB binding" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  const email = "a@b.com";
  const rawFirst = await env.DB.prepare(
    "SELECT id FROM users WHERE email = ?"
  )
    .bind(email)
    .first();

  const rawAll = await env.DB.prepare(
    "SELECT id FROM users WHERE email = ?"
  )
    .bind(email)
    .all();

  const allUsers = await env.DB.prepare(
    "SELECT id, email FROM users LIMIT 5"
  ).all();

  return new Response(JSON.stringify({
    email,
    first_result: rawFirst,
    first_is_null: rawFirst === null,
    all_result: rawAll,
    all_type: typeof rawAll,
    all_results: (rawAll as any).results,
    all_length: Array.isArray((rawAll as any).results) ? (rawAll as any).results.length : 'not_array',
    all_is_array: Array.isArray((rawAll as any).results),
    all_users: allUsers.results || allUsers,
  }, null, 2), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};
