import { createHash, randomUUID } from "node:crypto";
import { exportJWK, generateKeyPair, importJWK, SignJWT, type JWK, type KeyLike } from "jose";

export type SignedRequestInput = {
  agentId: string;
  scope: string;
  method: string;
  path: string;
  body?: unknown;
};

export async function generateEd25519JwkPair(): Promise<{ publicJwk: JWK; privateJwk: JWK }> {
  const { publicKey, privateKey } = await generateKeyPair("EdDSA", { crv: "Ed25519" });
  return {
    publicJwk: await exportJWK(publicKey),
    privateJwk: await exportJWK(privateKey)
  };
}

export function hashBody(body: unknown): string {
  return createHash("sha256").update(JSON.stringify(body ?? {})).digest("hex");
}

export async function signAgentRequest(
  privateJwk: JWK,
  input: SignedRequestInput
): Promise<{ token: string; nonce: string; timestamp: number }> {
  const key: KeyLike = await importJWK(privateJwk, "EdDSA");
  const nonce = randomUUID();
  const timestamp = Date.now();
  const token = await new SignJWT({
    agent_id: input.agentId,
    scope: input.scope,
    nonce,
    ts: timestamp,
    method: input.method.toUpperCase(),
    path: input.path,
    body_hash: hashBody(input.body)
  })
    .setProtectedHeader({ alg: "EdDSA", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("2m")
    .sign(key);
  return { token, nonce, timestamp };
}

export async function buildHandshakeRequest(
  privateJwk: JWK,
  agentId: string,
  requestedScopes: string[],
  sessionTtlSeconds = 300
): Promise<{ token: string; nonce: string; timestamp: number }> {
  const key: KeyLike = await importJWK(privateJwk, "EdDSA");
  const nonce = randomUUID();
  const timestamp = Date.now();
  const token = await new SignJWT({
    agent_id: agentId,
    nonce,
    ts: timestamp,
    requested_scopes: requestedScopes,
    session_ttl_s: sessionTtlSeconds
  })
    .setProtectedHeader({ alg: "EdDSA", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(key);
  return { token, nonce, timestamp };
}
