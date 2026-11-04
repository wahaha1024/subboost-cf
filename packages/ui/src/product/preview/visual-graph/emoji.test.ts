import { describe, expect, it } from "vitest";
import { getDialerEmojiFromName } from "./emoji";

describe("getDialerEmojiFromName", () => {
  it("keeps existing flag emoji prefixes", () => {
    expect(getDialerEmojiFromName("🇯🇵 日本中转")).toBe("🇯🇵");
  });

  it("converts two-letter country codes into flag emoji", () => {
    expect(getDialerEmojiFromName("us relay")).toBe("🇺🇸");
    expect(getDialerEmojiFromName("HK 中转")).toBe("🇭🇰");
  });

  it("falls back to a link emoji for blank or non-country prefixes", () => {
    expect(getDialerEmojiFromName("")).toBe("🔗");
    expect(getDialerEmojiFromName("global relay")).toBe("🔗");
  });
});
