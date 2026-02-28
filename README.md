# A2AX-Core

[![CI](https://github.com/Williams-Creative/a2ax-core-protocol/actions/workflows/ci.yml/badge.svg)](https://github.com/Williams-Creative/a2ax-core-protocol/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Open Trust Infrastructure for Autonomous Agents**

---

A2AX-Core is an open, neutral trust protocol and identity layer for autonomous economic systems.

It provides:

* Cryptographic identity
* Portable verification
* Capability-scoped permissions
* Verifier-controlled trust policy
* Secure A2A handshake primitives

A2AX-Core enables agents to transact, attest, and collaborate **without centralized registries, embedded trust anchors, or platform lock-in.**

> *The agent economy will not fail due to lack of intelligence. It will fail due to lack of trust.*
> A2AX-Core is designed to prevent that failure.

**This protocol does not require A2AX-Core–operated infrastructure to function.**
You can fork, self-host, and run verification independently.

**The A2AX-Core Protocol defines verification mechanics. Trust policy is verifier-controlled.**
The trust store ships empty.

---

# Design Principles

A2AX-Core is built on five foundational principles:

### 1. Neutrality

No mandatory trust anchors.
No embedded registries.
No centralized authorities.

Verification policy is entirely verifier-controlled.

### 2. Portability

Certificates are self-contained and cryptographically verifiable without a live registry lookup.

### 3. Explicit Capability Scoping

Agents declare capabilities with scoped permissions and optional limits.
Trust decisions are contextual — not binary.

### 4. Cryptographic Integrity

All identity artifacts are signed using modern cryptography (Ed25519), with replay protection and timestamp validation.

### 5. Extensibility

Trust scoring, compliance logic, and economic extensions are pluggable via defined interfaces — not hardcoded into the protocol core.

---

# Architecture: Three Layers

| Layer                                   | Scope                        | Contents                                                                    |
| --------------------------------------- | ---------------------------- | --------------------------------------------------------------------------- |
| **Layer 1 – A2AX-Core Protocol** (this repo) | Core trust primitives        | Identity, Certificates, Verification, Trust Store, Policy Engine, Handshake |
| **Layer 2 – Optional Extensions**       | Pluggable modules            | Risk scoring, Escrow, Compliance (interfaces only)                          |
| **Layer 3 – Services (Future)**         | Hosted or ecosystem services | Managed trust graph, dashboards, analytics, economic services               |

The protocol compiles and runs in isolation.
Extensions are optional.
Services are not required.

The core remains open, neutral, and self-hostable.

**A2AX Ecosystem structure:**
- **A2AX-Core** — Trust & Identity Protocol (this repo)
- **A2AX-Extensions** — Optional modules (scoring, escrow, compliance)
- **A2AX-Services** — Non-core ecosystem services (future)

---

# Core Capabilities

* **Agent Identity Issuance** — Unique agent IDs, signed certificates, capability manifests
* **Cryptographic Verification** — Ed25519 signatures, nonce replay protection, timestamp validation
* **Portable Certificates** — Verify without registry; independent trust store configuration
* **Trust Scoring Engine** — Rule-based trust evaluation (extensible via interface)
* **Capability Declaration** — Scope-based permissions with optional quantitative limits
* **A2A Handshake Protocol** — Secure session establishment between agents
* **Audit & Compliance** — Append-only audit logs, correlation IDs, filtered export

---

# Quick Start

## Prerequisites

* Docker and Docker Compose
* Node.js 18+

---

## 1. Clone and Setup

```bash
git clone https://github.com/Williams-Creative/a2ax-core-protocol.git
cd a2ax-core-protocol
```

---

## 2. Provision Issuer Keys

```bash
cd backend/api
npm install
npm run keygen:issuer
```

Copy `.env.example` to `.env` and set a strong `ADMIN_API_KEY` (min 16 chars).

---

## 3. (Optional) Install Trust Bundle

Trust bundles allow portable verification by installing issuer public keys.

Install community bundle:

```bash
npx tsx cli/trust-bundle-install.ts community
```

For local testing:

```bash
npm run seed:dev-issuer
npx tsx cli/trust-bundle-install.ts community
```

Bundles ship empty by default.

See:
`docs/trust-bundles.md`

---

## 4. Start the Stack

Copy `.env.example` to `.env` at project root and set `ADMIN_API_KEY`:

```bash
cp .env.example .env
# Edit .env and set a strong ADMIN_API_KEY (min 16 chars)
docker compose -f infra/docker-compose.yml up --build
```

---

## 5. Verify

Health checks:

* `GET http://localhost:8080/healthz` → `{"ok":true}`
* `GET http://localhost:8080/readyz` → `{"ok":true}`

Run pilot smoke test:

```bash
ADMIN_API_KEY=your-key npm run pilot:smoke
```

(From `backend/api`)

**Portable verification:**
Set `TRUST_ANCHORS_DIR` (e.g. `../../config/trust/anchors`) in `backend/api/.env` to load issuer keys from the trust anchors directory.

---

# Project Structure

```
a2ax-core-protocol/
├── protocol/             # Core trust logic (identity, crypto, handshake, trust store, policy)
├── config/               # defaultPolicy.yaml, trust/anchors/
├── bundles/              # Optional trust bundles (community, enterprise)
├── cli/                  # a2ax trust install
├── sdk/typescript/       # TypeScript SDK
├── sdk/python/           # Python SDK
├── extensions/           # Optional interfaces (TrustScoring, Escrow, Compliance) + examples
├── backend/api/          # HTTP server (depends on protocol)
├── infra/                # Docker Compose, monitoring
└── docs/                 # Specifications, governance, trust model
```

---

# Documentation

| Document                                               | Description                    |
| ------------------------------------------------------ | ------------------------------ |
| [Protocol Identity Charter](docs/PROTOCOL_IDENTITY_CHARTER.md) | Naming doctrine, scope, principles |
| [Specification](docs/specification.md)                 | Formal protocol definition     |
| [Manifesto](docs/manifesto.md)                         | Philosophical anchor           |
| [Architecture](docs/architecture.md)                   | Layered model and data flow    |
| [Trust Model](docs/trust-model.md)                     | Verifier-controlled trust      |
| [Portable Certificates](docs/portable-certificates.md) | Registry-free verification     |
| [Trust Bundles](docs/trust-bundles.md)                 | Installable issuer keys        |
| [Cryptographic Flow](docs/crypto.md)                   | Ed25519, signing, verification |
| [Handshake Protocol](docs/handshake.md)                | A2A session establishment      |
| [Threat Model](docs/threat-model.md)                   | Risks and mitigations          |
| [API Specification](docs/api.md)                       | REST endpoints                 |
| [Example Walkthrough](docs/example-walkthrough.md)     | End-to-end flow                |
| [Governance](docs/governance.md)                       | Contribution and neutrality    |
| [Governance Philosophy](docs/governance-philosophy.md) | What A2AX-Core is and is not   |
| [Security](docs/security.md)                           | Revocation and key rotation    |
| [Production Hardening](docs/production-hardening.md)   | KMS, TLS, audit archiving      |
| [Deployment & Pilot](docs/deployment-and-pilot.md)     | Rollout and rollback           |
| [Enterprise Onboarding](docs/enterprise-onboarding.md) | Optional commercial onboarding |
| [Roadmap](docs/roadmap.md)                             | Public roadmap                 |
| [Federation Roadmap](docs/federation-roadmap.md)       | Cross-registry trust (future)  |
| [Versioning](VERSION.md)                               | Semantic versioning rules      |
| [Whitepapers](whitepapers/README.md)                    | LaTeX sources and build       |
| [001 Open Trust Standard](whitepapers/001_A2AX_Core_Open_Trust_Standard.tex) | Main whitepaper (arXiv) |
| [002 Overview (Informational)](whitepapers/002_A2AX_Core_Overview_Informational.tex) | Companion overview |
| [003 Protocol Specification](whitepapers/003_A2AX_Core_Protocol_Specification.tex) | Normative spec |
| [Release Notes v0.1.3](RELEASE_NOTES_v0.1.3.md)        | Public release notes           |

---

# SDKs

* **TypeScript** — `sdk/typescript/`
* **Python** — `sdk/python/`

SDKs provide helpers for signing, verification, and handshake orchestration.

---

# What A2AX-Core Is (and Is Not)

This repository provides foundational trust primitives.

It is not:

* A centralized registry
* A marketplace
* A tokenized system
* A ranking platform
* An economic exchange layer

It is infrastructure.

A2AX-Core defines the identity and trust substrate upon which autonomous economic systems can be built.

---

# Independence

A2AX-Core can be:

- Forked
- Self-hosted
- Verified without external services
- Extended without permission

No commercial service is required to use the protocol.

Trust policy remains fully verifier-controlled.

---

# License

MIT License — see [LICENSE](LICENSE).
Copyright (c) 2026 Williams Creative.

**Trademark:** A2AX-Core and A2AX-Core Protocol are trademarks of Williams Creative. Use of the A2AX-Core name or branding in a manner that implies endorsement or causes confusion is not permitted. See [TRADEMARK.md](TRADEMARK.md) for details.

---

# Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

Before submitting protocol changes:

1. Open an issue describing the proposal
2. Ensure alignment with core design principles
3. Update documentation accordingly

Protocol neutrality is non-negotiable.

---

# Security

Report vulnerabilities according to [SECURITY.md](SECURITY.md).

---

# Closing Position

A2AX-Core does not attempt to control the agent economy.

It provides the missing trust substrate.

If autonomous agents are to transact safely across systems, trust must be:

* Cryptographically verifiable
* Portable
* Contextual
* Verifier-controlled
* Open

That is what the A2AX-Core Protocol defines.
