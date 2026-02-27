#!/usr/bin/env node
/**
 * Export issuer public key for trust store.
 * Reads backend/api/secrets/issuer_private_jwk.json and writes public key to config/trust/anchors/a2ax-core-protocol.json.
 * Run after keygen:issuer. Required for portable verification of server-issued certificates.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const secretsPath = join(projectRoot, "backend", "api", "secrets", "issuer_private_jwk.json");
const anchorsDir = join(projectRoot, "config", "trust", "anchors");
const outputPath = join(anchorsDir, "a2ax-core-protocol.json");

if (!existsSync(secretsPath)) {
  console.error("[a2ax] issuer_private_jwk.json not found. Run: cd backend/api && npm run keygen:issuer");
  process.exit(1);
}

const jwk = JSON.parse(readFileSync(secretsPath, "utf8"));
const publicKey = { kty: jwk.kty, crv: jwk.crv, x: jwk.x };
if (!publicKey.kty || !publicKey.crv || !publicKey.x) {
  console.error("[a2ax] Invalid issuer JWK: missing kty, crv, or x");
  process.exit(1);
}

mkdirSync(anchorsDir, { recursive: true });
writeFileSync(outputPath, JSON.stringify(publicKey, null, 2), "utf8");
console.log("[a2ax] Exported issuer public key to config/trust/anchors/a2ax-core-protocol.json");
