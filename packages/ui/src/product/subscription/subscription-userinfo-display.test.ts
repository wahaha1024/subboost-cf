import { describe, expect, it } from "vitest";
import type { ParsedNode } from "@subboost/core/types/node";
import { getSubscriptionUserInfoDisplay } from "./subscription-userinfo-display";

function infoNode(name: string): ParsedNode {
  return { name, type: "direct" } as ParsedNode;
}

describe("getSubscriptionUserInfoDisplay", () => {
  it("formats traffic totals and expiry dates from subscription-userinfo", () => {
    expect(
      getSubscriptionUserInfoDisplay({
        upload: 512 * 1024 ** 2,
        download: 1.5 * 1024 ** 3,
        total: 10 * 1024 ** 3,
        expire: Math.floor(Date.UTC(2026, 1, 19, 12, 0, 0) / 1000),
      })
    ).toEqual({
      traffic: "2.00 GB/10.0 GB",
      expire: "2026-02-19",
    });
  });

  it("formats used traffic when total is missing", () => {
    expect(getSubscriptionUserInfoDisplay({ upload: 500, download: 524 })).toEqual({
      traffic: "1.00 KB",
      expire: null,
    });
  });

  it("falls back to parsed account-info nodes when header data is invalid", () => {
    expect(
      getSubscriptionUserInfoDisplay({ upload: 2048, total: 1024 }, [
        infoNode("已用流量: 2 GB"),
        infoNode("总流量: 10 GB"),
        infoNode("套餐到期: 2026-02-19"),
      ])
    ).toEqual({
      traffic: "2.00 GB/10.0 GB",
      expire: "2026-02-19",
    });
  });

  it("returns empty labels when no meaningful info is available", () => {
    expect(getSubscriptionUserInfoDisplay()).toEqual({ traffic: null, expire: null });
    expect(getSubscriptionUserInfoDisplay({ upload: Number.NaN, download: -1, expire: 1 })).toEqual({
      traffic: null,
      expire: null,
    });
  });
});
