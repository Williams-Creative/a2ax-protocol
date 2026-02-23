# Trust Bundles

Bundles are installable packages that add issuer keys to the trust store.

## Structure

```
/bundles
  community/
    manifest.json
  enterprise/
    manifest.json
```

## Installation

From the project root:

```bash
npx tsx cli/trust-bundle-install.ts <bundle-name>
```

Example:

```bash
npx tsx cli/trust-bundle-install.ts community
```

Copies issuer keys from the bundle into `config/trust/anchors/`. Does not modify core protocol logic. Removable by deleting the anchor files.

## Manifest Format

Each bundle has a `manifest.json` at `bundles/<name>/manifest.json`:

```json
{
  "name": "community",
  "version": "1.0.0",
  "issuers": [
    {
      "issuerId": "example-issuer",
      "publicKey": {
        "format": "jwk",
        "key": {
          "kty": "OKP",
          "crv": "Ed25519",
          "x": "<base64url-encoded-public-key>"
        }
      },
      "metadata": {
        "displayName": "Example Issuer",
        "jurisdiction": "US",
        "assuranceLevel": 1
      }
    }
  ]
}
```

### Public key formats

**JWK (JSON Web Key):**

```json
{
  "format": "jwk",
  "key": {
    "kty": "OKP",
    "crv": "Ed25519",
    "x": "<base64url>"
  }
}
```

**PEM:**

```json
{
  "format": "pem",
  "key": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
}
```

### Metadata (optional)

- `displayName` — Human-readable issuer name
- `jurisdiction` — Jurisdiction code (e.g. US, EU)
- `assuranceLevel` — Numeric assurance level (0 = lowest)

## Creating a Bundle

1. Create a directory: `bundles/<your-bundle-name>/`
2. Create `manifest.json` with `name`, `version`, and `issuers` array
3. Add issuer entries with `issuerId`, `publicKey` (JWK or PEM), and optional `metadata`
4. Run `npx tsx cli/trust-bundle-install.ts <your-bundle-name>`

To obtain a public key in JWK format from an existing Ed25519 key pair, use `jose` or similar:

```javascript
import { exportJWK, generateKeyPair } from "jose";
const { publicKey } = await generateKeyPair("EdDSA", { crv: "Ed25519" });
const jwk = await exportJWK(publicKey);
// Use jwk in manifest (public key only; never include private key)
```

## Dev Issuer

For local development and quickstart, you can seed a dev issuer into the community bundle:

```bash
npm run seed:dev-issuer
npx tsx cli/trust-bundle-install.ts community
```

The seed script generates an Ed25519 key pair and adds the public key to `bundles/community/manifest.json` as issuer `a2ax-sandbox`. **Dev only — not for production.** The issuer is clearly labeled and has `assuranceLevel: 0`.

Re-running `seed:dev-issuer` replaces the dev issuer with a new key. The community bundle ships empty; the seed script populates it locally when you run it.

## No Embedded Bundles

The protocol does not ship with pre-installed trust. The `community` and `enterprise` bundles ship with **empty issuers** by default. Trust is explicitly configured by the verifier.
