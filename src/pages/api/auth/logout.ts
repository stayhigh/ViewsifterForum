import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ cookies }) => {
  cookies.delete("session", { path: "/" });
  cookies.delete("user_info", { path: "/" });

  return new Response(null, {
    status: 302,
    headers: { Location: "/" },
  });
};
