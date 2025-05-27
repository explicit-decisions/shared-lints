# Reference Repositories

This directory contains snapshots of reference repositories that demonstrate the explicit-decisions framework in practice. These are synchronized copies (without `.git` directories) of real projects that use and validate the patterns documented in this framework.

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

*Note: The specific repositories and paths are configured in `reference-repos.config.json`. The examples below show typical reference repositories that demonstrate various patterns.*

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
- **Key Features**: *(To be documented after sync)*

## Updating Reference Repositories

Reference repositories are synchronized using rsync to maintain current snapshots without git history. This approach allows us to:

1. **Keep examples current** - Regular updates ensure documentation reflects real-world usage
2. **Avoid git complexity** - No need to manage submodules or git history
3. **Focus on code patterns** - Clean snapshots without development noise
4. **Maintain consistency** - Standardized sync process across all references

### Automatic Updates

Use the provided script to update all reference repositories:

```bash
# From the project root
./scripts/update-reference-repos.sh
```

This script:
- Syncs from known source locations
- Excludes development artifacts (node_modules, .git, etc.)
- Preserves directory structure
- Provides colored output for status

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

*This directory structure supports the reference analysis documented in `docs/ephemeral/reference-analysis-expansion-plan.md`*
