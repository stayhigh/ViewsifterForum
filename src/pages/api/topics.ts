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
  const category = (formData.get("category") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const content = (formData.get("content") as string)?.trim();

  if (!category || !title || !content) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/topic/new?msg=請填寫所有欄位" },
    });
  }

  if (!["AI", "FIN", "LIFE"].includes(category)) {
    return new Response("Invalid category", { status: 400 });
  }

  // Slug: timestamp ensures uniqueness; append cleaned title prefix
  const prefix = title
    .replace(/[^\w\u4e00-\u9fff]/g, "")
    .slice(0, 15)
    .toLowerCase();
  const slug = `${Date.now()}-${prefix || "topic"}`;

  try {
    const result = await env.DB.prepare(
      `INSERT INTO topics (slug, user_id, category, title, content) 
       VALUES (?, ?, ?, ?, ?)`
    )
      .bind(slug, user.id, category, title, content)
      .run();
  } catch (err: any) {
    if (err?.message?.includes("UNIQUE")) {
      return new Response(null, {
        status: 302,
        headers: { Location: "/topic/new?msg=標題已存在，請修改後重試" },
      });
    }
    return new Response(null, {
      status: 302,
      headers: { Location: `/topic/new?msg=發佈失敗，請稍後再試` },
    });
  }

  return new Response(null, {
    status: 302,
    headers: { Location: `/topic/${encodeURIComponent(slug)}` },
  });
};
