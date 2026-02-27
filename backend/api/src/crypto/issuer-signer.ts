/**
 * Pluggable issuer signing abstraction.
 * Supports file-based JWK (Ed25519) or AWS KMS (RSA).
 */

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { importJWK, SignJWT, type JWK, type KeyLike } from "jose";
import { config } from "../config.js";

export type SigningAlgorithm = "EdDSA" | "RS256";

export interface IssuerSigner {
  algorithm: SigningAlgorithm;
  kid: string;
  sign(payload: Record<string, unknown>): Promise<string>;
}

async function loadFileJwk(): Promise<JWK> {
  const jwkRaw =
    config.issuerPrivateJwk ??
    (config.issuerPrivateJwkFile ? await readFile(config.issuerPrivateJwkFile, "utf8") : undefined);
  if (!jwkRaw) throw new Error("Issuer JWK is not configured");
  const parsed = JSON.parse(jwkRaw) as JWK;
  if (parsed.kty !== "OKP" || parsed.crv !== "Ed25519" || !parsed.d || !parsed.x) {
    throw new Error("Issuer private JWK must be an Ed25519 private key");
  }
  if (parsed.x === "replace" || parsed.d === "replace") {
    throw new Error("Issuer private JWK placeholder values are not allowed");
  }
  return parsed;
}

class FileJwkSigner implements IssuerSigner {
  algorithm = "EdDSA" as const;
  kid = config.issuerKid;
  private keyPromise: Promise<KeyLike | Uint8Array> | undefined;

  private async getKey(): Promise<KeyLike | Uint8Array> {
    if (!this.keyPromise) {
      this.keyPromise = loadFileJwk().then((jwk) => importJWK(jwk, "EdDSA"));
    }
    return this.keyPromise;
  }

  async sign(payload: Record<string, unknown>): Promise<string> {
    const key = await this.getKey();
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: "EdDSA", kid: this.kid, typ: "JWT" })
      .setIssuedAt()
      .setIssuer("a2ax-core-protocol")
      .setExpirationTime("30d")
      .sign(key);
  }
}

async function createKmsSigner(): Promise<IssuerSigner> {
  const { KMSClient, SignCommand } = await import("@aws-sdk/client-kms");

  const client = new KMSClient({
    region: config.awsRegion ?? process.env.AWS_REGION ?? "us-east-1"
  });
  const keyId = config.kmsKeyArn!;

  return {
    algorithm: "RS256",
    kid: config.issuerKid,
    async sign(payload: Record<string, unknown>): Promise<string> {
      const now = Math.floor(Date.now() / 1000);
      const header = { alg: "RS256", kid: config.issuerKid, typ: "JWT" };
      const payloadWithClaims = {
        ...payload,
        iat: now,
        iss: "a2ax-core-protocol",
        exp: now + 30 * 86400
      };
      const headerB64 = Buffer.from(JSON.stringify(header)).toString("base64url");
      const payloadB64 = Buffer.from(JSON.stringify(payloadWithClaims)).toString("base64url");
      const signingInput = `${headerB64}.${payloadB64}`;
      const messageBytes = Buffer.from(signingInput, "utf8");

      const digest = createHash("sha256").update(messageBytes).digest();
      const result = (await client.send(
        new SignCommand({
          KeyId: keyId,
          Message: digest,
          MessageType: "DIGEST",
          SigningAlgorithm: "RSASSA_PKCS1_V1_5_SHA_256"
        })
      )) as { Signature?: Uint8Array };
      const Signature = result.Signature;
      if (!Signature) throw new Error("KMS Sign returned no signature");
      const sigB64 = Buffer.from(Signature).toString("base64url");
      return `${signingInput}.${sigB64}`;
    }
  };
}

let signerInstance: IssuerSigner | undefined;

export async function getIssuerSigner(): Promise<IssuerSigner> {
  if (signerInstance) return signerInstance;
  if (config.kmsKeyArn) {
    signerInstance = await createKmsSigner();
  } else {
    signerInstance = new FileJwkSigner();
  }
  return signerInstance;
}
