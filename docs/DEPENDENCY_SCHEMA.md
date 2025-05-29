# Dependency Decision Schema

Dependencies in `decisions.toml` use an enhanced schema to capture the rich metadata needed for effective dependency management.

## Basic Structure

```toml
[dependencies.typescript]
decision = "keep"          # keep|update|deprecate
current = "^5.0.0"         # current version in package.json
available = "^5.3.0"       # latest available version
reason = "Essential for type safety"
reviewBy = "2025-08-27"
tier = "essential"         # essential|justified|deprecated

# Optional enhanced fields
[dependencies.typescript.policy]
update = "manual"          # manual|auto|tagged|scheduled
tag = "stable"            # npm dist-tag to track (for tagged)
date = "2025-06-01"       # scheduled update date
range = "^"               # pin|~|^|>= (version range strategy)
major = "block"           # block|allow|review (major update handling)

[dependencies.typescript.meta]
security = "high"         # critical|high|medium|low
peers = ["@types/node"]   # peer dependency constraints
alt = "None suitable"     # platform alternative (for essential)
trigger = "Native ESM"    # removal trigger (for justified)
migrate = "docs/ts.md"    # migration guide path (for deprecate)
```

## Global Dependency Rules

```toml
[rules.deps]
maxAge = 30               # days before review required
oldReason = true          # require reason for outdated deps  
checkInterval = 7         # days between update checks
autoPatches = true        # allow automated patch updates
blockMajor = true         # block major updates without review

[rules.deps.tiers]
essential.review = 90     # review cycle in days
essential.altRequired = true
justified.review = 30
justified.triggerRequired = true
deprecated.review = 14
deprecated.planRequired = true
```

## Field Reference

### Core Fields
- `decision` - Current decision: keep, update, or deprecate
- `current` - Version currently in package.json
- `available` - Latest version from npm registry
- `reason` - Why this decision was made
- `reviewBy` - Date for next review (YYYY-MM-DD)
- `tier` - Importance classification

### Policy Fields (`.policy`)
- `update` - Update strategy
  - `manual` - Human decides each update
  - `auto` - Automated updates allowed
  - `tagged` - Follow npm dist-tag
  - `scheduled` - Update on specific date
- `tag` - NPM dist-tag to track (e.g., "stable", "lts", "next")
- `date` - Scheduled update date
- `range` - Version range strategy ("pin", "~", "^", ">=")
- `major` - How to handle major updates ("block", "allow", "review")

### Metadata Fields (`.meta`)
- `security` - Security criticality level
- `peers` - Peer dependency constraints
- `alt` - Platform alternative considered (essential tier)
- `trigger` - Condition for removal (justified tier)
- `migrate` - Migration guide path (deprecate decision)

### Global Rules (`[rules.deps]`)
- `maxAge` - Maximum days before review required
- `oldReason` - Require explicit reason for outdated deps
- `checkInterval` - Days between automated checks
- `autoPatches` - Allow automated patch updates
- `blockMajor` - Block major updates without review

## Examples

### Essential Package
```toml
[dependencies.vitest]
decision = "keep"
current = "^1.0.0"
available = "^2.0.0"
reason = "v2 requires Node 18+, we support Node 16"
reviewBy = "2025-03-01"
tier = "essential"

[dependencies.vitest.policy]
update = "manual"
major = "block"

[dependencies.vitest.meta]
security = "medium"
alt = "Jest (rejected: slower, poor ESM support)"
```

### Package to Deprecate
```toml
[dependencies.request]
decision = "deprecate"
current = "^2.88.0"
reason = "Unmaintained, moving to native fetch"
reviewBy = "2025-01-15"
tier = "deprecated"

[dependencies.request.meta]
migrate = "docs/fetch-migration.md"
```

### Auto-updating Package
```toml
[dependencies."@types/node"]
decision = "keep"
current = "^20.0.0"
available = "^20.11.0"
reason = "Type definitions, safe to auto-update"
reviewBy = "2025-06-01"
tier = "essential"

[dependencies."@types/node".policy]
update = "auto"
range = "^"
major = "review"
```

## Tooling Integration

Tools can work with just the dependencies section:

```javascript
// Read dependencies section
const decisions = TOML.parse(await readFile('decisions.toml'));
const deps = decisions.dependencies;

// Check update policies
for (const [name, dep] of Object.entries(deps)) {
  if (dep.policy?.update === 'auto' && isNewPatchAvailable(name)) {
    await updatePackage(name);
  }
}
```

This schema provides all the richness needed for sophisticated dependency management while keeping everything in one file.