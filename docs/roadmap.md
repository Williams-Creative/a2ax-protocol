# A2AX Protocol Roadmap

Public roadmap for the A2AX Protocol. Scope is neutral; no commercial tier details.

## Near-term

- **Trust bundle implementation** — Done. Bundle manifest format, `a2ax trust install` CLI, empty community/enterprise bundles.
- **Dev/demo community bundle** — Done. Optional seed script for local testing (opt-in, dev-only).
- **Federation design** — Issuer discovery, remote issuer fetch API, trust sync semantics (see [federation-roadmap.md](federation-roadmap.md))

## Medium-term

- **Federation implementation** — Implement `FederationClient`, wire into verify flow, cross-registry trust

## Long-term

- **Escrow semantics** — Hold/release, conditional settlement
- **Attestation chains** — Signed infrastructure/identity attestations feeding trust
- **Delegation chains** — Agent A delegates to Agent B with constrained sub-scopes

## Principles

- Phases are sequenced by dependency, not calendar
- Protocol changes require spec update and compatibility verification
- See [governance.md](governance.md) for contribution and versioning rules
