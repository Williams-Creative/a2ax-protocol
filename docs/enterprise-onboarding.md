# Enterprise Onboarding (MVP)

## Onboarding sequence
1. Create organization (`POST /v1/orgs`) with verification tier.
2. Register agent identities under org (`POST /v1/agents/register`).
3. Store issued `cert_jws` and private key in enterprise key vault.
4. Integrate request signing/verification using TypeScript or Python SDK.
5. Configure audit ingestion and export requirements.

## Verification tiers
- `unverified`: baseline access.
- `verified`: elevated trust weighting.
- `enterprise`: highest trust weighting and compliance-first workflows.

## Compliance operations
- Query `GET /v1/audit` by actor, action, and time range.
- Preserve audit exports in enterprise retention storage.
- Enforce immediate revocation on incidents with `POST /v1/agents/{agentId}/revoke`.
