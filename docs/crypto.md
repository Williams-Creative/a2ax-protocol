# Cryptographic Flow

## Algorithms
- Primary algorithm: `Ed25519` (`EdDSA` in JOSE).
- Request format: JWT-like signed JWS payload.

## Certificate issuance
- Registry signs an identity certificate (`cert_jws`) containing:
  - `agent_id`, `org_id`, `public_jwk`, `capability_manifest_hash`, `status`.
- Certificates are persisted in `agent_certificates`.

## Request verification
Each request includes:
- `agent_id`
- `token` (signed JWS)
- `nonce`
- `timestamp`
- `scope`

Verification checks:
1. Revocation status.
2. Public key lookup from `agent_keys`.
3. Signature verification.
4. Timestamp window.
5. Nonce uniqueness in Redis.
6. Capability policy authorization.
