import { describe, expect, it } from "vitest";
import { SubscriptionImportError } from "@subboost/core/subscription/import-error";
import { readJsonResponse, readSourceImportResponse } from "./client-response";

describe("client response readers", () => {
  it("returns parsed JSON payloads and treats empty or invalid JSON as empty objects", async () => {
    await expect(readJsonResponse<{ ok: boolean }>(new Response(JSON.stringify({ ok: true })))).resolves.toEqual({ ok: true });
    await expect(readJsonResponse<Record<string, never>>(new Response(""))).resolves.toEqual({});
    await expect(readJsonResponse<Record<string, never>>(new Response("not json"))).resolves.toEqual({});
  });

  it("uses API error messages or fallback messages for failed JSON responses", async () => {
    await expect(readJsonResponse(new Response(JSON.stringify({ error: "denied" }), { status: 403 }))).rejects.toThrow("denied");
    await expect(readJsonResponse(new Response("{}", { status: 500 }), "fallback")).rejects.toThrow("fallback");
  });

  it("reads source import responses and raises structured import errors", async () => {
    await expect(
      readSourceImportResponse(
        new Response(
          JSON.stringify({
            content: "proxies: []",
            headers: { "subscription-userinfo": "upload=1" },
            parseResult: { nodes: [] },
          })
        )
      )
    ).resolves.toEqual({
      content: "proxies: []",
      headers: { "subscription-userinfo": "upload=1" },
      parseResult: { nodes: [] },
    });

    const structured = readSourceImportResponse(
      new Response(
        JSON.stringify({
          errorInfo: {
            category: "security",
            message: "禁止访问内网地址",
            suggestedActions: ["使用公网地址"],
            at: 1,
          },
        }),
        { status: 400 }
      )
    );

    await expect(structured).rejects.toBeInstanceOf(SubscriptionImportError);
    await expect(structured).rejects.toMatchObject({
      info: {
        category: "security",
        message: "禁止访问内网地址",
      },
    });

    await expect(readSourceImportResponse(new Response(JSON.stringify({ error: "获取失败" }), { status: 500 }))).rejects.toThrow(
      "获取失败"
    );
  });
});
