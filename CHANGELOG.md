# Changelog

All notable changes to the A2AX Protocol are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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
