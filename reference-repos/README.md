# Reference Repositories

This directory contains snapshots of reference repositories that demonstrate the shared-lints framework in practice. These are synchronized copies (without `.git` directories) of real projects that use and validate the patterns documented in this framework.

## Configuration

Reference repositories are configured using `reference-repos.config.json` in this directory. This allows different developers to maintain their own local setups while sharing the framework.

### Setup

1. **Copy the template configuration**:

   ```bash
   cp reference-repos.config.template.json reference-repos.config.json
   ```

2. **Edit paths to match your local setup**:

   ```json
   {
     "$schema": "../schemas/reference-repos.config.schema.json",
     "description": "My reference repositories configuration",
     "repositories": [
       {
         "name": "YourProject",
         "path": "/your/local/path/to/project",
         "description": "Description of what this project demonstrates",
         "tags": ["typescript", "testing"],
         "enabled": true
       }
     ],
     "syncOptions": {
       "exclude": [".git/", "node_modules/", "coverage/", "dist/"],
       "dryRun": false,
       "verbose": true,
       "delete": true
     }
   }
   ```

3. **Run the sync**:

   ```bash
   ./scripts/update-reference-repos.sh
   ```

### Configuration Format

The configuration file is validated by a JSON schema located at `../schemas/reference-repos.config.schema.json`. This provides IDE autocompletion and validation.

**Top-level properties:**

- **repositories**: Array of repository definitions (required)
- **syncOptions**: Sync behavior configuration (optional)
- **description**: Human-readable description (optional)

**Repository properties:**

- **name**: Directory name in reference-repos/ (required)
- **path**: Absolute path to source repository (required)
- **description**: What this repository demonstrates (required)
- **tags**: Categorization tags like "typescript", "testing" (optional)
- **enabled**: Whether to sync this repository (optional, default: true)
- **excludePatterns**: Additional exclude patterns for this repo (optional)

**Sync options:**

- **exclude**: Global exclude patterns for all repositories
- **dryRun**: Preview changes without copying files (default: false)
- **verbose**: Enable detailed output (default: true)
- **delete**: Remove files in destination not in source (default: true)

## Current Reference Repositories

_Note: The specific repositories and paths are configured in `reference-repos.config.json`. The examples below show typical reference repositories that demonstrate various patterns._

### DoctorWhoScripts

- **Purpose**: Demonstrates comprehensive dependency management system and phase-based development
- **Key Features**:
  - Interactive dependency decision tracking
  - JSON schema validation for decisions
  - 30-day review cycle enforcement
  - Production quality gates

### quick-mcp

- **Purpose**: Shows LLM-optimized development practices and custom test infrastructure
- **Key Features**:
  - No-mocks testing patterns
  - Domain-specific custom matchers
  - Context-specific TypeScript strictness
  - Structured error handling

### claude-exporter

- **Purpose**: Additional reference implementation for framework validation
- **Key Features**: _(To be documented after sync)_

## Updating Reference Repositories

Two strategies are available for working with reference repositories:

### Strategy 1: Symlinks (Recommended for Migration)

Creates direct symlinks to source repositories for real-time editing:

```bash
# From the project root
pnpm refs:link
```

**Benefits:**

- Direct editing of source repositories
- Real-time sync - no manual updates needed
- Perfect for migration and experimentation
- Changes immediately visible in both locations

**Use when:** Actively migrating repositories to shared-lints framework

### Strategy 2: Rsync Snapshots (Recommended for Analysis)

Synchronized snapshots using rsync to maintain current copies without git history:

```bash
# From the project root
pnpm refs:sync
```

**Benefits:**

- Keep examples current - Regular updates ensure documentation reflects real-world usage
- Avoid git complexity - No need to manage submodules or git history
- Focus on code patterns - Clean snapshots without development noise
- Maintain consistency - Standardized sync process across all references

**Use when:** Analyzing patterns or creating documentation examples

### Choosing a Strategy

- **For migration work:** Use `pnpm refs:link` to work directly on source repositories
- **For analysis/docs:** Use `pnpm refs:sync` to create clean snapshots for reference

Both scripts:

- Read configuration from `reference-repos.config.json`
- Process only enabled repositories
- Provide colored output for status
- Handle missing source directories gracefully

### Manual Updates

For individual repository updates or custom source paths:

```bash
# Basic rsync command structure
rsync -av \
  --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.DS_Store' \
  --exclude='*.log' \
  --exclude='coverage' \
  --exclude='dist' \
  --exclude='build' \
  --exclude='.next' \
  --exclude='.turbo' \
  --exclude='.vercel' \
  /path/to/source/ ./reference-repos/target-name/
```

### Adding New Reference Repositories

1. **Update the sync script** (`scripts/update-reference-repos.sh`):

   - Add source path detection
   - Add sync_repo call
   - Update logging

2. **Document the new repository** in this README:

   - Add to the list above
   - Describe purpose and key features
   - Note any special considerations

3. **Run initial sync**:

   ```bash
   ./scripts/update-reference-repos.sh
   ```

## Excluded Files and Directories

The sync process excludes common development artifacts:

- `.git` - Version control history
- `node_modules` - Package dependencies
- `coverage` - Test coverage reports
- `dist`, `build` - Compiled output
- `.DS_Store` - macOS system files
- `*.log` - Log files
- `.next`, `.turbo`, `.vercel` - Framework-specific cache/build dirs

## Update Frequency

Reference repositories should be updated:

- **Weekly** - During active development phases
- **Before releases** - To ensure examples are current
- **After major changes** - When source repos evolve significantly
- **On request** - When documentation or analysis needs current state

## Validation

After updates, verify that:

1. **All expected files are present** - Check key configuration files
2. **No sensitive data leaked** - Review for credentials or local paths
3. **Examples still work** - Validate that documented patterns are current
4. **Documentation accuracy** - Ensure docs match actual implementation

## Troubleshooting

### Source Directory Not Found

- Verify source repository paths in the update script
- Check that source repositories are cloned and up to date
- Update paths if repositories have moved

### Permission Issues

- Ensure read access to source directories
- Check write permissions in reference-repos directory
- Verify script execution permissions

### Large File Issues

- Review exclude patterns if sync is slow
- Consider excluding additional build artifacts
- Check for accidentally included binary files

---

_This directory structure supports the reference analysis documented in `docs/ephemeral/reference-analysis-expansion-plan.md`_
