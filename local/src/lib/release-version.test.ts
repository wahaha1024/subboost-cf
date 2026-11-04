import { describe, expect, it } from "vitest";
import { compareStableVersions, parseStableVersion, type StableVersion } from "./release-version";

function stable(value: string): StableVersion {
  const parsed = parseStableVersion(value);
  if (!parsed) throw new Error(`expected ${value} to be a stable version`);
  return parsed;
}

describe("release version helpers", () => {
  it("parses stable v-prefixed or plain semver values", () => {
    expect(parseStableVersion(" v2.3.21 ")).toEqual({
      major: 2,
      minor: 3,
      patch: 21,
      version: "2.3.21",
    });
    expect(parseStableVersion("2.3.21")?.version).toBe("2.3.21");
  });

  it("rejects blank, non-string, prerelease, or leading-zero versions", () => {
    expect(parseStableVersion(undefined)).toBeNull();
    expect(parseStableVersion("   ")).toBeNull();
    expect(parseStableVersion("v2.3.21-beta.1")).toBeNull();
    expect(parseStableVersion("02.3.21")).toBeNull();
  });

  it("compares major, minor, and patch segments in order", () => {
    expect(compareStableVersions(stable("3.0.0"), stable("2.9.9"))).toBeGreaterThan(0);
    expect(compareStableVersions(stable("2.4.0"), stable("2.3.9"))).toBeGreaterThan(0);
    expect(compareStableVersions(stable("2.3.22"), stable("2.3.21"))).toBeGreaterThan(0);
    expect(compareStableVersions(stable("2.3.21"), stable("2.3.21"))).toBe(0);
    expect(compareStableVersions(stable("2.3.20"), stable("2.3.21"))).toBeLessThan(0);
  });
});
