/**
 * Compose-backed integration tests for full API workflows.
 * Requires: docker compose -f infra/docker-compose.yml up -d
 * Run: npm run test:integration
 */
import { PROTOCOL_VERSION } from "@a2ax/protocol";
import { generateKeyPair, exportJWK, importJWK, SignJWT } from "jose";
import { describe, expect, it, beforeAll } from "vitest";

const BASE_URL = process.env.PILOT_BASE_URL ?? "http://localhost:8080";
const ADMIN_API_KEY = process.env.ADMIN_API_KEY ?? "replace-with-strong-admin-api-key";

function adminHeaders(): Record<string, string> {
  return {
    "content-type": "application/json",
    "x-admin-api-key": ADMIN_API_KEY
  };
}

async function fetchJson(
  path: string,
  options: RequestInit = {}
): Promise<{ status: number; body: unknown }> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { "content-type": "application/json", ...options.headers }
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

async function healthCheck(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/healthz`);
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean };
    return res.ok && data.ok === true;
  } catch {
    return false;
  }
}

describe("integration: API workflows", () => {
  let orgId: string;
  let agentId: string;
  let publicJwk: Record<string, unknown>;
  let privateJwk: Record<string, unknown>;

  beforeAll(async () => {
    const ok = await healthCheck();
    if (!ok) {
      throw new Error(
        `API not reachable at ${BASE_URL}. Start stack: docker compose -f infra/docker-compose.yml up -d`
      );
    }

    const { status: orgStatus, body: orgBody } = await fetchJson("/v1/orgs", {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify({ name: "Integration Test Org", verification_tier: "verified" })
    });
    if (orgStatus !== 201) throw new Error(`Org creation failed: ${JSON.stringify(orgBody)}`);
    orgId = (orgBody as { org_id: string }).org_id;

    const { publicKey, privateKey } = await generateKeyPair("EdDSA", { crv: "Ed25519" });
    publicJwk = (await exportJWK(publicKey)) as Record<string, unknown>;
    privateJwk = (await exportJWK(privateKey)) as Record<string, unknown>;

    const { status: agentStatus, body: agentBody } = await fetchJson("/v1/agents/register", {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify({
        org_id: orgId,
        display_name: "integration-agent",
        public_jwk: publicJwk,
        capability_manifest: {
          scopes: [{ name: "data_access" }],
          restricted_operations: []
        }
      })
    });
    if (agentStatus !== 201) throw new Error(`Agent registration failed: ${JSON.stringify(agentBody)}`);
    agentId = (agentBody as { agent_id: string }).agent_id;
  });

  it("org and agent are created", () => {
    expect(orgId).toMatch(/^org_/);
    expect(agentId).toMatch(/^agt_/);
  });

  it("verifies valid signed request", async () => {
    const key = await importJWK(privateJwk, "EdDSA");
    const nonce = crypto.randomUUID();
    const timestamp = Date.now();
    const token = await new SignJWT({
      agent_id: agentId,
      scope: "data_access",
      nonce,
      ts: timestamp,
      protocol_version: PROTOCOL_VERSION
    })
      .setProtectedHeader({ alg: "EdDSA", typ: "JWT" })
      .setIssuedAt()
      .setExpirationTime("2m")
      .sign(key);

    const { status, body } = await fetchJson("/v1/verify", {
      method: "POST",
      headers: { "x-agent-id": agentId },
      body: JSON.stringify({
        agent_id: agentId,
        token,
        scope: "data_access",
        nonce,
        timestamp
      })
    });
    expect(status).toBe(200);
    expect((body as { valid: boolean }).valid).toBe(true);
  });

  it("rejects nonce replay", async () => {
    const key = await importJWK(privateJwk, "EdDSA");
    const nonce = crypto.randomUUID();
    const timestamp = Date.now();
    const token = await new SignJWT({
      agent_id: agentId,
      scope: "data_access",
      nonce,
      ts: timestamp,
      protocol_version: PROTOCOL_VERSION
    })
      .setProtectedHeader({ alg: "EdDSA", typ: "JWT" })
      .setIssuedAt()
      .setExpirationTime("2m")
      .sign(key);

    const payload = {
      agent_id: agentId,
      token,
      scope: "data_access",
      nonce,
      timestamp
    };

    const first = await fetchJson("/v1/verify", {
      method: "POST",
      headers: { "x-agent-id": agentId },
      body: JSON.stringify(payload)
    });
    expect(first.status).toBe(200);

    const replay = await fetchJson("/v1/verify", {
      method: "POST",
      headers: { "x-agent-id": agentId },
      body: JSON.stringify(payload)
    });
    expect(replay.status).toBe(409);
    expect((replay.body as { reason?: string }).reason).toBe("nonce_replay");
  });

  it("handshake verify accepts valid request", async () => {
    const key = await importJWK(privateJwk, "EdDSA");
    const nonce = crypto.randomUUID();
    const timestamp = Date.now();
    const requestedScopes = ["data_access"];
    const token = await new SignJWT({
      agent_id: agentId,
      nonce,
      ts: timestamp,
      protocol_version: PROTOCOL_VERSION,
      requested_scopes: requestedScopes,
      session_ttl_s: 300
    })
      .setProtectedHeader({ alg: "EdDSA", typ: "JWT" })
      .setIssuedAt()
      .setExpirationTime("5m")
      .sign(key);

    const { status, body } = await fetchJson("/v1/handshake/verify", {
      method: "POST",
      headers: { "x-agent-id": agentId },
      body: JSON.stringify({
        agent_id: agentId,
        handshake_req_jws: token,
        requested_scopes: requestedScopes,
        nonce,
        timestamp
      })
    });
    expect(status).toBe(200);
    expect((body as { valid: boolean }).valid).toBe(true);
  });

  it("ingests trust events and returns trust score", async () => {
    const { status: eventStatus, body: eventBody } = await fetchJson("/v1/trust/events", {
      method: "POST",
      headers: { "x-agent-id": agentId },
      body: JSON.stringify({
        agent_id: agentId,
        type: "availability_probe",
        success: true,
        sla_met: true,
        raw: { uptime_reliability: 0.997 }
      })
    });
    expect(eventStatus).toBe(201);
    expect((eventBody as { id?: string }).id).toMatch(/^tev_/);

    const { status: trustStatus, body: trustBody } = await fetchJson(`/v1/agents/${agentId}/trust`);
    expect(trustStatus).toBe(200);
    expect((trustBody as { score?: number }).score).toBeDefined();
    expect((trustBody as { riskTier?: string }).riskTier).toBeDefined();
  });

  it("audit returns rows for admin", async () => {
    const { status, body } = await fetchJson("/v1/audit?limit=5", {
      headers: adminHeaders()
    });
    expect(status).toBe(200);
    expect((body as { rows?: unknown[] }).rows).toBeDefined();
    expect(Array.isArray((body as { rows?: unknown[] }).rows)).toBe(true);
  });

  it("admin token exchange returns JWT", async () => {
    const { status, body } = await fetchJson("/v1/admin/token", {
      method: "POST",
      body: JSON.stringify({ api_key: ADMIN_API_KEY })
    });
    expect(status).toBe(200);
    expect((body as { token?: string }).token).toBeDefined();
    expect((body as { expires_in?: number }).expires_in).toBeGreaterThan(0);
  });

  it("admin token authenticates protected endpoint", async () => {
    const { body: tokenBody } = await fetchJson("/v1/admin/token", {
      method: "POST",
      body: JSON.stringify({ api_key: ADMIN_API_KEY })
    });
    const token = (tokenBody as { token?: string }).token;
    expect(token).toBeDefined();

    const { status } = await fetchJson("/v1/orgs", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name: "JWT Auth Org", verification_tier: "unverified" })
    });
    expect(status).toBe(201);
  });
});
