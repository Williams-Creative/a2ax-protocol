# A2A Handshake Protocol (MVP)

## Step 1: Initiate
Agent A sends:
- `agent_id`
- `agent_cert_jws`
- `capability_manifest`
- `handshake_req_jws` (signed payload with `nonce`, `ts`, `requested_scopes`, `session_ttl_s`)

## Step 2: Verify
Agent B calls `POST /v1/handshake/verify`.

Registry verifies:
- Revocation status
- Agent key presence
- JWS validity
- Nonce/timestamp consistency

## Step 3: Session proposal
Registry returns:
- `valid`
- `session_proposal.session_id`
- `session_proposal.expires_at`
- `session_proposal.accepted_scopes`

## Optional Step 4: Registry session token
Agent B calls `POST /v1/handshake/session` to receive a server-signed `session_token`.
