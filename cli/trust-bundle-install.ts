#!/usr/bin/env node
/**
 * A2AX trust bundle installer.
 * Usage: npx tsx cli/trust-bundle-install.ts <bundle-name>
 * Copies issuer keys into trust store. Does not modify core protocol.
 * Stub: bundle resolution not yet implemented.
 */

const bundleName = process.argv[2] ?? "community";

console.log(`[a2ax] Trust bundle install: ${bundleName}`);
console.log("[a2ax] Stub: bundle resolution not yet implemented.");
console.log("[a2ax] Add issuer keys to config/trust/anchors/ manually.");
process.exit(0);
