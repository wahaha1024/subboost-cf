import { describe, expect, it } from "vitest";

import { parseCurrentTemplateTab, toEngagementCount } from "./index";

describe("template helpers", () => {
  it("parses only the supported current tabs", () => {
    expect(
      parseCurrentTemplateTab(null, {
        supportedTabs: ["default", "my"],
        defaultTab: "default",
      })
    ).toEqual({ ok: true, tab: "default" });
    expect(
      parseCurrentTemplateTab(" my ", {
        supportedTabs: ["default", "my"],
        defaultTab: "default",
      })
    ).toEqual({ ok: true, tab: "my" });
    expect(
      parseCurrentTemplateTab("catalog", {
        supportedTabs: ["default", "my"],
        defaultTab: "default",
      })
    ).toEqual({ ok: false, value: "catalog" });
  });

  it("normalizes engagement counters without exposing legacy names", () => {
    expect(toEngagementCount(3)).toBe(3);
    expect(toEngagementCount(-2)).toBe(0);
    expect(toEngagementCount(Number.NaN)).toBe(0);
    expect(toEngagementCount("5")).toBe(0);
  });
});
