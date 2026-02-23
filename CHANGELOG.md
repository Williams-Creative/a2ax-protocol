# Changelog

All notable changes to the A2AX Protocol are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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
