# Contributing to NEXUS Protocol

Thank you for your interest in contributing to NEXUS. We welcome contributions from the community.

## Code of Conduct

Be respectful, inclusive, and constructive. We aim to maintain a welcoming environment for everyone.

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
3. **Test** — run `npm run build` and `npm test` in `backend/api`
4. **Submit** a PR with a clear description of changes

### Development Setup

```bash
cd backend/api
npm install
npm run build
npm test
```

For integration tests, start the stack first:

```bash
docker compose -f infra/docker-compose.yml up -d
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
