import { assertEquals } from "jsr:@std/assert@1";
import { handleRequest } from "./index.ts";

Deno.test("Authorization 헤더 없으면 401", async () => {
  const res = await handleRequest(new Request("http://x", { method: "POST" }));
  assertEquals(res.status, 401);
});

Deno.test("POST 아닌 메서드 405", async () => {
  const res = await handleRequest(
    new Request("http://x", { method: "GET", headers: { Authorization: "Bearer x" } }),
  );
  assertEquals(res.status, 405);
});
