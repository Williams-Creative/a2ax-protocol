import { Counter, Histogram, Registry } from "prom-client";

export const register = new Registry();

export const metrics = {
  verifyTotal: new Counter({
    name: "agent_identity_verify_total",
    help: "Total verification requests",
    labelNames: ["result", "reason"],
    registers: [register]
  }),
  verifyDuration: new Histogram({
    name: "agent_identity_verify_duration_seconds",
    help: "Verification request duration",
    labelNames: ["result"],
    registers: [register]
  }),
  rateLimitHits: new Counter({
    name: "agent_identity_rate_limit_hits_total",
    help: "Rate limit rejections",
    labelNames: ["endpoint"],
    registers: [register]
  }),
  replayDenials: new Counter({
    name: "agent_identity_replay_denials_total",
    help: "Replay attack denials",
    registers: [register]
  }),
  trustComputeDuration: new Histogram({
    name: "agent_identity_trust_compute_duration_seconds",
    help: "Trust score computation duration",
    registers: [register]
  }),
  handshakeVerifyTotal: new Counter({
    name: "agent_identity_handshake_verify_total",
    help: "Handshake verification requests",
    labelNames: ["result"],
    registers: [register]
  }),
  adminAuthTotal: new Counter({
    name: "agent_identity_admin_auth_total",
    help: "Admin authentication attempts",
    labelNames: ["result"],
    registers: [register]
  })
};
