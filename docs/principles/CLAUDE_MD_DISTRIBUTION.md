# CLAUDE.md Distribution Philosophy

## The Challenge

CLAUDE.md contains critical instructions for AI assistants, including principles like "Think Before Acting" that prevent vibe coding. These instructions need to:

- Be present in every project
- Stay up to date with best practices
- Allow project-specific customizations
- Not create maintenance burden

## Our Approach: Composable Sections

CLAUDE.md should be composable from:

1. **Core Principles** - Universal rules from shared-lints
2. **Project Patterns** - Specific to the project's architecture
3. **Domain Rules** - Specific to the problem domain

## Implementation Strategy

### 1. Standard Sections

Define standard sections that can be imported:

```markdown
<!-- BEGIN: shared-lints/core-principles -->
## Core Principle: Think Before Acting
...
<!-- END: shared-lints/core-principles -->

<!-- BEGIN: project-specific -->
## Project-Specific Instructions
...
<!-- END: project-specific -->
```

### 2. Update Mechanism

Provide a tool that updates only marked sections:

```bash
npx @explicit-decisions/shared-lints update-claude
```

This tool:

- Preserves content outside marked sections
- Updates content within marked sections
- Reports what changed
- Can be run in CI to check for updates

### 3. Version Tracking

Include version metadata:

```markdown
<!-- shared-lints-version: 1.2.3 -->
```

This allows:

- Checking if updates are available
- Understanding what version of principles you're using
- Gradual migration when breaking changes occur

## Benefits

1. **Propagation** - New principles automatically flow to projects
2. **Customization** - Projects keep their specific instructions
3. **Transparency** - Clear what's shared vs. custom
4. **Low Friction** - Single command to update

## Example Workflow

1. Project initializes with `npx @explicit-decisions/shared-lints init`
2. This creates CLAUDE.md with marked sections
3. Developer adds project-specific sections
4. Periodically run `update-claude` to get new principles
5. CI can warn when updates are available

## Alternative for Simple Cases

For projects that don't need customization, support a redirect:

```markdown
# CLAUDE.md
See: node_modules/@explicit-decisions/shared-lints/CLAUDE.md

## Additional Project Rules
...
```

This is simpler but less flexible.
