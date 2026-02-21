# A2AX Protocol Versioning

## Semantic Versioning

The A2AX Protocol follows [Semantic Versioning](https://semver.org/) (MAJOR.MINOR.PATCH):

- **MAJOR**: Breaking changes to the protocol. Incompatible handshakes, schema changes that invalidate existing agents/certs.
- **MINOR**: New features, backward-compatible. New attestation types, optional fields.
- **PATCH**: Bug fixes, documentation, no behavioral changes.

## Breaking Change Policy

- **Major version bump** when:
  - Handshake payload structure changes incompatibly
  - Certificate or attestation schema changes break verification
  - Capability manifest schema changes break scope evaluation
  - Identity format changes

- **Minor version bump** when:
  - New optional fields are added
  - New attestation types (existing ones unchanged)
  - New event types

## Deprecation Policy

- Deprecated fields/behaviors are supported for at least one minor version.
- Deprecation is announced in release notes and docs.
- Removal occurs in the next major version.

## Compatibility Rules

- **Handshake**: Client and server must share the same major version.
- **Minor/patch**: Server may support older minor versions; client may connect to newer server minor versions.
- **No silent failures**: Version mismatch must return explicit error (`protocol_version_mismatch`).
