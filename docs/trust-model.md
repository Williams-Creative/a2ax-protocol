# Trust Model

A2AX defines verification mechanics. **Trust policy is verifier-controlled.**

## No Embedded Trust Anchors

The reference implementation ships with an **empty trust store**. Verification fails if no issuer is trusted. No default trusted issuers.

## Portable Certificate Verification

Verification works **without contacting the registry**. An agent presents its certificate; the verifier:

1. Extracts issuer from certificate
2. Looks up issuer public key in trust store
3. If not trusted → reject
4. Verifies signature against issuer public key
5. Checks expiry
6. Optionally checks revocation
7. Evaluates against policy

## Verifier-Controlled Policy

- **Trust store**: Verifier adds issuer keys explicitly (via config, bundles, or federation)
- **Policy engine**: Verifier configures minimum assurance, jurisdictions, revocation requirements
- **No central authority**: Each deployment chooses whom to trust

## Registry Role

The registry **issues** certificates and **stores** them. It does **not** act as required verification authority. Verification can succeed without the registry being online.
