# Changelog

All notable changes to the A2AX-Core Protocol are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.3] - 2026-02-25

### Added

- docs/assets/: SVG fallbacks for diagrams (mobile display on GitHub app)
  - architecture-layered.svg, handshake-lifecycle.svg, tls-termination-flow.svg
- docs/PROTOCOL_IDENTITY_CHARTER: Naming doctrine (A2AX-Core vs A2AX-Core Protocol vs A2AX Ecosystem)
- RELEASE_NOTES_v0.1.3.md: Public release notes (renamed from v0.1.0)

### Changed

- **Protocol rename:** A2AX → A2AX-Core. The protocol is now formally referred to as A2AX-Core to reflect its role as the foundational trust substrate of the A2AX ecosystem. The core protocol remains unchanged. See [PROTOCOL_IDENTITY_CHARTER](docs/PROTOCOL_IDENTITY_CHARTER) for naming doctrine.
- architecture.md: Add SVG fallbacks for layered and handshake diagrams; fix Layer 2 Mermaid label overlap; Layer 1 label to A2AX-Core Protocol
- production-hardening.md: Add SVG fallback for TLS termination flow
- handshake-lifecycle.svg: Fix dark text on dark background (white bg, improved contrast)
- architecture-layered.svg: Fix Layer 2 obscured text (increased padding); Layer 1 label to A2AX-Core Protocol
- README, specification, manifesto, governance, governance-philosophy, roadmap, enterprise-onboarding, security, trust-model, portable-certificates, github-setup, example-walkthrough: A2AX-Core naming
- TRADEMARK.md, CONTRIBUTING.md, VERSION.md, SECURITY.md: A2AX-Core naming
- whitepapers/001_A2AX_Open_Trust_Standard.tex: A2AX-Core naming; aligned with specification v1.0 and project scope (Terminology, Non-Goals, A2AX Ecosystem, Portable Agent Identity Certificate, expanded threat model, roadmap, spec reference)
- README.md: Table column alignment
- **Internal identifiers:** issuer claim `iss`, trust anchor filename, package name: `a2ax-protocol` → `a2ax-core-protocol` (issuer-signer, export-issuer-public, package.json, docs)

---

## [0.1.2] - 2026-02-24

### Added

- Whitepaper: LaTeX source for arXiv (whitepapers/001_A2AX_Open_Trust_Standard.tex)

### Changed

- architecture.md: Fix Mermaid layered diagram (quoted subgraph labels), convert handshake lifecycle to Mermaid sequence diagram
- production-hardening.md: Convert TLS termination flow to Mermaid flowchart
- .gitignore: Add whitepapers/drafts/

---

## [0.1.1] - 2026-02-24

### Changed

- Documentation alignment: README, governance, manifesto, specification, architecture, handshake, enterprise-onboarding, roadmap, governance-philosophy
- Aligned design principles (5-principle set) across specification and docs
- Expanded "What A2AX Is Not" in governance-philosophy
- Layer 3 wording: "Services (Future)" in architecture diagram
- Handshake: Registry → Server/Verifier; added verifier-controlled note
- CONTRIBUTING: Protocol Changes subsection with neutrality guidance
- Enterprise onboarding: neutrality intro; roadmap: open trust protocol intro

---

## [0.1.0] - 2026-02-23

### Added

- Trust bundle system: manifest format, `a2ax trust install` CLI, empty community/enterprise bundles
- Dev/demo community bundle: `npm run seed:dev-issuer` for local testing
- Public specification and manifesto
- End-to-end example walkthrough (docs/example-walkthrough.md)
- API request/response examples in docs/api.md
- `npm run export:issuer-public` to export issuer public key for portable verification
- CODE_OF_CONDUCT.md (Contributor Covenant v2.1)
- Issue templates (bug report, feature request) and PR template
- GitHub setup guide for maintainers
- README badges (CI, License)

### Changed

- Roadmap updated: trust bundle and dev/demo marked complete
- CONTRIBUTING expanded with protocol/backend setup and seed:dev-issuer
- TRUST_ANCHORS_DIR support in docker-compose and .env.example
