import { describe, expect, it } from "vitest";
import { buildSourceDisplayLabel } from "./source-display-label";

describe("buildSourceDisplayLabel", () => {
  it("prefers trimmed custom tags and omits order for a single source", () => {
    expect(buildSourceDisplayLabel({ typeLabel: "订阅链接", tag: " HK ", order: 3, total: 1 })).toBe("HK");
  });

  it("falls back to type labels or a generic source label", () => {
    expect(buildSourceDisplayLabel({ typeLabel: " YAML 配置 ", order: 1, total: 2 })).toBe("YAML 配置 #1");
    expect(buildSourceDisplayLabel({ typeLabel: " ", order: 2, total: 3 })).toBe("导入源 #2");
  });

  it("normalizes invalid order values and supports prefix placement", () => {
    expect(
      buildSourceDisplayLabel({
        typeLabel: "节点链接",
        order: Number.NaN,
        total: 2.8,
        orderPlacement: "prefix",
      })
    ).toBe("#1 节点链接");
  });
});
