import { webcrypto } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { config } from "../config.js";
import { metrics } from "../metrics/index.js";

const ADMIN_ISSUER = "nexus-admin";
const ADMIN_AUDIENCE = "nexus-admin";

async function getAdminKey() {
  return await webcrypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(config.adminApiKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function issueAdminToken(): Promise<string> {
  const key = await getAdminKey();
  const now = Math.floor(Date.now() / 1000);
  return await new SignJWT({ sub: "admin", scope: "admin" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(ADMIN_ISSUER)
    .setAudience(ADMIN_AUDIENCE)
    .setIssuedAt(now)
    .setExpirationTime(now + config.adminJwtTtlSeconds)
    .sign(key);
}

async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const key = await getAdminKey();
    const { payload } = await jwtVerify(token, key, {
      issuer: ADMIN_ISSUER,
      audience: ADMIN_AUDIENCE,
      algorithms: ["HS256"]
    });
    return payload.scope === "admin";
  } catch {
    return false;
  }
}

export async function verifyAdminAuth(headers: Record<string, unknown>): Promise<boolean> {
  const apiKey = headers["x-admin-api-key"]?.toString();
  if (apiKey === config.adminApiKey) {
    metrics.adminAuthTotal.inc({ result: "api_key" });
    return true;
  }
  const authHeader = headers["authorization"]?.toString();
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (bearer) {
    const valid = await verifyAdminToken(bearer);
    if (valid) {
      metrics.adminAuthTotal.inc({ result: "jwt" });
      return true;
    }
    metrics.adminAuthTotal.inc({ result: "jwt_invalid" });
    return false;
  }
  metrics.adminAuthTotal.inc({ result: "missing" });
  return false;
}
