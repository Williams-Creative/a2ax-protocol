# Architecture

## Layered Diagram

![A2AX layered architecture](assets/architecture-layered.svg)

*SVG above displays on all devices; Mermaid below renders on desktop/GitHub web.*

```mermaid
flowchart TB
  subgraph L1 ["Layer 1: A2AX Protocol"]
    identity[identity]
    crypto[crypto]
    handshake[handshake]
    permissions[permissions]
    attestation[attestation]
    events[events]
    audit[audit]
    version[version]
    revocation[revocation]
  end

  subgraph L2 ["Layer 2"]
    L2_header["Optional Extensions"]
    TrustScoring[TrustScoring]
    Escrow[Escrow]
    Compliance[Compliance]
  end
  style L2_header fill:#e8f5e9,stroke:#4caf50

  subgraph L3 ["Layer 3: Services (Future)"]
    mgmt_graph[Managed trust graph]
    dashboards[Dashboards]
    analytics[Analytics]
    economic[Economic services]
  end

  L2 --> L1
  L3 -.-> L2
  L3 -.-> L1
```

## Data Flow

1. **Registration**: Admin creates org → registers agent with public key + capability manifest → server issues signed certificate.
2. **Verification**: Agent signs request (JWT with agent_id, scope, nonce, ts) → server verifies JWT, checks revocation, evaluates scope → returns valid/invalid.
3. **Handshake**: Agent sends handshake JWT (requested_scopes, nonce, ts) → server verifies, returns session proposal.
4. **Trust Events**: Agent or system records success/failure/SLA → trust engine computes score.

## Handshake Lifecycle

![A2AX handshake lifecycle](assets/handshake-lifecycle.svg)

*SVG above displays on all devices; Mermaid below renders on desktop/GitHub web.*

```mermaid
sequenceDiagram
  participant Client
  participant Server
  Client->>+Server: POST /handshake/verify
  Note right of Client: agent_id, handshake_req_jws, requested_scopes, nonce, timestamp
  Server->>Server: Check revocation
  Server->>Server: Verify JWT (public key)
  Server->>Server: Check protocol_version
  Server->>Server: Validate timestamp skew
  Server->>Server: Validate nonce + scopes
  Server-->>-Client: valid, session_proposal
  Client->>+Server: POST /handshake/session (admin auth)
  Note right of Client: agent_id, accepted_scopes
  Server-->>-Client: session_token
```

## Extension Injection Model

The server injects implementations for:

- **IssuerSigner**: Signs certificates (file JWK or KMS)
- **AuditWriter**: Writes audit logs (e.g. Postgres)
- **RevocationProvider**: Checks if agent is revoked (e.g. Postgres + Redis)
- **TrustScoring** (optional): Computes risk score from attestation graph

Protocol defines interfaces; server provides implementations. No A2AX-specific infrastructure required.

## Governance Boundaries

- **Protocol**: No imports from `/sdk`, `/extensions`, admin, billing, enterprise, onboarding, analytics.
- **Extensions**: Depend on protocol only; no implementations in interfaces.
- **Server**: Depends on protocol + extensions; implements storage, auth, metrics.

## Example Fork Scenario

1. Fork this repo.
2. Build `protocol/` in isolation (`npm run build` in protocol).
3. Replace server implementation: use your own Postgres, Redis, or different storage.
4. Implement `RevocationProvider`, `AuditWriter`, `IssuerSigner` with your infrastructure.
5. Deploy. The protocol verifies agents without any A2AX-operated services.

The protocol compiles, runs tests, and verifies agents even if A2AX (the company) disappears.
