# Threat Model (MVP)

## In-scope threats
- Agent impersonation
- Replay attacks
- Privilege escalation via over-broad scopes
- Key compromise and stale key usage
- DoS against verification and trust endpoints
- Audit tampering attempts

## Mitigations
- Ed25519 signatures with verified public JWK.
- Issuer private key can be loaded from mounted file (`ISSUER_PRIVATE_JWK_FILE`) to avoid inline secret exposure.
- Nonce uniqueness via Redis with TTL and timestamp window checks.
- Capability policy with explicit restricted operations.
- Revocation table + Redis cache for immediate deny.
- Stateless API instances and pre-verification checks before expensive operations.
- Append-only audit logging with request correlation IDs.
- Admin API key gate on org/registration/revocation/audit/session issuance endpoints.
- Per-subject request throttling on verification, trust-event ingestion, and handshake verification.

## Residual risks
- For production scale, move issuer signing to managed KMS/HSM and rotate keys with overlap windows.
- Pilot uptime reliability now supports event telemetry (`raw.uptime_reliability`), but should be sourced from signed infrastructure probes for stronger attestations.
