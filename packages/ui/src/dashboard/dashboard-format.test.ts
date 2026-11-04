import { describe, expect, it } from "vitest";
import { formatDashboardDate, formatIntervalLabel } from "./dashboard-format";

describe("dashboard format helpers", () => {
  it("formats empty and valid dashboard dates", () => {
    expect(formatDashboardDate(null)).toBe("从未");
    expect(formatDashboardDate("bad date")).toBe("从未");
    expect(formatDashboardDate("2026-06-06T00:00:00.000Z")).toContain("2026");
  });

  it("formats interval labels using the largest exact unit", () => {
    expect(formatIntervalLabel(0)).toBe("0 秒");
    expect(formatIntervalLabel(-1)).toBe("0 秒");
    expect(formatIntervalLabel(172800)).toBe("2 天");
    expect(formatIntervalLabel(7200)).toBe("2 小时");
    expect(formatIntervalLabel(180)).toBe("3 分钟");
    expect(formatIntervalLabel(45)).toBe("45 秒");
  });
});
