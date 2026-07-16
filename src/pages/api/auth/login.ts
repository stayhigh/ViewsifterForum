import type { APIRoute } from "astro";
import { loginUser, createSessionToken } from "../../../lib/auth";

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const env = (locals as any).runtime?.env;
  if (!env?.DB) {
    return new Response("Database not available", { status: 500 });
  }

  const formData = await request.formData();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/auth/login?msg=請輸入 Email 和密碼" },
    });
  }

  const user = await loginUser(env, email, password);

  if (!user) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/auth/login?msg=Email 或密碼錯誤" },
    });
  }

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
};
