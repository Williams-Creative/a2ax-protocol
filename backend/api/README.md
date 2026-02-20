# Agent Identity API

## Local run (Docker Compose)
From repo root:

```bash
cd backend/api
npm run keygen:issuer
cd ../..
docker compose -f infra/docker-compose.yml up --build
```

API health:
- `GET http://localhost:8080/healthz`
- `GET http://localhost:8080/readyz`

## Environment
Copy `.env.example` to `.env` and set:
- `ADMIN_API_KEY` to a strong secret.
- `ISSUER_PRIVATE_JWK_FILE` to the mounted issuer JWK path (or set `ISSUER_PRIVATE_JWK` directly).

## Testing
From `backend/api`:

```bash
npm install
npm test
```

## Pilot smoke test
With API running:

```bash
cd backend/api
$env:ADMIN_API_KEY="replace-with-strong-admin-api-key"; npm run pilot:smoke
```
