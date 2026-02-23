/**
 * Server trust store. Loads from config/trust/anchors/.
 * Empty by default. No embedded trust anchors.
 */

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { TrustStoreInMemory } from "@a2ax/protocol";

let trustStoreInstance: TrustStoreInMemory | null = null;

export function getTrustStore(): TrustStoreInMemory {
  if (!trustStoreInstance) {
    trustStoreInstance = new TrustStoreInMemory();
    // No auto-load. Call loadTrustAnchors() explicitly if anchors dir exists.
  }
  return trustStoreInstance;
}

export async function loadTrustAnchors(anchorsDir: string): Promise<void> {
  const store = getTrustStore();
  try {
    const files = await readdir(anchorsDir);
    for (const file of files) {
      if (file.startsWith(".") || file === ".gitkeep") continue;
      const path = join(anchorsDir, file);
      const content = await readFile(path, "utf8");
      const issuerId = file.replace(/\.(pem|json)$/, "");
      if (file.endsWith(".json")) {
        const jwk = JSON.parse(content) as Record<string, unknown>;
        store.addIssuer(issuerId, { format: "jwk", key: jwk });
      } else if (file.endsWith(".pem")) {
        store.addIssuer(issuerId, { format: "pem", key: content });
      }
    }
  } catch {
    // Dir doesn't exist or empty - trust store stays empty
  }
}
