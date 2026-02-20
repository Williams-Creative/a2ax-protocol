# Security Audit Summary

Pre-commit security audit completed. This document summarizes findings and mitigations.

## Audit Scope

- Hardcoded secrets, API keys, passwords
- Sensitive data in committed files
- .gitignore coverage
- Placeholder values and defaults
- Console/logging leaks

## Findings and Fixes

| Finding | Severity | Fix Applied |
|---------|----------|-------------|
| ADMIN_API_KEY hardcoded in docker-compose | Medium | Use `${ADMIN_API_KEY:-default}`; require .env for production |
| No root .env.example for docker compose | Low | Added root `.env.example` |
| Weak default documented but not warned | Low | Added security warnings in deployment doc, .env.example |
| infra/.env not in gitignore | Low | Added `infra/.env` to .gitignore |
| No pre-commit checklist | Low | Added to SECURITY.md |

## Verified Safe

- **pilot-smoke.mjs** — Uses public JWK only (no private key); ADMIN_API_KEY from env
- **Integration test** — Fallback matches docker-compose default for local dev only
- **.env.example** — Placeholders only; .env is gitignored
- **Console.log** — No secret leakage (pilot outputs org_id/agent_id only)
- **Secrets directory** — backend/api/secrets/ in .gitignore
- **No .pem, .key, issuer JWK** — All in .gitignore

## Residual Recommendations

- Run `npm audit` and address vulnerabilities before production
- Use KMS for issuer signing in production
- Enable TLS termination
- Rotate ADMIN_API_KEY regularly
