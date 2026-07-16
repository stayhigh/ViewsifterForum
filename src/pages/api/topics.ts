import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const userCookie = cookies.get("user_info")?.value;
  if (!userCookie) {
    return new Response("Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const category = formData.get("category") as string;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  if (!category || !title || !content) {
    return new Response("Missing fields", { status: 400 });
  }

  if (!["AI", "FIN", "LIFE"].includes(category)) {
    return new Response("Invalid category", { status: 400 });
  }

  // Generate slug from title
  const slug = title
    .toLowerCase()
    .replace(/[：:？?！!，,。\.、\s]+/g, "-")
    .replace(/[^\w\u4e00-\u9fff-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const db = (locals as any).runtime?.env?.DB;
  if (!db) {
    return new Response("Database not configured yet. Coming soon.", { status: 503 });
  }

  // TODO: Insert into D1 topics table when database is provisioned
  // const user = JSON.parse(userCookie);
  // await db.prepare(
  //   "INSERT INTO topics (slug, user_id, category, title, content) VALUES (?, ?, ?, ?, ?)"
  // ).bind(slug, 1, category, title, content).run();

  return new Response(null, {
    status: 302,
    headers: { Location: `/topic/${slug}` },
  });
};
