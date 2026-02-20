# NEXUS Protocol

**N**etwork for **E**xchange and **T**rust **U**nified by **S**ignatures

A centralized, open-source Agent Identity & Trust Layer for secure AI-to-AI (A2A) economic interaction. NEXUS provides verifiable identity, cryptographic verification, capability-scoped permissions, and trust scoring for autonomous agents.

> *The agent economy will not fail due to lack of intelligence. It will fail due to lack of trust.*  
> NEXUS is the foundational infrastructure for agent-native identity and trust.

---

## Features

- **Agent Identity Issuance** — Unique agent IDs, signed certificates, capability manifests
- **Cryptographic Verification** — Ed25519 signatures, nonce replay protection, timestamp validation
- **Trust Scoring** — Rule-based trust engine with success/failure/SLA inputs
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
git clone https://github.com/Williams-Creative/nexus-protocol.git
cd nexus-protocol
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
nexus-protocol/
├── backend/api/          # API server (Fastify, TypeScript)
├── sdk/typescript/       # TypeScript SDK
├── sdk/python/           # Python SDK
├── infra/                # Docker Compose, Prometheus alerts
└── docs/                 # API, crypto, handshake, threat model
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [API Specification](docs/api.md) | REST endpoints and auth |
| [Cryptographic Flow](docs/crypto.md) | Ed25519, JWT, verification flow |
| [Handshake Protocol](docs/handshake.md) | A2A session establishment |
| [Threat Model](docs/threat-model.md) | Security and mitigations |
| [Deployment & Pilot](docs/deployment-and-pilot.md) | Rollout, rollback, SLOs |
| [Enterprise Onboarding](docs/enterprise-onboarding.md) | Compliance and onboarding |

---

## SDKs

- **TypeScript**: `sdk/typescript/` — Sign requests, verify, handshake
- **Python**: `sdk/python/` — Same capabilities

---

## License

MIT License — see [LICENSE](LICENSE). Copyright (c) 2025 Williams Creative.

**Trademark:** NEXUS and NEXUS Protocol are trademarks of Williams Creative. Use of the NEXUS name or branding in a manner that implies endorsement or causes confusion is not permitted. See [TRADEMARK.md](TRADEMARK.md) for details.

---

## Open vs Closed

| Open (this repo) | Closed (Williams Creative offerings) |
|------------------|--------------------------------------|
| API server, SDKs, protocol | Managed hosting, enterprise dashboards |
| Identity, verification, trust, handshake | Escrow, conditional transactions (Phase 2) |
| Self-host deployment | Compliance UI, usage analytics |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## Security

Report vulnerabilities to [SECURITY.md](SECURITY.md).
