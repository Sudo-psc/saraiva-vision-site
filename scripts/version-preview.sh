#!/bin/bash

set -e

echo "🔍 Version Preview Tool"
echo "======================"
echo ""

CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📦 Current version: v$CURRENT_VERSION"
echo ""

if [ -z "$GITHUB_TOKEN" ] && [ -z "$GH_TOKEN" ]; then
  echo "⚠️  Warning: GITHUB_TOKEN not set. Dry-run may fail."
  echo "   Set it with: export GITHUB_TOKEN=<your-token>"
  echo ""
fi

echo "🔄 Analyzing commits since last release..."
echo ""

LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
if [ -n "$LAST_TAG" ]; then
  echo "📌 Last release: $LAST_TAG"
  echo ""
  echo "📝 Commits since last release:"
  git --no-pager log $LAST_TAG..HEAD --oneline --pretty=format:"  %s" | head -20
else
  echo "⚠️  No previous release found. Showing last 10 commits:"
  git --no-pager log --oneline --pretty=format:"  %s" -10
fi

echo ""
echo ""
echo "🎯 Running semantic-release dry-run..."
echo ""

npm run release:dry 2>&1 | grep -E "semantic-release|new version|published|There is no previous release" || true

echo ""
echo "✅ Done!"
echo ""
echo "💡 Tips:"
echo "  - feat: commits increment MINOR version (1.2.3 → 1.3.0)"
echo "  - fix/perf/refactor: commits increment PATCH version (1.2.3 → 1.2.4)"
echo "  - feat! or BREAKING CHANGE: increment MAJOR version (1.2.3 → 2.0.0)"
echo "  - docs/style/test/chore: no version change"
echo ""
