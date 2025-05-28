# shared-lints

> ESLint rules and configurations that make implicit technical decisions explicit, improving both human understanding and AI collaboration

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What is this?

When AI assistants read your code, they make assumptions based on common patterns. These assumptions often conflict with your team's intentional decisions, leading to suggestions that would break production, violate architectural principles, or undo careful trade-offs.

The shared-lints framework solves this by:

- 🚫 **Failing builds** when decisions aren't documented
- 📝 **Forcing documentation** of non-standard patterns
- 🤖 **Teaching AI** your project's context through enforcement
- 👥 **Preserving knowledge** when team members change

## Quick Start

```bash
# Install with pnpm (recommended)
pnpm add -D @explicit-decisions/eslint-config @explicit-decisions/eslint-plugin

# Configure ESLint (eslint.config.js)
import explicitConfig from '@explicit-decisions/eslint-config';
import explicitPlugin from '@explicit-decisions/eslint-plugin';

export default [
  ...explicitConfig.base,
  {
    plugins: { '@explicit-decisions': explicitPlugin },
    rules: {
      '@explicit-decisions/no-mocks-or-spies': 'error',
      '@explicit-decisions/require-ts-extensions': 'error',
      '@explicit-decisions/no-npx-usage': 'error'
    }
  }
];

# See what needs fixing
pnpm lint
```

[→ Full Getting Started Guide](./docs/GETTING_STARTED.md)

[→ Why I Built This: Author's Perspective](./docs/AUTHOR_PERSPECTIVE.md)

## Core Principles

### 1. No Mocks in Tests

```typescript
// ❌ AI often suggests mocks
jest.mock('./user-service');

// ✅ We enforce real implementations
const userService = new InMemoryUserService();
```

### 2. Explicit Import Extensions

```typescript
// ❌ Ambiguous imports
import { util } from './util';

// ✅ Clear module resolution
import { util } from './util.ts';
```

### 3. No Arbitrary Package Execution

```bash
# ❌ Executes random internet code
npx some-tool

# ✅ Explicit dependency management
pnpm add -D some-tool && pnpm exec some-tool
```

[→ Learn Why These Matter](./docs/PHILOSOPHY.md)

## Documentation

- 📚 **[Getting Started](./docs/GETTING_STARTED.md)** - Set up in 10 minutes
- 🧠 **[Philosophy](./docs/PHILOSOPHY.md)** - Why explicit decisions matter
- 📖 **[Rule Reference](./docs/guides/RULES_REFERENCE.md)** - Complete rule documentation
- 🤝 **[AI Collaboration](./docs/AI_COLLABORATION.md)** - Work effectively with AI
- 🔄 **[Development Workflow](./docs/DEVELOPMENT_WORKFLOW.md)** - Two-phase development process

## Project Structure

```
shared-lints/
├── tools/
│   ├── eslint-config/      # Shareable ESLint configurations
│   ├── eslint-plugin/      # Custom ESLint rules
│   └── tooling/           # CLI utilities
├── docs/                  # Comprehensive documentation
├── reference-repos/       # Example repositories using this framework
└── scripts/              # Development utilities
```

## Who is this for?

- **Teams using AI assistants** (GitHub Copilot, Claude, etc.)
- **Projects with complex constraints** that AI doesn't understand
- **Organizations wanting to preserve** architectural decisions
- **Developers tired of** fixing AI's "helpful" suggestions

## Contributing

We welcome contributions! This project follows its own principles:

1. **Read the philosophy** before proposing changes
2. **Follow the two-phase workflow** (exploration → consolidation)
3. **Document your decisions** when adding features
4. **Use real implementations** in tests, not mocks

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## License

MIT © Yehuda Katz

---

<details>
<summary>Development Commands</summary>

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint

# Interactive dependency updates
pnpm deps:interactive
```

</details>
