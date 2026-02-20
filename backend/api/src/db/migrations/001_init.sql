CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  verification_tier TEXT NOT NULL DEFAULT 'unverified',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  status TEXT NOT NULL CHECK (status IN ('active', 'revoked')),
  display_name TEXT NOT NULL,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS agent_keys (
  agent_id TEXT NOT NULL REFERENCES agents(id),
  public_jwk_json JSONB NOT NULL,
  key_alg TEXT NOT NULL DEFAULT 'Ed25519',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rotated_at TIMESTAMPTZ,
  PRIMARY KEY (agent_id, created_at)
);

CREATE TABLE IF NOT EXISTS agent_certificates (
  agent_id TEXT NOT NULL REFERENCES agents(id),
  cert_jws TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  issuer_kid TEXT NOT NULL,
  PRIMARY KEY (agent_id, issued_at)
);

CREATE TABLE IF NOT EXISTS agent_capabilities (
  agent_id TEXT PRIMARY KEY REFERENCES agents(id),
  manifest_json JSONB NOT NULL,
  manifest_hash TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trust_events (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES agents(id),
  type TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  latency_ms INTEGER,
  amount_cents INTEGER,
  dispute BOOLEAN NOT NULL DEFAULT FALSE,
  sla_met BOOLEAN,
  occurred_at TIMESTAMPTZ NOT NULL,
  raw_json JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS trust_scores (
  agent_id TEXT PRIMARY KEY REFERENCES agents(id),
  score INTEGER NOT NULL,
  risk_tier TEXT NOT NULL,
  explanation_json JSONB NOT NULL,
  trust_model_version TEXT NOT NULL DEFAULT 'v1',
  computed_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  request_id TEXT NOT NULL,
  ip TEXT,
  user_agent TEXT,
  details_json JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS revocations (
  agent_id TEXT PRIMARY KEY REFERENCES agents(id),
  reason TEXT NOT NULL,
  revoked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agents_org_id ON agents(org_id);
CREATE INDEX IF NOT EXISTS idx_trust_events_agent_id_time ON trust_events(agent_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_request_id ON audit_logs(request_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ts ON audit_logs(ts DESC);
