const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function findAndRemoveTsbuildinfo(dir) {
  let removed = 0;
  if (!fs.existsSync(dir)) return removed;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isFile() && e.name.endsWith(".tsbuildinfo")) {
      try {
        fs.unlinkSync(full);
        removed++;
      } catch (_) {}
    } else if (e.isDirectory() && e.name !== "node_modules" && !e.name.startsWith(".")) {
      removed += findAndRemoveTsbuildinfo(full);
    }
  }
  return removed;
}

function clearNodeModulesCache(dir) {
  const nm = path.join(dir, "node_modules");
  if (!fs.existsSync(nm)) return 0;
  const cacheDirs = [
    path.join(nm, ".tmp"),
    path.join(nm, ".cache"),
  ];
  let removed = 0;
  for (const cacheDir of cacheDirs) {
    if (!fs.existsSync(cacheDir)) continue;
    const files = fs.readdirSync(cacheDir, { withFileTypes: true });
    for (const f of files) {
      if (f.isFile() && f.name.endsWith(".tsbuildinfo")) {
        try {
          fs.unlinkSync(path.join(cacheDir, f.name));
          removed++;
        } catch (_) {}
      }
    }
  }
  return removed;
}

let total = 0;
total += findAndRemoveTsbuildinfo(root);
total += clearNodeModulesCache(root);
total += clearNodeModulesCache(path.join(root, "apps", "frontend"));
total += clearNodeModulesCache(path.join(root, "apps", "backend"));
total += clearNodeModulesCache(path.join(root, "packages", "shared"));

if (total > 0) {
  console.log("Cleared", total, "TypeScript cache file(s).");
}
