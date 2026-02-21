import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import type { JWK } from "jose";
import { z } from "zod";
import { issueAdminToken, verifyAdminAuth } from "../auth/admin.js";
import { writeAuditLog } from "../audit/logger.js";
import {
  capabilityManifestSchema,
  checkProtocolVersion,
  evaluateScope,
  verifyPortableCertificate,
  type CapabilityManifest
} from "@a2ax/protocol";
import { config } from "../config.js";
import { hashJsonBody, signCertificate, verifyAgentJwt } from "../crypto/signing.js";
import { query } from "../db/postgres.js";
import { redis } from "../db/redis.js";
import { metrics as promMetrics } from "../metrics/index.js";
import { computeTrustScore } from "../trust/engine.js";
import { getTrustStore } from "../trust-store.js";

function manifestHash(manifest: CapabilityManifest): string {
  return hashJsonBody(manifest);
}

type AgentRecord = {
  id: string;
  org_id: string;
  status: string;
  display_name: string;
  metadata_json: Record<string, unknown>;
  created_at: string;
};

async function getAgent(agentId: string): Promise<AgentRecord | undefined> {
  const rows = await query<AgentRecord>("SELECT * FROM agents WHERE id = $1 LIMIT 1", [agentId]);
  return rows[0];
}

async function getLatestPublicJwk(agentId: string): Promise<JWK | undefined> {
  const rows = await query<{ public_jwk_json: JWK }>(
    `SELECT public_jwk_json
     FROM agent_keys
     WHERE agent_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [agentId]
  );
  return rows[0]?.public_jwk_json;
}

async function getManifest(agentId: string): Promise<CapabilityManifest | undefined> {
  const rows = await query<{ manifest_json: CapabilityManifest }>(
    "SELECT manifest_json FROM agent_capabilities WHERE agent_id = $1 LIMIT 1",
    [agentId]
  );
  return rows[0]?.manifest_json;
}

async function isRevoked(agentId: string): Promise<boolean> {
  const cacheHit = await redis.get(`revoked:${agentId}`);
  if (cacheHit === "1") {
    return true;
  }
  const rows = await query<{ agent_id: string }>(
    "SELECT agent_id FROM revocations WHERE agent_id = $1 LIMIT 1",
    [agentId]
  );
  if (rows.length > 0) {
    await redis.set(`revoked:${agentId}`, "1");
    return true;
  }
  return false;
}

async function enforceRateLimit(subject: string, endpoint: string): Promise<boolean> {
  const bucket = Math.floor(Date.now() / 60_000);
  const key = `ratelimit:${subject}:${bucket}`;
  const value = await redis.incr(key);
  if (value === 1) {
    await redis.expire(key, 70);
  }
  const allowed = value <= config.rateLimitPerMinute;
  if (!allowed) {
    promMetrics.rateLimitHits.inc({ endpoint });
  }
  return allowed;
}

function getRequestId(headers: Record<string, unknown>): string {
  return headers["x-request-id"]?.toString() ?? randomUUID();
}

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  app.post("/admin/token", async (request, reply) => {
    const apiKey = (request.body as { api_key?: string })?.api_key ?? request.headers["x-admin-api-key"]?.toString();
    if (apiKey !== config.adminApiKey) {
      promMetrics.adminAuthTotal.inc({ result: "missing" });
      return reply.code(401).send({ error: "admin_auth_required" });
    }
    const token = await issueAdminToken();
    promMetrics.adminAuthTotal.inc({ result: "token_issued" });
    return reply.send({ token, expires_in: config.adminJwtTtlSeconds });
  });

  app.post("/orgs", async (request, reply) => {
    if (!(await verifyAdminAuth(request.headers as Record<string, unknown>))) {
      return reply.code(401).send({ error: "admin_auth_required" });
    }
    const input = z
      .object({
        name: z.string().min(1),
        verification_tier: z.enum(["unverified", "verified", "enterprise"]).default("unverified")
      })
      .parse(request.body);
    const orgId = `org_${randomUUID().slice(0, 12)}`;
    await query(
      "INSERT INTO organizations (id, name, verification_tier) VALUES ($1,$2,$3)",
      [orgId, input.name, input.verification_tier]
    );
    return reply.code(201).send({ org_id: orgId });
  });

  app.get("/orgs/:orgId", async (request, reply) => {
    if (!(await verifyAdminAuth(request.headers as Record<string, unknown>))) {
      return reply.code(401).send({ error: "admin_auth_required" });
    }
    const { orgId } = z.object({ orgId: z.string() }).parse(request.params);
    const rows = await query("SELECT * FROM organizations WHERE id = $1 LIMIT 1", [orgId]);
    if (rows.length === 0) {
      return reply.code(404).send({ error: "org_not_found" });
    }
    return rows[0];
  });

  app.post("/agents/register", async (request, reply) => {
    if (!(await verifyAdminAuth(request.headers as Record<string, unknown>))) {
      return reply.code(401).send({ error: "admin_auth_required" });
    }
    const input = z
      .object({
        org_id: z.string(),
        display_name: z.string().min(1),
        metadata: z.record(z.unknown()).default({}),
        public_jwk: z.record(z.unknown()),
        capability_manifest: capabilityManifestSchema
      })
      .parse(request.body);

    const agentId = `agt_${randomUUID().slice(0, 12)}`;
    const now = new Date();
    const manifest = input.capability_manifest;
    const hash = manifestHash(manifest);
    const cert = await signCertificate({
      agent_id: agentId,
      org_id: input.org_id,
      public_jwk: input.public_jwk,
      capability_manifest_hash: hash,
      status: "active"
    });

    await query(
      "INSERT INTO agents (id, org_id, status, display_name, metadata_json) VALUES ($1,$2,'active',$3,$4::jsonb)",
      [agentId, input.org_id, input.display_name, JSON.stringify(input.metadata)]
    );
    await query(
      "INSERT INTO agent_keys (agent_id, public_jwk_json) VALUES ($1,$2::jsonb)",
      [agentId, JSON.stringify(input.public_jwk)]
    );
    await query(
      `INSERT INTO agent_certificates (agent_id, cert_jws, issued_at, expires_at, issuer_kid)
       VALUES ($1,$2,$3,$4,$5)`,
      [agentId, cert, now.toISOString(), new Date(now.getTime() + 30 * 86400_000).toISOString(), config.issuerKid]
    );
    await query(
      "INSERT INTO agent_capabilities (agent_id, manifest_json, manifest_hash) VALUES ($1,$2::jsonb,$3)",
      [agentId, JSON.stringify(manifest), hash]
    );
    await writeAuditLog({
      actorType: "system",
      actorId: "registry",
      action: "agent_registered",
      targetType: "agent",
      targetId: agentId,
      requestId: getRequestId(request.headers as Record<string, unknown>),
      ip: request.ip,
      userAgent: request.headers["user-agent"]?.toString(),
      details: { org_id: input.org_id }
    });
    return reply.code(201).send({ agent_id: agentId, cert_jws: cert, capability_manifest_hash: hash });
  });

  app.post("/agents/:agentId/revoke", async (request, reply) => {
    if (!(await verifyAdminAuth(request.headers as Record<string, unknown>))) {
      return reply.code(401).send({ error: "admin_auth_required" });
    }
    const { agentId } = z.object({ agentId: z.string() }).parse(request.params);
    const { reason } = z.object({ reason: z.string().default("manual_revoke") }).parse(request.body);
    await query("UPDATE agents SET status = 'revoked', revoked_at = NOW() WHERE id = $1", [agentId]);
    await query(
      "INSERT INTO revocations (agent_id, reason) VALUES ($1,$2) ON CONFLICT (agent_id) DO UPDATE SET reason = EXCLUDED.reason, revoked_at = NOW()",
      [agentId, reason]
    );
    await redis.set(`revoked:${agentId}`, "1");
    await writeAuditLog({
      actorType: "org_admin",
      actorId: "unknown",
      action: "agent_revoked",
      targetType: "agent",
      targetId: agentId,
      requestId: getRequestId(request.headers as Record<string, unknown>),
      ip: request.ip,
      userAgent: request.headers["user-agent"]?.toString(),
      details: { reason }
    });
    return reply.send({ revoked: true, agent_id: agentId });
  });

  app.get("/agents/:agentId", async (request, reply) => {
    const { agentId } = z.object({ agentId: z.string() }).parse(request.params);
    const agent = await getAgent(agentId);
    if (!agent) {
      return reply.code(404).send({ error: "agent_not_found" });
    }
    return agent;
  });

  app.put("/agents/:agentId/capabilities", async (request, reply) => {
    if (!(await verifyAdminAuth(request.headers as Record<string, unknown>))) {
      return reply.code(401).send({ error: "admin_auth_required" });
    }
    const { agentId } = z.object({ agentId: z.string() }).parse(request.params);
    const manifest = capabilityManifestSchema.parse(request.body);
    const hash = manifestHash(manifest);
    await query(
      `INSERT INTO agent_capabilities (agent_id, manifest_json, manifest_hash)
       VALUES ($1,$2::jsonb,$3)
       ON CONFLICT (agent_id) DO UPDATE SET manifest_json = EXCLUDED.manifest_json, manifest_hash = EXCLUDED.manifest_hash, updated_at = NOW()`,
      [agentId, JSON.stringify(manifest), hash]
    );
    return reply.send({ updated: true, manifest_hash: hash });
  });

  app.get("/agents/:agentId/capabilities", async (request, reply) => {
    const { agentId } = z.object({ agentId: z.string() }).parse(request.params);
    const manifest = await getManifest(agentId);
    if (!manifest) {
      return reply.code(404).send({ error: "capability_manifest_not_found" });
    }
    return manifest;
  });

  app.post("/verify/portable", async (request, reply) => {
    const subject = (request.headers["x-agent-id"]?.toString() ?? request.ip).toString();
    if (!(await enforceRateLimit(subject, "verify_portable"))) {
      return reply.code(429).send({ valid: false, reason: "rate_limited" });
    }
    const input = z
      .object({
        certificate_jws: z.string(),
        revocation_status: z.enum(["active", "revoked"]).optional(),
        require_revocation_check: z.boolean().optional()
      })
      .parse(request.body);

    const store = getTrustStore();
    const issuerId = (() => {
      try {
        const parts = input.certificate_jws.split(".");
        const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
        return payload.iss ?? payload.issuer_id;
      } catch {
        return null;
      }
    })();

    if (!issuerId || !store.isTrusted(issuerId)) {
      return reply.code(403).send({ valid: false, reason: "issuer_not_trusted" });
    }

    const issuerKey = store.getIssuerPublicKey(issuerId);
    if (!issuerKey) {
      return reply.code(403).send({ valid: false, reason: "issuer_not_trusted" });
    }

    const result = await verifyPortableCertificate({
      certificateJws: input.certificate_jws,
      issuerPublicKey: issuerKey,
      revocationStatus: input.revocation_status,
      requireRevocationCheck: input.require_revocation_check
    });

    if (!result.valid) {
      return reply.code(401).send({ valid: false, reason: result.reason });
    }

    return reply.send({ valid: true, payload: result.payload });
  });

  app.get("/issuer/:issuerId", async (request, reply) => {
    const { issuerId } = z.object({ issuerId: z.string() }).parse(request.params);
    const store = getTrustStore();
    if (!store.isTrusted(issuerId)) {
      return reply.code(404).send({ error: "issuer_not_found" });
    }
    const key = store.getIssuerPublicKey(issuerId);
    if (!key) return reply.code(404).send({ error: "issuer_not_found" });
    const issuers = store.listIssuers();
    const meta = issuers.find((i) => i.issuerId === issuerId)?.metadata;
    return reply.send({
      issuer_id: issuerId,
      public_key: key,
      metadata: meta ?? {}
    });
  });

  app.post("/verify", async (request, reply) => {
    const subject = (request.headers["x-agent-id"]?.toString() ?? request.ip).toString();
    if (!(await enforceRateLimit(subject, "verify"))) {
      return reply.code(429).send({ valid: false, reason: "rate_limited" });
    }
    const input = z
      .object({
        agent_id: z.string(),
        token: z.string(),
        scope: z.string(),
        nonce: z.string(),
        timestamp: z.number(),
        amount_cents: z.number().int().nonnegative().optional(),
        operation: z.string().optional()
      })
      .parse(request.body);

    const verifyStart = Date.now();
    const revoked = await isRevoked(input.agent_id);
    if (revoked) {
      promMetrics.verifyTotal.inc({ result: "failure", reason: "agent_revoked" });
      promMetrics.verifyDuration.observe({ result: "failure" }, (Date.now() - verifyStart) / 1000);
      return reply.code(403).send({ valid: false, reason: "agent_revoked" });
    }

    const agent = await getAgent(input.agent_id);
    if (!agent || agent.status !== "active") {
      promMetrics.verifyTotal.inc({ result: "failure", reason: "agent_not_active" });
      promMetrics.verifyDuration.observe({ result: "failure" }, (Date.now() - verifyStart) / 1000);
      return reply.code(404).send({ valid: false, reason: "agent_not_active" });
    }

    const skew = Math.abs(Date.now() - input.timestamp);
    if (skew > config.timestampSkewMs) {
      promMetrics.verifyTotal.inc({ result: "failure", reason: "timestamp_out_of_window" });
      promMetrics.verifyDuration.observe({ result: "failure" }, (Date.now() - verifyStart) / 1000);
      return reply.code(401).send({ valid: false, reason: "timestamp_out_of_window" });
    }

    const nonceKey = `nonce:${input.agent_id}:${input.nonce}`;
    const nonceSet = await redis.set(nonceKey, "1", "EX", config.nonceTtlSeconds, "NX");
    if (nonceSet !== "OK") {
      promMetrics.verifyTotal.inc({ result: "failure", reason: "nonce_replay" });
      promMetrics.replayDenials.inc();
      promMetrics.verifyDuration.observe({ result: "failure" }, (Date.now() - verifyStart) / 1000);
      return reply.code(409).send({ valid: false, reason: "nonce_replay" });
    }

    const publicJwk = await getLatestPublicJwk(input.agent_id);
    if (!publicJwk) {
      promMetrics.verifyTotal.inc({ result: "failure", reason: "public_key_missing" });
      promMetrics.verifyDuration.observe({ result: "failure" }, (Date.now() - verifyStart) / 1000);
      return reply.code(404).send({ valid: false, reason: "public_key_missing" });
    }

    const payload = await verifyAgentJwt(input.token, publicJwk);
    const clientVersion = (payload.protocol_version as string) ?? "0.0.0";
    const versionCheck = checkProtocolVersion(clientVersion);
    if (!versionCheck.compatible) {
      promMetrics.verifyTotal.inc({ result: "failure", reason: "protocol_version_mismatch" });
      promMetrics.verifyDuration.observe({ result: "failure" }, (Date.now() - verifyStart) / 1000);
      return reply.code(400).send({ valid: false, reason: versionCheck.reason });
    }
    if (
      payload.agent_id !== input.agent_id ||
      payload.scope !== input.scope ||
      payload.nonce !== input.nonce ||
      payload.ts !== input.timestamp
    ) {
      promMetrics.verifyTotal.inc({ result: "failure", reason: "payload_mismatch" });
      promMetrics.verifyDuration.observe({ result: "failure" }, (Date.now() - verifyStart) / 1000);
      return reply.code(401).send({ valid: false, reason: "payload_mismatch" });
    }

    const manifest = await getManifest(input.agent_id);
    if (!manifest) {
      promMetrics.verifyTotal.inc({ result: "failure", reason: "capability_manifest_not_found" });
      promMetrics.verifyDuration.observe({ result: "failure" }, (Date.now() - verifyStart) / 1000);
      return reply.code(404).send({ valid: false, reason: "capability_manifest_not_found" });
    }

    const decision = evaluateScope(manifest, {
      requestedScope: input.scope,
      amountCents: input.amount_cents,
      operation: input.operation
    });
    if (!decision.allowed) {
      promMetrics.verifyTotal.inc({ result: "failure", reason: decision.reason });
      promMetrics.verifyDuration.observe({ result: "failure" }, (Date.now() - verifyStart) / 1000);
      return reply.code(403).send({ valid: false, reason: decision.reason });
    }

    promMetrics.verifyTotal.inc({ result: "success", reason: "verified" });
    promMetrics.verifyDuration.observe({ result: "success" }, (Date.now() - verifyStart) / 1000);
    await writeAuditLog({
      actorType: "agent",
      actorId: input.agent_id,
      action: "request_verified",
      targetType: "scope",
      targetId: input.scope,
      requestId: getRequestId(request.headers as Record<string, unknown>),
      ip: request.ip,
      userAgent: request.headers["user-agent"]?.toString(),
      details: { nonce: input.nonce }
    });

    return reply.send({ valid: true, reason: "verified" });
  });

  app.post("/trust/events", async (request, reply) => {
    const subject = (request.headers["x-agent-id"]?.toString() ?? request.ip).toString();
    if (!(await enforceRateLimit(subject, "trust_events"))) {
      return reply.code(429).send({ error: "rate_limited" });
    }
    const input = z
      .object({
        agent_id: z.string(),
        type: z.string(),
        success: z.boolean(),
        latency_ms: z.number().int().nonnegative().optional(),
        amount_cents: z.number().int().nonnegative().optional(),
        dispute: z.boolean().default(false),
        sla_met: z.boolean().optional(),
        occurred_at: z.string().datetime().optional(),
        raw: z.record(z.unknown()).default({})
      })
      .parse(request.body);

    const eventId = `tev_${randomUUID().slice(0, 12)}`;
    await query(
      `INSERT INTO trust_events
      (id, agent_id, type, success, latency_ms, amount_cents, dispute, sla_met, occurred_at, raw_json)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb)`,
      [
        eventId,
        input.agent_id,
        input.type,
        input.success,
        input.latency_ms ?? null,
        input.amount_cents ?? null,
        input.dispute,
        input.sla_met ?? null,
        input.occurred_at ?? new Date().toISOString(),
        JSON.stringify(input.raw)
      ]
    );
    return reply.code(201).send({ id: eventId });
  });

  app.get("/agents/:agentId/trust", async (request, reply) => {
    const { agentId } = z.object({ agentId: z.string() }).parse(request.params);
    const trustStart = Date.now();

    const rows = await query<{
      success_count: string;
      failure_count: string;
      dispute_count: string;
      sla_met_count: string;
      sla_total_count: string;
    }>(
      `SELECT
        SUM(CASE WHEN success THEN 1 ELSE 0 END)::text AS success_count,
        SUM(CASE WHEN success THEN 0 ELSE 1 END)::text AS failure_count,
        SUM(CASE WHEN dispute THEN 1 ELSE 0 END)::text AS dispute_count,
        SUM(CASE WHEN sla_met = true THEN 1 ELSE 0 END)::text AS sla_met_count,
        SUM(CASE WHEN sla_met IS NOT NULL THEN 1 ELSE 0 END)::text AS sla_total_count
      FROM trust_events
      WHERE agent_id = $1`,
      [agentId]
    );
    const metrics = rows[0] ?? {
      success_count: "0",
      failure_count: "0",
      dispute_count: "0",
      sla_met_count: "0",
      sla_total_count: "0"
    };
    const uptimeRows = await query<{ uptime_reliability: string | null }>(
      `SELECT
        AVG(
          CASE
            WHEN (raw_json->>'uptime_reliability') ~ '^[0-9]*\\.?[0-9]+$'
              THEN LEAST(1, GREATEST(0, (raw_json->>'uptime_reliability')::float))
            ELSE NULL
          END
        )::text AS uptime_reliability
      FROM trust_events
      WHERE agent_id = $1`,
      [agentId]
    );
    const observedUptime = Number(uptimeRows[0]?.uptime_reliability ?? "0");
    const fallbackUptime =
      Number(metrics.sla_total_count) > 0
        ? Number(metrics.sla_met_count) / Math.max(1, Number(metrics.sla_total_count))
        : 0.95;
    const agent = await getAgent(agentId);
    if (!agent) {
      return reply.code(404).send({ error: "agent_not_found" });
    }
    const orgRows = await query<{ verification_tier: string }>(
      "SELECT verification_tier FROM organizations WHERE id = $1 LIMIT 1",
      [agent.org_id]
    );
    const createdAt = new Date(agent.created_at).getTime();
    const identityAgeDays = Math.max(0, (Date.now() - createdAt) / 86400_000);
    const result = computeTrustScore({
      successCount: Number(metrics.success_count),
      failureCount: Number(metrics.failure_count),
      disputeCount: Number(metrics.dispute_count),
      slaMetCount: Number(metrics.sla_met_count),
      slaTotalCount: Number(metrics.sla_total_count),
      identityAgeDays,
      orgTier: orgRows[0]?.verification_tier ?? "unverified",
      uptimeReliability: observedUptime > 0 ? observedUptime : fallbackUptime
    });
    await query(
      `INSERT INTO trust_scores (agent_id, score, risk_tier, explanation_json, trust_model_version, computed_at)
       VALUES ($1,$2,$3,$4::jsonb,'v1',NOW())
       ON CONFLICT (agent_id) DO UPDATE SET score = EXCLUDED.score, risk_tier = EXCLUDED.risk_tier, explanation_json = EXCLUDED.explanation_json, trust_model_version = EXCLUDED.trust_model_version, computed_at = EXCLUDED.computed_at`,
      [agentId, result.score, result.riskTier, JSON.stringify(result.explanation)]
    );
    promMetrics.trustComputeDuration.observe((Date.now() - trustStart) / 1000);
    return reply.send(result);
  });

  app.post("/handshake/verify", async (request, reply) => {
    const subject = (request.headers["x-agent-id"]?.toString() ?? request.ip).toString();
    if (!(await enforceRateLimit(subject, "handshake_verify"))) {
      return reply.code(429).send({ valid: false, reason: "rate_limited" });
    }
    const input = z
      .object({
        agent_id: z.string(),
        handshake_req_jws: z.string(),
        requested_scopes: z.array(z.string()),
        nonce: z.string(),
        timestamp: z.number()
      })
      .parse(request.body);
    const revoked = await isRevoked(input.agent_id);
    if (revoked) {
      promMetrics.handshakeVerifyTotal.inc({ result: "failure" });
      return reply.code(403).send({ valid: false, reason: "agent_revoked" });
    }
    const jwk = await getLatestPublicJwk(input.agent_id);
    if (!jwk) {
      promMetrics.handshakeVerifyTotal.inc({ result: "failure" });
      return reply.code(404).send({ valid: false, reason: "public_key_missing" });
    }
    const payload = await verifyAgentJwt(input.handshake_req_jws, jwk);
    const clientVersion = (payload.protocol_version as string) ?? "0.0.0";
    const versionCheck = checkProtocolVersion(clientVersion);
    if (!versionCheck.compatible) {
      promMetrics.handshakeVerifyTotal.inc({ result: "failure" });
      return reply.code(400).send({ valid: false, reason: versionCheck.reason });
    }
    const withinSkew = Math.abs(Date.now() - input.timestamp) <= config.timestampSkewMs;
    const sameScopes =
      Array.isArray(payload.requested_scopes) &&
      payload.requested_scopes.length === input.requested_scopes.length &&
      payload.requested_scopes.every(
        (scope, index) => typeof scope === "string" && scope === input.requested_scopes[index]
      );
    if (!withinSkew || payload.nonce !== input.nonce || payload.ts !== input.timestamp || !sameScopes) {
      promMetrics.handshakeVerifyTotal.inc({ result: "failure" });
      return reply.code(401).send({ valid: false, reason: "handshake_invalid" });
    }
    promMetrics.handshakeVerifyTotal.inc({ result: "success" });
    return reply.send({
      valid: true,
      session_proposal: {
        session_id: `sess_${randomUUID().slice(0, 12)}`,
        expires_at: new Date(Date.now() + 5 * 60_000).toISOString(),
        accepted_scopes: input.requested_scopes
      }
    });
  });

  app.post("/handshake/session", async (request, reply) => {
    if (!(await verifyAdminAuth(request.headers as Record<string, unknown>))) {
      return reply.code(401).send({ error: "admin_auth_required" });
    }
    const input = z.object({ agent_id: z.string(), accepted_scopes: z.array(z.string()) }).parse(request.body);
    const token = await signCertificate({
      type: "session_token",
      agent_id: input.agent_id,
      scopes: input.accepted_scopes,
      session_id: `sess_${randomUUID().slice(0, 12)}`
    });
    return reply.send({ session_token: token });
  });

  app.get("/audit", async (request, reply) => {
    if (!(await verifyAdminAuth(request.headers as Record<string, unknown>))) {
      return reply.code(401).send({ error: "admin_auth_required" });
    }
    const queryInput = z
      .object({
        actor_id: z.string().optional(),
        action: z.string().optional(),
        from: z.string().datetime().optional(),
        to: z.string().datetime().optional(),
        limit: z.coerce.number().int().positive().max(500).default(100)
      })
      .parse(request.query);

    const where: string[] = [];
    const values: unknown[] = [];

    if (queryInput.actor_id) {
      values.push(queryInput.actor_id);
      where.push(`actor_id = $${values.length}`);
    }
    if (queryInput.action) {
      values.push(queryInput.action);
      where.push(`action = $${values.length}`);
    }
    if (queryInput.from) {
      values.push(queryInput.from);
      where.push(`ts >= $${values.length}`);
    }
    if (queryInput.to) {
      values.push(queryInput.to);
      where.push(`ts <= $${values.length}`);
    }
    values.push(queryInput.limit);
    const sql = `SELECT * FROM audit_logs ${
      where.length > 0 ? `WHERE ${where.join(" AND ")}` : ""
    } ORDER BY ts DESC LIMIT $${values.length}`;
    const rows = await query(sql, values);
    return reply.send({ rows });
  });
}
