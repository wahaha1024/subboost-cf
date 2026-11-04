import { describe, expect, it } from "vitest";
import { sourceTypeInfo } from "./constants";

describe("advanced mode sourceTypeInfo", () => {
  it("describes all source types with labels, placeholders, and icons", () => {
    expect(Object.keys(sourceTypeInfo).sort()).toEqual(["nodes", "url", "yaml"]);
    expect(sourceTypeInfo.url).toMatchObject({
      label: "订阅链接",
      placeholder: "https://example.com/sub?token=xxx",
    });
    expect(sourceTypeInfo.yaml.placeholder).toContain("proxies:");
    expect(sourceTypeInfo.nodes.placeholder).toContain("hysteria2://");
    expect(sourceTypeInfo.url.icon).toBeTruthy();
    expect(sourceTypeInfo.yaml.icon).toBeTruthy();
    expect(sourceTypeInfo.nodes.icon).toBeTruthy();
  });
});
