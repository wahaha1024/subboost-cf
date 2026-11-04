const fs = require("node:fs");
const path = require("node:path");

function ensureRootNodeModules() {
  const appRoot = process.cwd();
  const packageRoot = path.resolve(appRoot, "..");
  const appNodeModules = path.join(appRoot, "node_modules");
  const rootNodeModules = path.join(packageRoot, "node_modules");

  if (!fs.existsSync(appNodeModules) || fs.existsSync(rootNodeModules)) {
    return;
  }

  const target = path.relative(packageRoot, appNodeModules) || appNodeModules;
  fs.symlinkSync(target, rootNodeModules, process.platform === "win32" ? "junction" : "dir");
  console.log(`[local] linked ${path.relative(appRoot, rootNodeModules)} -> ${target}`);
}

ensureRootNodeModules();
