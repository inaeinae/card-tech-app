import { createClient } from "npm:@supabase/supabase-js@2.45.0";

export async function handleRequest(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    // Authorization 이 있어도 메서드가 POST 가 아니면 405
    const authOnlyCheck = req.headers.get("Authorization");
    if (!authOnlyCheck) return new Response("missing_token", { status: 401 });
    return new Response("method_not_allowed", { status: 405 });
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return new Response("missing_token", { status: 401 });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 토큰으로 user 확인
  const { data: userRes, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userRes?.user) return new Response("unauthorized", { status: 401 });

  // auth.users 삭제 → public.* 테이블은 ON DELETE CASCADE 로 정리
  const { error: delErr } = await admin.auth.admin.deleteUser(userRes.user.id);
  if (delErr) return new Response(`delete_failed:${delErr.message}`, { status: 500 });

  return new Response(JSON.stringify({ deleted: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

Deno.serve(handleRequest);
