import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const userCookie = cookies.get("user_info")?.value;
  if (!userCookie) {
    return new Response("Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const targetId = formData.get("target_id") as string;
  const targetType = formData.get("target_type") as string;

  if (!targetId || !targetType) {
    return new Response("Missing fields", { status: 400 });
  }

  if (!["topic", "comment"].includes(targetType)) {
    return new Response("Invalid target type", { status: 400 });
  }

  const db = (locals as any).runtime?.env?.DB;
  if (!db) {
    return new Response("Database not configured yet. Coming soon.", { status: 503 });
  }

  // TODO: Toggle like in D1 when database is provisioned
  // const user = JSON.parse(userCookie);
  // Check if exists -> delete (unlike). Otherwise -> insert (like).

  return new Response(null, {
    status: 302,
    headers: { Location: request.headers.get("Referer") || "/" },
  });
};
