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
  const topicSlug = (formData.get("topic_slug") as string)?.trim();
  const content = (formData.get("content") as string)?.trim();

  if (!topicSlug || !content) {
    return new Response(null, {
      status: 302,
      headers: { Location: `/topic/${topicSlug || ""}?msg=請填寫回覆內容` },
    });
  }

  // Look up topic_id from slug
  const topicRow = await env.DB.prepare(
    "SELECT id FROM topics WHERE slug = ?"
  )
    .bind(topicSlug)
    .first();

  const topicId = (topicRow as any)?.id;
  if (topicId == null) {
    return new Response(null, {
      status: 302,
      headers: { Location: `/topic/${topicSlug}?msg=找不到該文章` },
    });
  }

  try {
    await env.DB.prepare(
      `INSERT INTO comments (topic_id, user_id, content) VALUES (?, ?, ?)`
    )
      .bind(topicId, user.id, content)
      .run();
  } catch {
    return new Response(null, {
      status: 302,
      headers: { Location: `/topic/${topicSlug}?msg=回覆失敗，請稍後再試` },
    });
  }

  return new Response(null, {
    status: 302,
    headers: { Location: `/topic/${topicSlug}` },
  });
};
