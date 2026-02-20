import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { exportJWK, generateKeyPair } from "jose";

async function main() {
  const outputDir = resolve(process.cwd(), "secrets");
  const outputPath = resolve(outputDir, "issuer_private_jwk.json");
  await mkdir(outputDir, { recursive: true });
  const { privateKey } = await generateKeyPair("EdDSA", { crv: "Ed25519" });
  const privateJwk = await exportJWK(privateKey);
  await writeFile(outputPath, JSON.stringify(privateJwk, null, 2), "utf8");
  // eslint-disable-next-line no-console
  console.log(`Wrote issuer JWK to ${outputPath}`);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
