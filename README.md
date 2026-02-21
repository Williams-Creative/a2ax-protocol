# A2AX Protocol

**A**gent **t**o **A**gent **E**xchange

**A2AX is the open trust standard and identity layer for autonomous economic systems.** It provides verifiable identity, cryptographic verification, capability-scoped permissions, and trust scoring for AI-to-AI (A2A) interaction—enabling agents to transact, attest, and collaborate with confidence.

> *The agent economy will not fail due to lack of intelligence. It will fail due to lack of trust.*  
> A2AX is the foundational infrastructure for agent-native identity and trust.

**This protocol does not require A2AX-operated infrastructure to function.** You can fork, self-host, and run verification independently.

**A2AX defines verification mechanics. Trust policy is verifier-controlled.** No embedded trust anchors; trust store ships empty.

---

## Architecture: Three Layers

| Layer | Scope | Contents |
|-------|-------|----------|
| **Layer 1 – A2AX Protocol** (this repo) | Core trust logic | Identity, Attestations, Events, Verification, Handshake |
| **Layer 2 – Optional Extensions** | Pluggable contracts | Risk scoring, Escrow, Compliance (interfaces only) |
| **Layer 3 – Commercial Services** (not in repo) | Hosted offerings | Managed trust graph, Enterprise dashboards, Economic network services |

The protocol (`/protocol`) compiles and runs in isolation. Extensions and commercial services are optional.

---

## Features

- **Agent Identity Issuance** — Unique agent IDs, signed certificates, capability manifests
- **Cryptographic Verification** — Ed25519 signatures, nonce replay protection, timestamp validation
- **Portable Certificates** — Verify without registry; trust store + policy engine
- **Trust Scoring** — Rule-based trust engine (extensible via TrustScoring interface)
- **Capability Declaration** — Scope-based permissions with amount limits and restricted operations
- **A2A Handshake** — Secure session establishment between agents
- **Audit & Compliance** — Append-only audit logs, correlation IDs, filtered export

---

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+

### 1. Clone and setup

```bash
git clone https://github.com/Williams-Creative/a2ax-protocol.git
cd a2ax-protocol
```

### 2. Provision secrets

```bash
cd backend/api
npm install
npm run keygen:issuer
```

Copy `.env.example` to `.env` and set a strong `ADMIN_API_KEY` (min 16 chars).

### 3. Start the stack

Copy `.env.example` to `.env` at project root and set `ADMIN_API_KEY`:

```bash
cp .env.example .env
# Edit .env and set a strong ADMIN_API_KEY (min 16 chars)
docker compose -f infra/docker-compose.yml up --build
```

### 4. Verify

- `GET http://localhost:8080/healthz` → `{"ok":true}`
- `GET http://localhost:8080/readyz` → `{"ok":true}`
- Run pilot smoke: `ADMIN_API_KEY=your-key npm run pilot:smoke` (from `backend/api`)

---

## Project Structure

```
a2ax-protocol/
├── protocol/             # Core trust logic (certificate, identity, crypto, handshake, permissions, trust store, policy)
├── config/               # defaultPolicy.yaml, trust/anchors/
├── bundles/              # Optional trust bundles (community, enterprise)
├── cli/                  # a2ax trust install
├── sdk/typescript/       # TypeScript SDK
├── sdk/python/           # Python SDK
├── extensions/           # Optional interfaces (TrustScoring, Escrow, Compliance) + examples
├── backend/api/          # HTTP server (depends on protocol)
├── infra/                # Docker Compose, Prometheus alerts
└── docs/                 # API, trust model, portable certs, federation, governance
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [Specification](docs/specification.md) | Formal spec: abstract, design principles, terminology |
| [Manifesto](docs/manifesto.md) | Philosophical anchor and positioning |
| [API Specification](docs/api.md) | REST endpoints and auth |
| [Architecture](docs/architecture.md) | Layered model, data flow, fork scenario |
| [Trust Model](docs/trust-model.md) | Verifier-controlled trust, no embedded anchors |
| [Portable Certificates](docs/portable-certificates.md) | Verify without registry |
| [Trust Bundles](docs/trust-bundles.md) | Installable issuer keys |
| [Federation Roadmap](docs/federation-roadmap.md) | Cross-registry trust (future) |
| [Governance](docs/governance.md) | Contribution, versioning, neutrality |
| [Governance Philosophy](docs/governance-philosophy.md) | What A2AX is and is not |
| [Cryptographic Flow](docs/crypto.md) | Ed25519, JWT, verification flow |
| [Handshake Protocol](docs/handshake.md) | A2A session establishment |
| [Security](docs/security.md) | Revocation, key rotation |
| [Threat Model](docs/threat-model.md) | Security and mitigations |
| [Deployment & Pilot](docs/deployment-and-pilot.md) | Rollout, rollback, SLOs |
| [Production Hardening](docs/production-hardening.md) | KMS, secrets, TLS, audit archiving |
| [Enterprise Onboarding](docs/enterprise-onboarding.md) | Optional commercial onboarding |
| [Versioning](VERSION.md) | Semantic versioning, compatibility rules |

---

## SDKs

- **TypeScript**: `sdk/typescript/` — Sign requests, verify, handshake
- **Python**: `sdk/python/` — Same capabilities

---

## License

MIT License — see [LICENSE](LICENSE). Copyright (c) 2026 Williams Creative.

**Trademark:** A2AX and A2AX Protocol are trademarks of Williams Creative. Use of the A2AX name or branding in a manner that implies endorsement or causes confusion is not permitted. See [TRADEMARK.md](TRADEMARK.md) for details.

---

## Open vs Closed

| Open (this repo) | Closed (Williams Creative offerings) |
|------------------|--------------------------------------|
| Protocol, API server, SDKs | Managed hosting, enterprise dashboards |
| Identity, verification, trust, handshake | Escrow, conditional transactions (Phase 2) |
| Self-host deployment | Compliance UI, usage analytics |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## Security

Report vulnerabilities to [SECURITY.md](SECURITY.md).
