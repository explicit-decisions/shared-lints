# Package Selection Decision Framework

> "The best package is often the one you don't install" - Part of the Enforced Explicit Decisions Pattern

## Core Decision

**Rationale:** Following DoctorWhoScripts philosophy of embracing platform features over dependencies

**Core Philosophy:** Every dependency is a long-term commitment that should be justified with explicit reasoning and periodic review. This framework implements the **Enforced Explicit Decisions pattern** by requiring documented rationale for all package decisions.

## Implementation and Enforcement

### dependency-versions.json

All package decisions are tracked and enforced through `dependency-versions.json` at the repository root. This file:

- **Implements** the tier system defined in this document
- **Enforces** review cycles through automated checks
- **Documents** specific decisions with rationale
- **Tracks** review dates and responsible parties

**Example entry:**

```json
"@typescript-eslint/utils": {
  "currentVersion": "^8.32.1",
  "tier": "essential",
  "justification": "Required for professional TypeScript ESLint rule development",
  "packageSelectionCriteria": {
    "platformAlternative": "Raw ESLint APIs (rejected: complex, no type safety)",
    "uniqueValue": "Professional ESLint rule development patterns",
    "maintenanceRisk": "Low - TypeScript team maintained"
  }
}
```

Run `pnpm deps:interactive` to review and update dependency decisions.

## Package Selection Criteria

### Tier 1: Prefer Platform Features

**Principle:** Use modern JavaScript/TypeScript/Node.js capabilities first

**Examples of platform-first decisions:**

- **File operations:** Node.js `fs` over libraries like `fs-extra`
- **Path manipulation:** Node.js `path` over utility libraries  
- **JSON parsing:** Native `JSON.parse()` over parsing libraries
- **Async operations:** Native `Promise`/`async`/`await` over callback libraries
- **Module loading:** ES modules over dynamic loading libraries

**Decision Template:**

```markdown
## Decision: Use [Platform Feature] instead of [Library]
**Context:** Need [specific functionality]
**Decision:** Use native [platform feature] 
**Rationale:** Platform feature is sufficient, reduces dependencies, future-proof
**Trade-offs:** [List any limitations of platform approach]
```

### Tier 2: Essential Tooling Only

**Principle:** Install packages that enable core framework functionality

**Current essential dependencies with rationale:**

#### TypeScript Ecosystem

- **`@typescript-eslint/utils`** - Professional ESLint rule development
  - **Rationale:** Required for type-safe AST manipulation
  - **Alternatives considered:** Raw ESLint APIs (rejected: complex, no type safety)
  - **Review trigger:** If TypeScript introduces native ESLint support

- **`typescript`** - Type safety and development experience  
  - **Rationale:** Core to project's TypeScript-first approach
  - **Version strategy:** Stay on LTS, pin for stability
  - **Review trigger:** Major version releases

#### Testing Infrastructure  

- **`vitest`** - Fast, modern testing framework
  - **Rationale:** Better TypeScript support than Jest, faster execution
  - **Alternatives considered:** Jest (rejected: slower, worse TS support), native Node test runner (rejected: immature)
  - **Review trigger:** If Node.js test runner reaches feature parity

#### Development Workflow

- **`eslint`** - Core linting functionality
  - **Rationale:** Essential for project's rule enforcement approach
  - **Version strategy:** Follow latest stable, test compatibility carefully
  - **Review trigger:** Major architecture changes in ESLint

### Tier 3: Justified Additions Only

**Principle:** New packages require compelling justification and explicit review cycle

**Decision Criteria for New Packages:**

1. **Unique value:** Solves problem that platform + existing dependencies cannot
2. **Maintenance confidence:** Active maintenance, stable API, good TypeScript support  
3. **Size consideration:** Bundle impact justified by functionality
4. **Alternative exhaustion:** Platform features and existing dependencies insufficient
5. **Team consensus:** Clear agreement on necessity

**Required Documentation for New Packages:**

```markdown
## Package Decision: [package-name]
**Status:** Active | Under Review | Deprecated
**Added:** [Date]
**Expires:** [30-90 days for review]
**Use Case:** [Specific problem this solves]
**Platform Alternative:** [Why platform features insufficient]
**Existing Alternative:** [Why current dependencies insufficient]
**Size Impact:** [Bundle size, dependency tree impact]
**Maintenance Risk:** [Assessment of package health]
**Success Criteria:** [How we'll know this is working]
**Removal Trigger:** [Conditions that would make us remove this]
```

## Current Dependency Audit

### Production Dependencies (tools/eslint-plugin)

