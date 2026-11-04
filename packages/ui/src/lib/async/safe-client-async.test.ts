import { describe, expect, it, vi } from "vitest";
import { safeClientAsync } from "./safe-client-async";

describe("safeClientAsync", () => {
  it("does not warn for resolved tasks", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    safeClientAsync("download", Promise.resolve("ok"));
    await Promise.resolve();

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("logs rejected tasks without throwing", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(() => safeClientAsync("download", Promise.reject(new Error("boom")))).not.toThrow();
    await Promise.resolve();

    expect(warnSpy).toHaveBeenCalledWith("[safeClientAsync:download]", "boom");

    safeClientAsync("download", Promise.reject("bad"));
    await Promise.resolve();
    expect(warnSpy).toHaveBeenCalledWith("[safeClientAsync:download]", "bad");
  });
});
