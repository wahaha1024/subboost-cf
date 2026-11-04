import { existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const requireCjs = createRequire(import.meta.url);
const scriptPath = requireCjs.resolve("./ensure-root-node-modules.cjs");
const originalCwd = process.cwd();
let tempRoot = "";

function runEnsureRootNodeModules() {
  delete (requireCjs as any).cache[scriptPath];
  requireCjs(scriptPath);
}

describe("ensure-root-node-modules script", () => {
  beforeEach(() => {
    tempRoot = mkdtempSync(join(tmpdir(), "subboost-local-node-modules-"));
    mkdirSync(join(tempRoot, "app"), { recursive: true });
    process.chdir(join(tempRoot, "app"));
    vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.chdir(originalCwd);
    rmSync(tempRoot, { recursive: true, force: true });
    delete (requireCjs as any).cache[scriptPath];
  });

  it("does nothing when app node_modules is missing or root node_modules already exists", () => {
    runEnsureRootNodeModules();
    expect(existsSync(join(tempRoot, "node_modules"))).toBe(false);

    mkdirSync(join(tempRoot, "app", "node_modules"));
    mkdirSync(join(tempRoot, "node_modules"));
    runEnsureRootNodeModules();
    expect(console.log).not.toHaveBeenCalled();
  });

  it("links the package root to the app node_modules when needed", () => {
    mkdirSync(join(tempRoot, "app", "node_modules"));

    runEnsureRootNodeModules();

    expect(existsSync(join(tempRoot, "node_modules"))).toBe(true);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("[local] linked"));
  });
});