#### @typescript-eslint/utils ^8.32.1

- **Status:** ✅ Essential - Tier 2
- **Rationale:** Required for professional TypeScript ESLint rule development
- **Alternatives:** Raw ESLint APIs (rejected: complex, no type safety)
- **Review:** Annual with major TypeScript releases

#### eslint >=9.0.0

- **Status:** ✅ Essential - Tier 2  
- **Rationale:** Core functionality for rule enforcement
- **Alternatives:** None viable for ESLint plugin development
- **Review:** Follow ESLint major version releases

### Development Dependencies

#### @types/node ^20.17.50

- **Status:** ✅ Essential - Tier 2
- **Rationale:** TypeScript support for Node.js APIs
- **Alternatives:** None for TypeScript development
- **Review:** Follow Node.js LTS schedule

#### @typescript-eslint/parser ^8.32.1  

- **Status:** ✅ Essential - Tier 2
- **Rationale:** Required for TypeScript ESLint rule testing
- **Alternatives:** None for TypeScript rule development
- **Review:** Annual with major TypeScript releases

#### typescript ^5.8.3

- **Status:** ✅ Essential - Tier 2
- **Rationale:** Core to project's TypeScript-first approach
- **Alternatives:** None for TypeScript development
- **Review:** Follow TypeScript major releases

#### vitest ^3.1.4

- **Status:** ✅ Essential - Tier 2
- **Rationale:** Fast, modern testing with excellent TypeScript support
- **Alternatives:** Jest (slower, worse TS), Node test runner (immature)
- **Review:** Annual or if Node.js testing reaches feature parity

## Package Removal Criteria

### Immediate Removal Triggers

- **Security vulnerabilities** with no fix available
- **Abandonment:** No updates for 12+ months
- **Breaking changes** that don't align with project goals
- **Platform replacement:** Native alternative becomes viable

### Scheduled Review Triggers  

- **Annual review:** Reassess all Tier 2 dependencies
- **Major version bumps:** Evaluate continued necessity
- **Platform evolution:** Check if native alternatives emerged
- **Project scope changes:** Reassess alignment with goals

## Anti-Patterns to Avoid

### "Just in Case" Dependencies

- **Problem:** Installing packages for features we might need
- **Solution:** Wait until actual need arises, prefer platform features
- **Test:** "Are we actively using this package in production code?"

### "Slight Convenience" Additions  

- **Problem:** Adding packages for minor DX improvements
- **Solution:** Weigh convenience against maintenance burden
- **Test:** "Would we rewrite this code to avoid the dependency?"

### "Version Chasing" Updates

- **Problem:** Updating dependencies without clear benefit
- **Solution:** Update only for security, features we need, or platform alignment
- **Test:** "What specific problem does this update solve?"

### "Ecosystem Lock-in" Decisions

- **Problem:** Choosing packages that require many related dependencies
- **Solution:** Prefer minimal, focused packages with clean APIs
- **Test:** "How many additional dependencies does this require?"

## Automated Enforcement

The package selection framework is enforced through:

1. **`dependency-versions.json`**: Central tracking of all dependency decisions
2. **`pnpm lint`**: Includes dependency checking that fails if:
   - Decisions are older than review cycle (30 days for justified, 6 months for essential)
   - New versions are available without documented decisions
   - Dependencies exist without being tracked
3. **`pnpm deps:interactive`**: Interactive tool for making and documenting decisions

This creates the "hard failures that LLMs cannot ignore" - a core principle of the explicit-decisions framework.

## Success Metrics

### Dependency Health

- **Total count:** Minimize number of direct dependencies
- **Security:** Zero known vulnerabilities in production dependencies
- **Maintenance:** All dependencies actively maintained
- **Size:** Bundle size grows only with justified functionality

### Decision Quality

- **Documentation:** All dependency decisions explicitly documented
- **Review compliance:** All packages reviewed on schedule
- **Removal rate:** Deprecated packages removed within 30 days
- **Platform adoption:** Migrate to platform features when available

## Future Considerations

### Platform Evolution Watching

- **Node.js:** Test runner maturity, new built-in capabilities
- **TypeScript:** Native ESLint integration, compiler API changes
- **ESLint:** Architecture changes, plugin API evolution
- **Browsers:** New platform APIs that could replace dependencies

### Project Growth Scenarios

- **Monorepo expansion:** How dependency strategy scales across packages
- **Framework integration:** Potential React/Vue/other ecosystem needs
- **Build tooling:** Bundler integration, optimization needs
- **Distribution:** Publishing and package management considerations
