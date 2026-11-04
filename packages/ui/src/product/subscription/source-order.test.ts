import { describe, expect, it } from "vitest";
import { moveSubscriptionSource } from "./source-order";

describe("moveSubscriptionSource", () => {
  const sources = [
    { id: "a", content: "A" },
    { id: "b", content: "B" },
    { id: "c", content: "C" },
  ] as any[];

  it("moves sources up and down without mutating the input array", () => {
    expect(moveSubscriptionSource(sources, "b", "up").map((source) => source.id)).toEqual(["b", "a", "c"]);
    expect(moveSubscriptionSource(sources, "b", "down").map((source) => source.id)).toEqual(["a", "c", "b"]);
    expect(sources.map((source) => source.id)).toEqual(["a", "b", "c"]);
  });

  it("returns the original array for missing or boundary moves", () => {
    expect(moveSubscriptionSource(sources, "missing", "up")).toBe(sources);
    expect(moveSubscriptionSource(sources, "a", "up")).toBe(sources);
    expect(moveSubscriptionSource(sources, "c", "down")).toBe(sources);
  });
});
