# Security Policy

## Supported Versions

We release security updates for the latest major version. Please upgrade to the latest release to receive security fixes.

## Reporting a Vulnerability

**Do not** open a public issue for security vulnerabilities.

Instead, please report vulnerabilities by:

1. **Email**: Contact the maintainers through the [Williams Creative](https://github.com/Williams-Creative) organization
2. **GitHub Security Advisories**: Use the "Security" tab on the repository to report privately (if enabled)

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response

- We aim to acknowledge within 48 hours
- We will work on a fix and coordinate disclosure
- We credit reporters (with permission) in security advisories

### Disclosure

We follow responsible disclosure. We will not disclose before a fix is available unless the vulnerability is already public.

## Pre-Commit Checklist

Before committing or pushing:

- No `.env`, `secrets/`, or `*.pem` files in the repo (all in `.gitignore`)
- No hardcoded API keys, passwords, or private keys
- `ADMIN_API_KEY` in config files is the placeholder only (never a real key)

## Security Best Practices

When deploying A2AX:

- Run `npm audit` in `backend/api` and address vulnerabilities before production
- Use a strong `ADMIN_API_KEY` (min 16 chars, high entropy)
- Store issuer keys in KMS/HSM for production
- Enable TLS termination (load balancer or reverse proxy)
- Keep dependencies updated (`npm audit`)
- Restrict network access to Postgres and Redis
