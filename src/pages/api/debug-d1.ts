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
  const raw = await env.DB.prepare(
    "SELECT id FROM users WHERE email = ?"
  )
    .bind(email)
    .first();

  const allUsers = await env.DB.prepare(
    "SELECT id, email FROM users LIMIT 5"
  ).all();

  return new Response(JSON.stringify({
    email,
    raw_result: raw,
    raw_type: typeof raw,
    raw_is_null: raw === null,
    raw_is_undefined: raw === undefined,
    raw_truthy: !!raw,
    raw_keys: raw ? Object.keys(raw) : [],
    raw_json: JSON.stringify(raw),
    all_users: allUsers.results || allUsers,
  }, null, 2), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};
