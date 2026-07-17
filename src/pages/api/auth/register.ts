import type { APIRoute } from "astro";
import { registerUser, createSessionToken } from "../../../lib/auth";

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const env = (locals as any).runtime?.env;
  if (!env?.DB) {
    return new Response("Database not available", { status: 500 });
  }

  const formData = await request.formData();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const name = (formData.get("name") as string)?.trim();

  if (!email || !password || !name) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/auth/register?msg=請填寫所有欄位" },
    });
  }

  if (password.length < 8) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/auth/register?msg=密碼至少需要 8 個字元" },
    });
  }

  // Check if email already exists
  try {
    const result = await env.DB.prepare(
      "SELECT id FROM users WHERE email = ?"
    )
      .bind(email)
      .all();

    // D1 .all() returns { results: [...] }
    const rows = (result as any).results || result || [];
    if (Array.isArray(rows) && rows.length > 0) {
      return new Response(null, {
        status: 302,
        headers: { Location: "/auth/register?msg=此 Email 已被註冊" },
      });
    }

    const user = await registerUser(env, email, password, name);
    const token = createSessionToken();

    cookies.set("session", token, {
      path: "/",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    cookies.set("user_info", JSON.stringify(user), {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    return new Response(null, {
      status: 302,
      headers: { Location: "/" },
    });
  } catch (err: any) {
    const msg = err?.message?.includes("UNIQUE")
      ? "此 Email 已被註冊"
      : "註冊失敗，請稍後再試";
    return new Response(null, {
      status: 302,
      headers: { Location: `/auth/register?msg=${encodeURIComponent(msg)}` },
    });
  }
};
