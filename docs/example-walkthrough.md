# End-to-End Example

This walkthrough demonstrates the full A2AX flow: create org, register agent, verify certificate, and handshake.

## Prerequisites

- Docker Compose running (Postgres, Redis, API)
- `ADMIN_API_KEY` set in `.env` at project root

## Step 1: Provision issuer and trust store

```bash
cd backend/api
npm run keygen:issuer
cd ../..
npm run export:issuer-public
```

This creates the issuer key and exports the public key to `config/trust/anchors/a2ax-protocol.json`. The API loads trust anchors when `TRUST_ANCHORS_DIR` is set (see docker-compose or backend `.env`).

## Step 2: Start the stack

```bash
cp .env.example .env
# Edit .env: set ADMIN_API_KEY (min 16 chars)
docker compose -f infra/docker-compose.yml up --build
```

## Step 3: Create org and register agent

```bash
# Create org
curl -X POST http://localhost:8080/v1/orgs \
  -H "Content-Type: application/json" \
  -H "x-admin-api-key: YOUR_ADMIN_API_KEY" \
  -d '{"name": "Example Org", "verification_tier": "verified"}'
# Response: {"org_id":"org_..."}

# Register agent (use org_id from above)
curl -X POST http://localhost:8080/v1/agents/register \
  -H "Content-Type: application/json" \
  -H "x-admin-api-key: YOUR_ADMIN_API_KEY" \
  -d '{
    "org_id": "org_xxx",
    "display_name": "example-agent",
    "public_jwk": {"kty":"OKP","crv":"Ed25519","x":"dGVzdC1wdWJsaWMta2V5"},
    "capability_manifest": {"scopes":[{"name":"data_access"}],"restricted_operations":[]}
  }'
# Response: {"agent_id":"agt_...","cert_jws":"eyJ...","capability_manifest_hash":"..."}
```

Save `cert_jws` from the response for the next step.

## Step 4: Verify certificate (portable)

```bash
curl -X POST http://localhost:8080/v1/verify/portable \
  -H "Content-Type: application/json" \
  -d '{"certificate_jws": "PASTE_CERT_JWS_HERE"}'
# Response: {"valid":true,"payload":{...}}
```

If you get `issuer_not_trusted`, ensure `TRUST_ANCHORS_DIR` is set and `export:issuer-public` was run.

## Step 5: Handshake (optional)

Use the TypeScript SDK to build a handshake request:

```typescript
import { buildHandshakeRequest } from "a2ax-sdk";

const { token, nonce, timestamp } = await buildHandshakeRequest(
  privateJwk,
  agentId,
  ["data_access"]
);

const res = await fetch("http://localhost:8080/v1/handshake/verify", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    agent_id: agentId,
    handshake_req_jws: token,
    requested_scopes: ["data_access"],
    nonce,
    timestamp
  })
});
// Response: {"valid":true,"session_proposal":{...}}
```

## Summary

| Step | Action |
|------|--------|
| 1 | keygen:issuer, export:issuer-public |
| 2 | Start stack with ADMIN_API_KEY |
| 3 | POST /orgs, POST /agents/register |
| 4 | POST /verify/portable with cert_jws |
| 5 | POST /handshake/verify (SDK) |
