import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const env = (locals as any).runtime?.env;
  if (!env?.DB) {
    return new Response("Database not available", { status: 500 });
  }

  const userCookie = cookies.get("user_info")?.value;
  if (!userCookie) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/auth/login?msg=請先登入" },
    });
  }

  let user: { id: number };
  try {
    user = JSON.parse(userCookie);
  } catch {
    return new Response("Invalid session", { status: 401 });
  }

  const formData = await request.formData();
  const targetId = parseInt(formData.get("target_id") as string);
  const targetType = (formData.get("target_type") as string)?.trim();

  if (isNaN(targetId) || !targetType) {
    return new Response("Missing fields", { status: 400 });
  }

  if (!["topic", "comment"].includes(targetType)) {
    return new Response("Invalid target type", { status: 400 });
  }

  const referer = request.headers.get("Referer") || "/";

  try {
    // Toggle: check if like exists
    const existing = await env.DB.prepare(
      "SELECT id FROM likes WHERE user_id = ? AND target_id = ? AND target_type = ?"
    )
      .bind(user.id, targetId, targetType)
      .first();

    if (existing) {
      // Unlike: delete
      await env.DB.prepare(
        "DELETE FROM likes WHERE user_id = ? AND target_id = ? AND target_type = ?"
      )
        .bind(user.id, targetId, targetType)
        .run();
    } else {
      // Like: insert
      await env.DB.prepare(
        "INSERT INTO likes (user_id, target_id, target_type) VALUES (?, ?, ?)"
      )
        .bind(user.id, targetId, targetType)
        .run();
    }
  } catch (err: any) {
    if (err?.message?.includes("UNIQUE")) {
      // Already liked (race condition) — unlike
      await env.DB.prepare(
        "DELETE FROM likes WHERE user_id = ? AND target_id = ? AND target_type = ?"
      )
        .bind(user.id, targetId, targetType)
        .run()
        .catch(() => {});
    }
  }

  return new Response(null, {
    status: 302,
    headers: { Location: referer },
  });
};
