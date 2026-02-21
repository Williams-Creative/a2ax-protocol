# Portable Certificates

A2AX Agent Certificates can be verified without contacting the registry.

## Format

Certificates are JWTs (JWS compact) with claims:

- `agent_id` — Agent identifier
- `public_jwk` or `public_key` — Agent's public key
- `org_id` — Organization (optional)
- `capability_manifest_hash` — Hash of capabilities (optional)
- `iss` — Issuer ID (required for verification)
- `exp` — Expiry
- `revocation_url` — Optional revocation endpoint

## Verification Flow

1. Parse JWT, extract `iss` (issuer ID)
2. Look up issuer in trust store
3. If not found → `issuer_not_trusted`
4. Verify signature with issuer public key
5. Check `exp` → reject if expired
6. Optionally check revocation
7. Policy evaluation

## Trust Store

The trust store holds issuer public keys. Empty by default. Add issuers via:

- `config/trust/anchors/*.pem` or `*.json`
- Trust bundle: `a2ax trust install <bundle>`
- Federation (future)

## Endpoint

`POST /v1/verify/portable` — Verifies certificate using trust store. No registry lookup.
