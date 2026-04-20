import { assertEquals, assertExists } from "std/assert/mod.ts";
import { handleRequest } from "./index.ts";

// fetch stub — 카카오 API 응답 mock
function withMockedFetch(
  mock: (req: Request) => Promise<Response>,
  fn: () => Promise<void>,
) {
  return async () => {
    const orig = globalThis.fetch;
    globalThis.fetch = ((input: Request | string | URL, init?: RequestInit) => {
      const req = input instanceof Request ? input : new Request(input, init);
      return mock(req);
    }) as typeof fetch;
    try { await fn(); } finally { globalThis.fetch = orig; }
  };
}

Deno.test(
  "POST without access_token → 400",
  withMockedFetch(
    async () => new Response("{}"),
    async () => {
      const res = await handleRequest(
        new Request("http://local/kakao-oauth", {
          method: "POST",
          body: JSON.stringify({}),
        }),
      );
      assertEquals(res.status, 400);
    },
  ),
);

Deno.test(
  "invalid kakao token → 401",
  withMockedFetch(
    async (req) => {
      if (req.url.includes("kapi.kakao.com")) {
        return new Response("unauthorized", { status: 401 });
      }
      return new Response("{}");
    },
    async () => {
      const res = await handleRequest(
        new Request("http://local/kakao-oauth", {
          method: "POST",
          body: JSON.stringify({ access_token: "bad" }),
        }),
      );
      assertEquals(res.status, 401);
    },
  ),
);

Deno.test(
  "valid kakao token → returns supabase session",
  withMockedFetch(
    async (req) => {
      if (req.url.includes("kapi.kakao.com")) {
        return new Response(
          JSON.stringify({
            id: 999001,
            kakao_account: { email: "kk@example.com", profile: { nickname: "카테크" } },
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }
      // Supabase Admin API (generateLink / admin.createUser 등) — mock
      if (req.url.includes("/auth/v1/admin/")) {
        return new Response(
          JSON.stringify({
            user: { id: "00000000-0000-0000-0000-000000000001" },
            session: { access_token: "jwt.body.sig", refresh_token: "rt" },
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }
      return new Response("{}");
    },
    async () => {
      const res = await handleRequest(
        new Request("http://local/kakao-oauth", {
          method: "POST",
          body: JSON.stringify({ access_token: "good" }),
        }),
      );
      assertEquals(res.status, 200);
      const body = await res.json();
      assertExists(body.access_token);
      assertExists(body.refresh_token);
    },
  ),
);
