#!/usr/bin/env node
/**
 * A2AX trust bundle installer.
 * Usage: npx tsx cli/trust-bundle-install.ts <bundle-name>
 * Copies issuer keys into trust store. Does not modify core protocol.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

type TrustBundle = {
  name: string;
  version: string;
  issuers: Array<{
    issuerId: string;
    publicKey: { format: "jwk"; key: Record<string, unknown> } | { format: "pem"; key: string };
    metadata?: { displayName?: string; jurisdiction?: string; assuranceLevel?: number };
  }>;
};

function findProjectRoot(startDir: string): string {
  let dir = resolve(startDir);
  for (;;) {
    if (existsSync(join(dir, "bundles")) && existsSync(join(dir, "config"))) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return resolve(startDir);
}

function validateTrustBundle(obj: unknown): TrustBundle {
  if (!obj || typeof obj !== "object") {
    throw new Error("Invalid manifest: expected object");
  }
  const o = obj as Record<string, unknown>;
  if (typeof o.name !== "string" || !o.name) {
    throw new Error("Invalid manifest: 'name' must be a non-empty string");
  }
  if (typeof o.version !== "string" || !o.version) {
    throw new Error("Invalid manifest: 'version' must be a non-empty string");
  }
  if (!Array.isArray(o.issuers)) {
    throw new Error("Invalid manifest: 'issuers' must be an array");
  }
  for (let i = 0; i < o.issuers.length; i++) {
    const issuer = o.issuers[i];
    if (!issuer || typeof issuer !== "object") {
      throw new Error(`Invalid manifest: issuers[${i}] must be an object`);
    }
    const iss = issuer as Record<string, unknown>;
    if (typeof iss.issuerId !== "string" || !iss.issuerId) {
      throw new Error(`Invalid manifest: issuers[${i}].issuerId must be a non-empty string`);
    }
    if (!iss.publicKey || typeof iss.publicKey !== "object") {
      throw new Error(`Invalid manifest: issuers[${i}].publicKey must be an object`);
    }
    const pk = iss.publicKey as Record<string, unknown>;
    if (pk.format !== "jwk" && pk.format !== "pem") {
      throw new Error(`Invalid manifest: issuers[${i}].publicKey.format must be 'jwk' or 'pem'`);
    }
    if (pk.format === "jwk") {
      if (!pk.key || typeof pk.key !== "object") {
        throw new Error(`Invalid manifest: issuers[${i}].publicKey.key must be valid JWK object`);
      }
    } else {
      if (typeof pk.key !== "string") {
        throw new Error(`Invalid manifest: issuers[${i}].publicKey.key must be PEM string`);
      }
    }
  }
  return obj as TrustBundle;
}

function main(): void {
  const bundleName = process.argv[2] ?? "community";
  if (!bundleName || bundleName.includes("/") || bundleName.includes("..")) {
    console.error("[a2ax] Invalid bundle name. Use: community, enterprise, or a valid bundle name.");
    process.exit(1);
  }

  const projectRoot = findProjectRoot(process.cwd());
  const bundlePath = join(projectRoot, "bundles", bundleName, "manifest.json");

  if (!existsSync(bundlePath)) {
    console.error(`[a2ax] Bundle not found: ${bundlePath}`);
    console.error(`[a2ax] Run from project root or ensure bundles/${bundleName}/manifest.json exists.`);
    process.exit(1);
  }

  let manifest: TrustBundle;
  try {
    const raw = readFileSync(bundlePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    manifest = validateTrustBundle(parsed);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[a2ax] Invalid manifest: ${msg}`);
    process.exit(1);
    throw new Error("unreachable");
  }

  const anchorsDir = join(projectRoot, "config", "trust", "anchors");
  try {
    mkdirSync(anchorsDir, { recursive: true });
  } catch (err) {
    console.error(`[a2ax] Failed to create anchors directory: ${anchorsDir}`);
    process.exit(1);
  }

  let installed = 0;
  for (const issuer of manifest.issuers) {
    const ext = issuer.publicKey.format === "jwk" ? ".json" : ".pem";
    const filePath = join(anchorsDir, `${issuer.issuerId}${ext}`);
    try {
      if (issuer.publicKey.format === "jwk") {
        writeFileSync(filePath, JSON.stringify(issuer.publicKey.key, null, 2), "utf8");
      } else {
        writeFileSync(filePath, issuer.publicKey.key, "utf8");
      }
      installed++;
    } catch (err) {
      console.error(`[a2ax] Failed to write ${filePath}:`, err);
      process.exit(1);
    }
  }

  console.log(`[a2ax] Installed ${installed} issuer(s) from bundle '${manifest.name}'`);
}

main();
