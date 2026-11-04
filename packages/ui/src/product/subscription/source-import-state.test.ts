import { describe, expect, it } from "vitest";
import { isSourcePendingImport, markSourceAsPendingImport } from "./source-import-state";

function source(overrides: Record<string, unknown> = {}) {
  return {
    id: "source-1",
    type: "url",
    content: " https://example.test/sub ",
    parsed: true,
    parsing: false,
    nodeCount: 1,
    subscriptionUserInfo: { upload: 1 },
    error: "bad",
    errorInfo: { message: "bad" },
    lastParsedContent: "https://example.test/sub",
    lastParsedTag: "tag-a",
    tag: "tag-a",
    lastParsedNameTemplate: "name-a",
    nameTemplate: "name-a",
    ...overrides,
  } as any;
}

describe("subscription source import state", () => {
  it("marks parsed source state as pending import", () => {
    const original = source();
    expect(markSourceAsPendingImport(original)).toEqual({
      ...original,
      parsed: false,
      parsing: false,
      nodeCount: undefined,
      subscriptionUserInfo: undefined,
      error: undefined,
      errorInfo: undefined,
    });

    const alreadyPending = source({
      parsed: false,
      parsing: false,
      nodeCount: undefined,
      subscriptionUserInfo: undefined,
      error: undefined,
      errorInfo: undefined,
    });
    expect(markSourceAsPendingImport(alreadyPending)).toBe(alreadyPending);
  });

  it("detects pending import from parsing state, unparsed state, changed content, tag, or name template", () => {
    expect(isSourcePendingImport(source({ parsing: true }))).toBe(true);
    expect(isSourcePendingImport(source({ parsed: false }))).toBe(true);
    expect(isSourcePendingImport(source({ content: "https://changed.example/sub" }))).toBe(true);
    expect(isSourcePendingImport(source({ tag: "tag-b" }))).toBe(true);
    expect(isSourcePendingImport(source({ nameTemplate: "name-b" }))).toBe(true);
  });

  it("ignores empty content and unchanged parsed sources", () => {
    expect(isSourcePendingImport(source({ content: "   " }))).toBe(false);
    expect(isSourcePendingImport(source())).toBe(false);
    expect(
      isSourcePendingImport(
        source({
          type: "yaml",
          content: " proxies: [] ",
          lastParsedContent: "proxies: []",
        })
      )
    ).toBe(false);
  });
});
