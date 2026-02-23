# Contributing to A2AX Protocol

Thank you for your interest in contributing to A2AX. We welcome contributions from the community.

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold its terms.

## How to Contribute

### Reporting Bugs

Open an issue with:

- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Environment (OS, Node version, etc.)

### Suggesting Features

Open an issue with:

- Use case and motivation
- Proposed design or API changes
- Any alternatives considered

### Pull Requests

1. **Fork** the repository and create a branch from `main`
2. **Make changes** — follow existing code style
3. **Test** — run builds and tests (see below)
4. **Submit** a PR with a clear description of changes

### Development Setup

**Protocol (core):**

```bash
cd protocol
npm install
npm run build
npm test
```

**Backend API:**

```bash
cd backend/api
npm install
npm run build
npm test
```

**Full stack (optional):**

```bash
# Seed dev issuer for local testing
npm run seed:dev-issuer
npx tsx cli/trust-bundle-install.ts community

# Start stack
docker compose -f infra/docker-compose.yml up -d
```

**Integration tests:**

```bash
cd backend/api
ADMIN_API_KEY=your-key npm run test:integration
```

### Code Style

- TypeScript: ESLint config in `backend/api`
- Use meaningful variable names and comments for non-obvious logic
- Keep PRs focused — one feature or fix per PR

### Commit Messages

Use clear, descriptive messages:

- `fix: resolve nonce replay edge case`
- `feat: add trust score caching`
- `docs: update API spec`

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
