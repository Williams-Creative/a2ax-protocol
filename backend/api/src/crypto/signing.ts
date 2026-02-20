import { createHash } from "node:crypto";
import { importJWK, jwtVerify, type JWK } from "jose";
import { getIssuerSigner } from "./issuer-signer.js";

export function hashJsonBody(input: unknown): string {
  const serialized = JSON.stringify(input ?? {});
  return createHash("sha256").update(serialized).digest("hex");
}

export async function signCertificate(payload: Record<string, unknown>): Promise<string> {
  const signer = await getIssuerSigner();
  return signer.sign(payload);
}

export async function verifyAgentJwt(
  token: string,
  publicJwk: JWK
): Promise<Record<string, unknown>> {
  const key = await importJWK(publicJwk, "EdDSA");
  const { payload } = await jwtVerify(token, key, {
    algorithms: ["EdDSA"]
  });
  return payload as Record<string, unknown>;
}
