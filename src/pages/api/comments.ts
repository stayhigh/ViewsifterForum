import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const userCookie = cookies.get("user_info")?.value;
  if (!userCookie) {
    return new Response("Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const topicSlug = formData.get("topic_slug") as string;
  const content = formData.get("content") as string;

  if (!topicSlug || !content) {
    return new Response("Missing fields", { status: 400 });
  }

  const db = (locals as any).runtime?.env?.DB;
  if (!db) {
    return new Response("Database not configured yet. Coming soon.", { status: 503 });
  }

  // TODO: Insert comment into D1 when database is provisioned
  // const user = JSON.parse(userCookie);
  // await db.prepare(
  //   "INSERT INTO comments (topic_id, user_id, content) VALUES (?, ?, ?)"
  // ).bind(topicId, userId, content).run();

  return new Response(null, {
    status: 302,
    headers: { Location: `/topic/${topicSlug}` },
  });
};
