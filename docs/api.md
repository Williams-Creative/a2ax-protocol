# API Specification (MVP)

Base URL: `http://localhost:8080/v1`

## Security headers and auth

- Admin endpoints require `x-admin-api-key`.
- Verification and event ingestion are rate-limited per minute (`RATE_LIMIT_PER_MINUTE`).

## Identity endpoints

### POST /orgs (admin)

**Request:**

```json
{
  "name": "Example Org",
  "verification_tier": "verified"
}
```

**Response (201):**

```json
{
  "org_id": "org_abc123def456"
}
```

### POST /agents/register (admin)

**Request:**

```json
{
  "org_id": "org_abc123def456",
  "display_name": "my-agent",
  "metadata": {},
  "public_jwk": {
    "kty": "OKP",
    "crv": "Ed25519",
    "x": "<base64url-public-key>"
  },
  "capability_manifest": {
    "scopes": [{ "name": "data_access" }],
    "restricted_operations": []
  }
}
```

**Response (201):**

```json
{
  "agent_id": "agt_xyz789",
  "cert_jws": "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...",
  "capability_manifest_hash": "sha256:..."
}
```

### POST /verify/portable

**Request:**

```json
{
  "certificate_jws": "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...",
  "revocation_status": "active",
  "require_revocation_check": false
}
```

**Response (200, valid):**

```json
{
  "valid": true,
  "payload": {
    "agent_id": "agt_xyz789",
    "org_id": "org_abc123",
    "iss": "a2ax-protocol",
    "exp": 1234567890
  }
}
```

**Response (201/403, invalid):**

```json
{
  "valid": false,
  "reason": "issuer_not_trusted"
}
```

**Response (401, invalid):**

```json
{
  "valid": false,
  "reason": "expired"
}
```

### POST /handshake/verify

**Request:**

```json
{
  "agent_id": "agt_xyz789",
  "handshake_req_jws": "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...",
  "requested_scopes": ["data_access"],
  "nonce": "uuid-here",
  "timestamp": 1700000000000
}
```

**Response (200, valid):**

```json
{
  "valid": true,
  "session_proposal": {
    "session_id": "sess_abc123",
    "expires_at": "2026-02-20T21:00:00.000Z",
    "accepted_scopes": ["data_access"]
  }
}
```

## Other endpoints

- `GET /orgs/{orgId}` (admin)
- `POST /agents/{agentId}/revoke` (admin)
- `GET /agents/{agentId}`
- `PUT /agents/{agentId}/capabilities`
- `GET /agents/{agentId}/capabilities`
- `POST /verify` (legacy, registry-based)
- `POST /trust/events`
- `GET /agents/{agentId}/trust`
- `POST /handshake/session` (admin)
- `GET /audit?actor_id=&action=&from=&to=&limit=` (admin)
- `GET /issuer/{issuerId}`
- `GET /health`, `GET /healthz`, `GET /readyz`
