import { createRequire } from "node:module";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

type StartStandalone = {
  assertBuilt(serverPath: string, exit?: (code: number) => never): void;
  findStandaloneServer(root?: string): string;
  getStandaloneContext(root?: string): { appDirectoryName: string; appRoot: string; standaloneBase: string };
  syncDirectory(source: string, target: string): void;
};

const requireCjs = createRequire(import.meta.url);
const standalone = requireCjs("./start-standalone.cjs") as StartStandalone;

let tempRoot: string | null = null;

function makeTempRoot() {
  tempRoot = mkdtempSync(join(tmpdir(), "subboost-standalone-"));
  return tempRoot;
}

describe("local standalone start helpers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    if (tempRoot) rmSync(tempRoot, { recursive: true, force: true });
    tempRoot = null;
  });

  it("builds standalone paths and finds direct Next server candidates", () => {
    const root = makeTempRoot();
    const context = standalone.getStandaloneContext(root);
    const serverPath = join(context.standaloneBase, "apps", basename(root), "server.js");
    mkdirSync(join(serverPath, ".."), { recursive: true });
    writeFileSync(serverPath, "server");

    expect(context.appDirectoryName).toBe(basename(root));
    expect(standalone.findStandaloneServer(root)).toBe(serverPath);
  });

  it("falls back to recursive server.js discovery", () => {
    const root = makeTempRoot();
    const nestedServer = join(root, ".next", "standalone", "one", "two", "server.js");
    mkdirSync(join(nestedServer, ".."), { recursive: true });
    writeFileSync(nestedServer, "server");

    expect(standalone.findStandaloneServer(root)).toBe(nestedServer);
  });

  it("reports a missing standalone build through the provided exit function", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const exit = vi.fn((code: number) => {
      throw new Error(`exit:${code}`);
    });

    expect(() => standalone.assertBuilt("missing-server.js", exit)).toThrow("exit:1");
    expect(errorSpy).toHaveBeenCalledWith("[local] standalone build is missing. Run `npm run build` before `npm run start`.");
  });

  it("syncs directories and ignores missing sources", () => {
    const root = makeTempRoot();
    const source = join(root, "source");
    const target = join(root, "target");
    mkdirSync(source, { recursive: true });
    mkdirSync(target, { recursive: true });
    writeFileSync(join(source, "asset.txt"), "fresh");
    writeFileSync(join(target, "old.txt"), "old");

    standalone.syncDirectory(join(root, "missing"), join(root, "ignored"));
    standalone.syncDirectory(source, target);

    expect(readFileSync(join(target, "asset.txt"), "utf8")).toBe("fresh");
    expect(() => readFileSync(join(target, "old.txt"), "utf8")).toThrow();
  });
});
