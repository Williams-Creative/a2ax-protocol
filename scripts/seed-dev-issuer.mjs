#!/usr/bin/env node
/**
 * Seed a dev issuer into the community bundle for local testing.
 * DEV ONLY — not for production. Run from project root.
 *
 * Usage: npm run seed:dev-issuer
 * Then: npx tsx cli/trust-bundle-install.ts community
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { exportJWK, generateKeyPair } from "jose";

const __dirname = dirname(fileURLToPath(import.meta.url));

function findProjectRoot(startDir) {
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

async function main() {
  const projectRoot = findProjectRoot(process.cwd());
  const manifestPath = join(projectRoot, "bundles", "community", "manifest.json");

  if (!existsSync(manifestPath)) {
    console.error("[a2ax] bundles/community/manifest.json not found. Run from project root.");
    process.exit(1);
  }

  const { publicKey } = await generateKeyPair("EdDSA", { crv: "Ed25519" });
  const publicJwk = await exportJWK(publicKey);
  const publicKeyOnly = { kty: publicJwk.kty, crv: publicJwk.crv, x: publicJwk.x };

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const existing = manifest.issuers?.find((i) => i.issuerId === "a2ax-sandbox");
  if (existing) {
    existing.publicKey = { format: "jwk", key: publicKeyOnly };
  } else {
    manifest.issuers = manifest.issuers ?? [];
    manifest.issuers.push({
      issuerId: "a2ax-sandbox",
      publicKey: { format: "jwk", key: publicKeyOnly },
      metadata: {
        displayName: "A2AX Sandbox (dev only, not for production)",
        assuranceLevel: 0
      }
    });
  }

  mkdirSync(dirname(manifestPath), { recursive: true });
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");

  console.log("[a2ax] Seeded dev issuer 'a2ax-sandbox' into bundles/community/manifest.json");
  console.log("[a2ax] Run: npx tsx cli/trust-bundle-install.ts community");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
