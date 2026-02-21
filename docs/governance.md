# Governance

## Contribution Model

- Contributions are welcome via pull requests.
- Follow the code style and test requirements in the repo.
- Breaking changes to the protocol require a major version bump and discussion.

## Spec Update Rules

- Protocol changes that affect handshake, verification, or identity require:
  - Update to `protocol/version` constant
  - Update to `VERSION.md` and release notes
  - SDK and server compatibility verification

## Version Release Process

1. Update `PROTOCOL_VERSION` in `protocol/src/version/constants.ts`
2. Update `VERSION.md` with changelog
3. Run full test suite (protocol isolation + backend + SDK)
4. Tag release (e.g. `v1.1.0`)

## Separation Policy (Core vs Extensions)

- **Core (`/protocol`)**: Identity, crypto, handshake, permissions, attestation, events, audit, version. No dependencies on SDK, extensions, or commercial modules.
- **Extensions (`/extensions`)**: Optional interfaces (TrustScoring, Escrow, Compliance). Implementations live in server or third-party packages.
- **Protocol must run without extensions.** Extensions depend on protocol; protocol does not depend on extensions.

## Neutrality Commitment

- The protocol is vendor-neutral and forkable.
- No hardcoded A2AX endpoints or commercial hooks in the protocol.
- Revocation, trust scoring, and storage are injectable; implementations can use any infrastructure.
