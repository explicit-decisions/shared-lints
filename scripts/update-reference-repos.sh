#!/bin/bash

# Update reference repositories by syncing from their source locations
# This script copies the latest versions of reference repos for analysis
# Configuration is read from reference-repos.config.json

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
REFERENCE_DIR="$ROOT_DIR/reference-repos"
CONFIG_FILE="$ROOT_DIR/reference-repos/reference-repos.config.json"

# Check if jq is available for JSON parsing
if ! command -v jq &> /dev/null; then
    echo "❌ jq is required for parsing configuration. Please install it:"
    echo "   Ubuntu/Debian: sudo apt-get install jq"
    echo "   macOS: brew install jq"
    exit 1
fi

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Configuration file not found: $CONFIG_FILE"
    echo "💡 Create reference-repos.config.json to configure your repositories"
    exit 1
fi

echo "🔄 Updating reference repositories from config..."

# Read repositories from config
REPOSITORIES=$(jq -r '.repositories[] | @base64' "$CONFIG_FILE")
EXCLUDE_PATTERNS=$(jq -r '.syncOptions.exclude[]' "$CONFIG_FILE" | paste -sd ' ')
DRY_RUN=$(jq -r '.syncOptions.dryRun // false' "$CONFIG_FILE")

# Build rsync exclude arguments
RSYNC_EXCLUDES=""
for pattern in $EXCLUDE_PATTERNS; do
    RSYNC_EXCLUDES="$RSYNC_EXCLUDES --exclude='$pattern'"
done

# Add dry-run flag if enabled
RSYNC_FLAGS="-av"
if [ "$DRY_RUN" = "true" ]; then
    RSYNC_FLAGS="$RSYNC_FLAGS --dry-run"
    echo "🧪 Running in dry-run mode (no files will be copied)"
fi

TOTAL_FILES=0
UPDATED_REPOS=0

# Process each repository
while IFS= read -r repo; do
    # Decode base64 and parse JSON
    REPO_DATA=$(echo "$repo" | base64 --decode)
    REPO_NAME=$(echo "$REPO_DATA" | jq -r '.name')
    REPO_PATH=$(echo "$REPO_DATA" | jq -r '.path')
    REPO_DESC=$(echo "$REPO_DATA" | jq -r '.description')
    
    echo ""
    echo "📁 Syncing $REPO_NAME..."
    echo "   Source: $REPO_PATH"
    echo "   Description: $REPO_DESC"
    
    TARGET_DIR="$REFERENCE_DIR/$REPO_NAME"
    
    # Check if source directory exists
    if [ ! -d "$REPO_PATH" ]; then
        echo "   ⚠️  Source directory not found: $REPO_PATH"
        echo "   💡 Update the path in $CONFIG_FILE or remove this repository"
        continue
    fi
    
    # Create target directory
    mkdir -p "$TARGET_DIR"
    
    # Sync with rsync
    eval "rsync $RSYNC_FLAGS $RSYNC_EXCLUDES \"$REPO_PATH/\" \"$TARGET_DIR/\""
    
    # Count files (only if not dry-run)
    if [ "$DRY_RUN" != "true" ]; then
        FILE_COUNT=$(find "$TARGET_DIR" -name "*.ts" -o -name "*.js" -o -name "*.json" | wc -l)
        echo "   ✅ $FILE_COUNT files synced"
        TOTAL_FILES=$((TOTAL_FILES + FILE_COUNT))
        UPDATED_REPOS=$((UPDATED_REPOS + 1))
    else
        echo "   📋 Dry-run completed"
    fi
    
done <<< "$REPOSITORIES"

echo ""
if [ "$DRY_RUN" != "true" ]; then
    echo "✅ $UPDATED_REPOS reference repositories updated successfully!"
    echo "📊 Total files synced: $TOTAL_FILES"
else
    echo "🧪 Dry-run completed. Set 'dryRun: false' in config to actually sync files."
fi

echo ""
echo "💡 To modify repositories, edit: $CONFIG_FILE"
