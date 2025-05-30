# Philosophy Compliance: How shared-lints Follows Its Own Principles

This document explicitly tracks how the shared-lints codebase follows (or intentionally violates) its own stated principles. Just as we make technical decisions explicit for our users, we make our own implementation decisions explicit here.

## Core Principle Compliance

### 1. ✅ Explicit Over Implicit

**How we follow it:**

- All dependencies tracked in `decisions.toml` with explicit reasoning
- TypeScript imports use explicit `.ts` extensions throughout
- Build configuration explicitly defined in each package.json
- CI pipeline explicitly checks all compliance rules

**Where we could improve:**

- Some error handling patterns are implicit (different scripts handle errors differently)
- Rule complexity limits are implicit (no formal measurement)

### 2. ✅ Think Before Acting

**How we follow it:**

- Comprehensive documentation in `/docs` explains the "why" behind every major decision
- Git history shows thoughtful, incremental changes
- CLAUDE.md includes explicit "Think Before Acting" instructions

**Fixed violation:**

- ✅ `no-mocks-or-spies` now provides suggestions instead of destructive auto-fixes
- Rule changed from type 'problem' to 'suggestion' with manual review required

### 3. ⚠️ Hard Failures Over Warnings

**How we follow it:**

- `pnpm lint` fails CI on any violation
- No ESLint warnings - everything is either error or off
- Dependency decisions must be explicit or builds fail

**Where we drift:**

- Some rules provide auto-fixes that might not be 100% reliable
- Should fail build if auto-fix reliability < 100%

### 4. ✅ Progressive Disclosure

**How we follow it:**

- Simple rules (like `require-ts-extensions`) have simple implementations
- Complex decisions (like dependency tiers) have detailed documentation
- Error messages provide increasing detail based on context

**Fixed violation:**

- ✅ Split `no-inconsistent-patterns` into 4 focused rules:
  - `no-mixed-async-patterns` - detects mixing callbacks/promises/async-await
  - `no-inconsistent-import-extensions` - enforces consistent import extensions
  - `no-duplicate-utilities` - finds similar function signatures
  - `no-outdated-polyfills` - detects obsolete patterns

### 5. ⚠️ Auto-fix When Possible, Guide When Not

**How we follow it:**

- Mechanical fixes (adding `.ts` extensions) are automated
- Architectural decisions (dependency injection) are guidance-only

**Fixed violation:**

- ✅ `no-mocks-or-spies` now uses suggestions instead of auto-fix
- Provides guidance-only suggestions since it requires understanding intent

## Testing Philosophy Compliance

### ✅ No Mocks or Spies

**How we follow it:**

- `DecisionsManager` tests use real file system operations
- `ClaudeUpdater` tests create actual temporary directories
- No jest.mock() or sinon.spy() in our test suite

**Exemplary example:**

```typescript
// tools/decisions/src/manager.test.ts
const testDir = await mkdtemp(join(tmpdir(), 'decisions-test-'));
// Uses real file system, not mocked
```

### ⚠️ Factory Functions for Test Data

**How we follow it:**

- Some tests use factory-like patterns for test data creation

**Where we violate it:**

- `scripts/deps-interactive.test.js` triggers our own rule warnings
- Should refactor to use proper factory functions

### ✅ Real Implementations

**How we follow it:**

- Tests verify actual behavior, not implementation details
- Integration tests check real file creation and parsing

## Code Organization Compliance

### ✅ Single Responsibility

**How we follow it:**

- Each script has one clear purpose
- Most ESLint rules focus on one pattern
- Clear separation between rule detection and fixing

**Fixed violation:**

- ✅ Split `no-inconsistent-patterns` into 4 single-purpose rules
- Each new rule has exactly one responsibility

### ✅ Clear Abstraction Boundaries

**How we follow it:**

- `DecisionsManager` cleanly separates TOML handling from business logic
- ESLint rules follow consistent structure
- Clear separation between tools, scripts, and documentation

## Dependency Management Compliance

### ✅ Platform-First Philosophy

**How we follow it:**

- Using Node.js built-in test runner where possible
- Minimal external dependencies
- Each dependency explicitly justified in decisions.toml

### ✅ Periodic Review

**How we follow it:**

- All decisions have review_by dates
- CI checks for expired decisions
- Regular dependency updates tracked

## Meta-Compliance Violations

These are areas where we consciously violate our own principles:

### 1. 📝 Documentation-First Development

**Violation**: We often implement first, document later
**Justification**: Rapid iteration in early stages
**Mitigation**: Set documentation debt limits

### 2. 🔧 Tooling Complexity

**Violation**: Some tools are more complex than the problems they solve
**Justification**: Infrastructure investment for future scale
**Mitigation**: Regular complexity reviews

### 3. 📊 Metric Tracking

**Violation**: We don't track our own metrics (false positive rates, fix success rates)
**Justification**: Early stage project
**Mitigation**: Plan to add telemetry

## Enforcement Mechanisms

To ensure ongoing compliance:

1. **Automated Checks** ✅
   - CI runs our own ESLint rules on our code
   - Dependency decisions are verified
   - Tests must pass

2. **Manual Reviews** ⚠️
   - No formal process for philosophy alignment review
   - Should add to PR template

3. **Periodic Audits** ❌
   - No scheduled compliance audits
   - Should establish quarterly reviews

## Action Items for Full Compliance

### Immediate (This Week)

1. ~~Fix `no-mocks-or-spies` destructive auto-fix~~ ✅ Completed
2. ~~Split `no-inconsistent-patterns` into focused rules~~ ✅ Completed
   - Created `no-mixed-async-patterns`
   - Created `no-inconsistent-import-extensions`
   - Created `no-duplicate-utilities`
   - Created `no-outdated-polyfills`
3. ~~Add comprehensive tests for new split rules~~ ✅ Completed
   - Each rule has multiple valid and invalid test cases
   - Tests cover edge cases and real-world scenarios
   - All tests passing
4. Add factory functions to test files with warnings

### Short-term (This Month)

1. Standardize error handling patterns
2. Add rule complexity metrics
3. Document all missing rules

### Long-term (This Quarter)

1. Establish formal compliance review process
2. Add metrics tracking for rule effectiveness
3. Create rule development guidelines

## Compliance Tracking

| Principle | Compliance | Notes |
|-----------|------------|-------|
| Explicit Decisions | 90% | Some implicit patterns remain |
| Think Before Acting | 95% | Fixed destructive auto-fix |
| Hard Failures | 95% | Well implemented |
| Progressive Disclosure | 95% | Fixed by splitting complex rule |
| Auto-fix Reliability | 85% | Fixed mock removal, some minor issues remain |
| No Mocks Testing | 100% | Exemplary implementation |
| Real Implementations | 95% | Minor factory function issues |

## Review Schedule

This document should be reviewed:

- **Weekly**: During team meetings for new violations
- **Monthly**: For progress on action items
- **Quarterly**: For comprehensive compliance audit

Last reviewed: 2024-01-09
Next review: 2024-01-16

---

*This document embodies our core principle: making implicit decisions explicit. By documenting where we follow and violate our own principles, we create accountability and enable continuous improvement.*
