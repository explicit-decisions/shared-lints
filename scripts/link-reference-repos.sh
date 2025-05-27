#!/bin/bash

# Link reference repositories using symlinks for direct editing
# This script creates symlinks to reference repos for easier migration
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

echo "🔗 Setting up reference repositories with symlinks..."

# Read repositories from config
REPOSITORIES=$(jq -r '.repositories[] | select(.enabled == true) | @base64' "$CONFIG_FILE")

LINKED_REPOS=0

# Process each repository
while IFS= read -r repo; do
    # Decode base64 and parse JSON
    REPO_DATA=$(echo "$repo" | base64 --decode)
    REPO_NAME=$(echo "$REPO_DATA" | jq -r '.name')
    REPO_PATH=$(echo "$REPO_DATA" | jq -r '.path')
    REPO_DESC=$(echo "$REPO_DATA" | jq -r '.description')
    
    echo ""
    echo "📁 Linking $REPO_NAME..."
    echo "   Source: $REPO_PATH"
    echo "   Description: $REPO_DESC"
    
    LINK_PATH="$REFERENCE_DIR/$REPO_NAME"
    
    # Check if source directory exists
    if [ ! -d "$REPO_PATH" ]; then
        echo "   ⚠️  Source directory not found: $REPO_PATH"
        echo "   💡 Update the path in $CONFIG_FILE or disable this repository"
        continue
    fi
    
    # Remove existing link or directory
    if [ -L "$LINK_PATH" ]; then
        echo "   🗑️  Removing existing symlink"
        rm "$LINK_PATH"
    elif [ -d "$LINK_PATH" ]; then
        echo "   🗑️  Removing existing directory (converting from rsync to symlink)"
        rm -rf "$LINK_PATH"
    fi
    
    # Create symlink
    ln -s "$REPO_PATH" "$LINK_PATH"
    
    # Verify symlink
    if [ -L "$LINK_PATH" ] && [ -d "$LINK_PATH" ]; then
        echo "   ✅ Symlink created successfully"
        LINKED_REPOS=$((LINKED_REPOS + 1))
    else
        echo "   ❌ Failed to create symlink"
    fi
    
done <<< "$REPOSITORIES"

echo ""
echo "✅ $LINKED_REPOS reference repositories linked successfully!"
echo ""
echo "🎯 Benefits of symlink strategy:"
echo "   • Direct editing of source repositories"
echo "   • Real-time sync - no manual updates needed"
echo "   • Perfect for migration and experimentation"
echo "   • Changes immediately visible in both locations"
echo ""
echo "📝 To make changes:"
echo "   1. Edit files directly in reference-repos/$REPO_NAME/"
echo "   2. Changes apply to original repository instantly"
echo "   3. Use git commands in either location"
echo ""
echo "💡 To modify repositories, edit: $CONFIG_FILE"