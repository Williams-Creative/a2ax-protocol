# Trust Bundles

Bundles are installable packages that add issuer keys to the trust store.

## Structure

```
/bundles
  community/
  enterprise/
```

## Installation

```bash
a2ax trust install community
```

Copies issuer keys into trust store. Does not modify core protocol logic. Removable.

## Bundle Format

A bundle contains issuer public keys (JWK or PEM) and metadata. Installation adds them to the trust store.

## No Embedded Bundles

The protocol does not ship with pre-installed bundles. Trust is explicitly configured.
