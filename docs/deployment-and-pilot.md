# Deployment and Pilot Guide

## 1) Provision secrets

**SECURITY:** Never use the default `replace-with-strong-admin-api-key` in production. Always set a strong, unique key.

1. Generate issuer key:
   - `cd backend/api`
   - `npm run keygen:issuer`
2. Set a strong `ADMIN_API_KEY` in compose/env (min 16 chars).
3. Optional: Use KMS for issuer signing (`KMS_KEY_ARN`, `AWS_REGION`).

## 2) Start stack

Create `.env` at project root (copy from `.env.example`) and set `ADMIN_API_KEY` before running.

- `docker compose -f infra/docker-compose.yml up --build`

## 3) Validate readiness
- `GET /healthz` must return `{"ok":true}`
- `GET /readyz` must return `{"ok":true}`

## 4) Run pilot smoke flow
- `cd backend/api`
- `$env:ADMIN_API_KEY="your-admin-key"; npm run pilot:smoke`
- Expect output with `ok: true` and non-empty `org_id`/`agent_id`.

## 5) Run integration tests
- Rebuild and start stack: `docker compose -f infra/docker-compose.yml up -d --build`
- `cd backend/api && $env:ADMIN_API_KEY="your-admin-key"; npm run test:integration`

## 6) Pilot test checklist
- Register/revoke lifecycle verified.
- Replay prevention verified (`nonce_replay` on duplicate).
- Rate limits verified (`429` when threshold exceeded).
- Audit export verified for pilot operations.
- Trust score reflects telemetry-provided `raw.uptime_reliability`.
- Admin token exchange (`POST /v1/admin/token`) returns JWT.
- JWT authenticates admin endpoints.

## 7) Production hardening before public rollout
- Replace file-based issuer signing with managed KMS/HSM.
- Move admin key to secret manager and rotate regularly.
- Enable TLS termination with strict transport settings.
- Add centralized metrics/alerts and immutable audit archiving.

---

## Rollout procedure

1. **Pre-rollout**
   - Run `npm run build` and `npm run test:unit`.
   - Run `npm run test:integration` against staging.
   - Confirm `ADMIN_API_KEY`, `ISSUER_PRIVATE_JWK_FILE` (or `KMS_KEY_ARN`) are set.

2. **Deploy**
   - `docker compose -f infra/docker-compose.yml up -d --build`
   - Wait for healthchecks (postgres, redis, api).

3. **Post-rollout**
   - `GET /healthz` and `GET /readyz` return 200.
   - `npm run pilot:smoke` succeeds.
   - Scrape `GET /metrics` for Prometheus.

## Rollback procedure

1. **Immediate rollback**
   - `docker compose -f infra/docker-compose.yml down`
   - Restore previous image/tag: `docker compose -f infra/docker-compose.yml up -d` with prior build.

2. **Data rollback** (if schema changed)
   - Restore Postgres from backup.
   - Restart stack.

3. **Verification**
   - Re-run pilot smoke and integration tests.

## Incident response runbook

| Severity | Condition | Action |
|----------|-----------|--------|
| P1 | API unreachable, `/readyz` 503 | Restart api container; check Postgres/Redis; escalate if DB down |
| P1 | High error rate on `/verify` | Check `agent_identity_verify_total{result="failure"}`; inspect `reason`; revoke compromised agents if needed |
| P2 | Spike in `agent_identity_replay_denials_total` | Possible replay attack; review audit logs; consider rate-limit tightening |
| P2 | Spike in `agent_identity_rate_limit_hits_total` | Legitimate load or abuse; adjust `RATE_LIMIT_PER_MINUTE` if needed |
| P2 | `agent_identity_verify_duration_seconds` p99 > 2s | Check DB/Redis latency; scale or optimize |
| P3 | Admin auth failures (`admin_auth_total{result="jwt_invalid"}`) | Token expiry; clients should refresh via `POST /v1/admin/token` |

**Contact**: Designate on-call for pilot; document escalation path.

## SLO definitions (pilot)

| SLO | Target | Measurement |
|-----|--------|-------------|
| Availability | 99.5% | `(requests_ok / requests_total)` over 30d |
| Verify latency p99 | < 500ms | `agent_identity_verify_duration_seconds` histogram |
| Verify success rate | ≥ 98% | `agent_identity_verify_total{result="success"}` / `agent_identity_verify_total` |
| Replay denials | Alert on >10/min | `rate(agent_identity_replay_denials_total[1m])` |

## Metrics and alerts

- **Endpoint**: `GET /metrics` (Prometheus format)
- **Alert rules**: See `infra/prometheus-alerts.yml` for recommended thresholds.
