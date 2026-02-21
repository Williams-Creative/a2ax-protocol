#!/usr/bin/env node
/**
 * Ensure protocol cannot import from extensions, sdk, admin, billing, enterprise, onboarding, analytics.
 * Fails on violation. Self-contained for protocol forks.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROTOCOL_SRC = join(__dirname, "..", "src");
const FORBIDDEN_PATTERNS = [
  /from\s+["']@a2ax\/extensions/,
  /from\s+["']\.\.\/extensions/,
  /from\s+["']\.\.\/\.\.\/extensions/,
  /from\s+["']@a2ax\/sdk/,
  /from\s+["']a2ax-sdk/,
  /from\s+["']\.\.\/sdk/,
  /from\s+["']\.\.\/\.\.\/sdk/,
  /from\s+["'].*\/admin/,
  /from\s+["'].*\/billing/,
  /from\s+["'].*\/enterprise/,
  /from\s+["'].*\/onboarding/,
  /from\s+["'].*\/analytics/,
  /from\s+["'].*\/dashboard/
];

function walkDir(dir, files = []) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory() && e.name !== "node_modules") {
      walkDir(full, files);
    } else if (e.name.endsWith(".ts") && !e.name.endsWith(".d.ts")) {
      files.push(full);
    }
  }
  return files;
}

let failed = false;
const files = walkDir(PROTOCOL_SRC);

for (const file of files) {
  const content = readFileSync(file, "utf8");
  const rel = file.replace(PROTOCOL_SRC, "src").replace(/\\/g, "/");
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(content)) {
      console.error(`[PROTOCOL LINT] ${rel}: Forbidden import pattern: ${pattern}`);
      failed = true;
    }
  }
}

if (failed) {
  process.exit(1);
}
console.log("Protocol import check passed.");
