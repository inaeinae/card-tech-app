import { createClient } from "npm:@supabase/supabase-js@2.45.0";
import { fetchKakaoUser } from "./kakao.ts";

// 내부용 가상 이메일 — 카카오 id를 로컬 네임스페이스에 매핑
function kakaoEmail(kakaoId: number): string {
  return `kakao_${kakaoId}@kakao.local`;
}

export async function handleRequest(req: Request): Promise<Response> {
  // 동적으로 환경변수 읽기 (테스트 시 env.set 사용 가능)
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (req.method !== "POST") {
    return new Response("method_not_allowed", { status: 405 });
  }

  let body: { access_token?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("invalid_json", { status: 400 });
  }
  if (!body.access_token) {
    return new Response("missing_access_token", { status: 400 });
  }

  // 1. 카카오 access_token 검증
  let kakaoUser;
  try {
    kakaoUser = await fetchKakaoUser(body.access_token);
  } catch {
    return new Response("invalid_kakao_token", { status: 401 });
  }

  const email = kakaoEmail(kakaoUser.id);
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 2. 사용자 조회/생성 (idempotent)
  let userId: string | null = null;
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: {
      provider: "kakao",
      kakao_id: kakaoUser.id,
      nickname: kakaoUser.kakao_account?.profile?.nickname ?? null,
    },
  });
  if (created?.user) {
    userId = created.user.id;
  } else if (createErr?.message?.includes("already") || (createErr as { status?: number })?.status === 422) {
    // 이미 존재하는 사용자 재조회
    const { data: list } = await admin.auth.admin.listUsers();
    userId = list?.users.find((u: { email?: string; id: string }) => u.email === email)?.id ?? null;
  } else if (createErr) {
    return new Response(`admin_create_failed:${createErr.message}`, { status: 500 });
  }
  if (!userId) {
    return new Response("user_resolve_failed", { status: 500 });
  }

  // 3. 세션 JWT 발급 — admin REST API 직접 호출로 raw 응답 처리
  //    SDK의 generateLink xform이 session을 버리므로, fetch로 직접 호출
  const generateRes = await fetch(
    `${SUPABASE_URL}/auth/v1/admin/generate_link`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        apikey: SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({ type: "magiclink", email }),
    },
  );

  if (!generateRes.ok) {
    return new Response("link_failed", { status: 500 });
  }

  const linkData = await generateRes.json();

  // session이 직접 포함된 경우 (테스트 mock 및 일부 환경)
  if (linkData?.session?.access_token) {
    return new Response(
      JSON.stringify({
        access_token: linkData.session.access_token,
        refresh_token: linkData.session.refresh_token,
        user_id: userId,
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  }

  // hashed_token이 있는 경우 — verifyOtp 경로
  const hashedToken: string | undefined = linkData?.hashed_token;
  if (!hashedToken) {
    return new Response("link_failed", { status: 500 });
  }

  const { data: verified, error: verifyErr } = await admin.auth.verifyOtp({
    type: "magiclink",
    token_hash: hashedToken,
  });
  if (verifyErr || !verified?.session) {
    return new Response("verify_failed", { status: 500 });
  }

  return new Response(
    JSON.stringify({
      access_token: verified.session.access_token,
      refresh_token: verified.session.refresh_token,
      user_id: userId,
    }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
}

Deno.serve(handleRequest);
