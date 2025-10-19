#!/bin/bash

set -e

echo "🧪 Testing Versioning System Setup"
echo "===================================="
echo ""

SUCCESS=0
FAIL=0

test_pass() {
  echo "✅ $1"
  SUCCESS=$((SUCCESS + 1))
}

test_fail() {
  echo "❌ $1"
  FAIL=$((FAIL + 1))
}

echo "1. Testing package.json configuration..."
if grep -q '"commit": "git-cz"' package.json; then
  test_pass "commit script found"
else
  test_fail "commit script not found"
fi

if grep -q '"release": "semantic-release"' package.json; then
  test_pass "release script found"
else
  test_fail "release script not found"
fi

if grep -q '"commitizen"' package.json; then
  test_pass "commitizen config found"
else
  test_fail "commitizen config not found"
fi

echo ""
echo "2. Testing dependencies..."
if npm list semantic-release &>/dev/null; then
  test_pass "semantic-release installed"
else
  test_fail "semantic-release not installed"
fi

if npm list commitizen &>/dev/null; then
  test_pass "commitizen installed"
else
  test_fail "commitizen not installed"
fi

if npm list @semantic-release/changelog &>/dev/null; then
  test_pass "changelog plugin installed"
else
  test_fail "changelog plugin not installed"
fi

if npm list @semantic-release/git &>/dev/null; then
  test_pass "git plugin installed"
else
  test_fail "git plugin not installed"
fi

if npm list @semantic-release/github &>/dev/null; then
  test_pass "github plugin installed"
else
  test_fail "github plugin not installed"
fi

echo ""
echo "3. Testing configuration files..."
if [ -f .releaserc.json ]; then
  test_pass ".releaserc.json exists"
else
  test_fail ".releaserc.json not found"
fi

if [ -f .czrc ]; then
  test_pass ".czrc exists"
else
  test_fail ".czrc not found"
fi

if [ -f CHANGELOG.md ]; then
  test_pass "CHANGELOG.md exists"
else
  test_fail "CHANGELOG.md not found"
fi

echo ""
echo "4. Testing GitHub Actions workflows..."
if [ -f .github/workflows/release.yml ]; then
  test_pass "release.yml workflow exists"
else
  test_fail "release.yml workflow not found"
fi

if [ -f .github/workflows/deploy-on-release.yml ]; then
  test_pass "deploy-on-release.yml workflow exists"
else
  test_fail "deploy-on-release.yml workflow not found"
fi

echo ""
echo "5. Testing documentation..."
if [ -f docs/VERSIONING.md ]; then
  test_pass "VERSIONING.md exists"
else
  test_fail "VERSIONING.md not found"
fi

if [ -f docs/QUICK_START_VERSIONING.md ]; then
  test_pass "QUICK_START_VERSIONING.md exists"
else
  test_fail "QUICK_START_VERSIONING.md not found"
fi

if [ -f docs/VERSIONING_EXAMPLES.md ]; then
  test_pass "VERSIONING_EXAMPLES.md exists"
else
  test_fail "VERSIONING_EXAMPLES.md not found"
fi

echo ""
echo "6. Testing utility scripts..."
if [ -x scripts/validate-commit-msg.sh ]; then
  test_pass "validate-commit-msg.sh is executable"
else
  test_fail "validate-commit-msg.sh not executable"
fi

if [ -x scripts/version-preview.sh ]; then
  test_pass "version-preview.sh is executable"
else
  test_fail "version-preview.sh not executable"
fi

echo ""
echo "7. Testing commit validation..."
if bash scripts/validate-commit-msg.sh "feat(test): test message" &>/dev/null; then
  test_pass "Valid commit message accepted"
else
  test_fail "Valid commit message rejected"
fi

if ! bash scripts/validate-commit-msg.sh "invalid message" &>/dev/null; then
  test_pass "Invalid commit message rejected"
else
  test_fail "Invalid commit message accepted"
fi

echo ""
echo "8. Testing semantic-release dry-run..."
if npm run release:dry &>/dev/null; then
  test_pass "semantic-release dry-run works"
else
  test_fail "semantic-release dry-run failed"
fi

echo ""
echo "===================================="
echo "📊 Test Results"
echo "===================================="
echo "✅ Passed: $SUCCESS"
echo "❌ Failed: $FAIL"
echo ""

if [ $FAIL -eq 0 ]; then
  echo "🎉 All tests passed! Versioning system is ready."
  exit 0
else
  echo "⚠️  Some tests failed. Please review the setup."
  exit 1
fi
