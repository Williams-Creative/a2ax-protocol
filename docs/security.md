# Security

## Revocation

### Revocation List Structure

Revoked agents are tracked via a revocation list. The protocol defines a `RevocationProvider` interface; the server implements it (e.g. Postgres + Redis cache).

- **Data**: `agent_id`, `reason`, `revoked_at`
- **Lookup**: `isRevoked(agentId): Promise<boolean>`
- **Check points**: During `/verify` and `/handshake/verify` before accepting any signed request

### Revocation Provider (Injectable)

The protocol does not depend on A2AX-operated infrastructure for revocation. The server injects a `RevocationProvider` that can read from:

- Local database
- Distributed revocation list (CRL, OCSP, or custom)
- Any append-only store

```typescript
interface RevocationProvider {
  isRevoked(agentId: string): Promise<boolean>;
}
```

## Key Rotation

### Issuer Key Rotation

1. Generate new Ed25519 key pair (or provision new KMS key)
2. Add new key to issuer configuration with new `kid`
3. Issue new certificates with new `kid`
4. Old certificates remain valid until expiry
5. Revoke old issuer key if needed (document in revocation list)

### Agent Key Rotation

1. Agent generates new key pair
2. Agent registers new public key (via admin API)
3. Server stores in `agent_keys`; latest key is used for verification
4. Old keys can be retained for grace period or revoked

### Certificate Revocation

- Revoked agents are rejected at verify and handshake
- Revocation is immediate (cache TTL applies)
- No dependency on external A2AX services for revocation checks
