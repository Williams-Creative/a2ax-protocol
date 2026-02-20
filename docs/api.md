# API Specification (MVP)

Base URL: `http://localhost:8080/v1`

## Security headers and auth
- Admin endpoints require `x-admin-api-key`.
- Verification and event ingestion are rate-limited per minute (`RATE_LIMIT_PER_MINUTE`).

## Identity endpoints
- `POST /orgs` (admin)
- `GET /orgs/{orgId}` (admin)
- `POST /agents/register` (admin)
- `POST /agents/{agentId}/revoke` (admin)
- `GET /agents/{agentId}`

## Capability endpoints
- `PUT /agents/{agentId}/capabilities`
- `GET /agents/{agentId}/capabilities`

## Verification
- `POST /verify`
  - Validates signature, timestamp skew, nonce replay, revocation, and capability scope.

## Trust
- `POST /trust/events`
- `GET /agents/{agentId}/trust`

## Handshake
- `POST /handshake/verify`
- `POST /handshake/session` (admin)

## Audit
- `GET /audit?actor_id=&action=&from=&to=&limit=` (admin)

## Operational endpoints
- `GET /healthz` (liveness)
- `GET /readyz` (db + redis readiness)
