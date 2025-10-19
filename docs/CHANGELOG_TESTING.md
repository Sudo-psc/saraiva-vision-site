# 🧪 Changelog System Testing Guide

This guide helps you test the automated changelog generation system.

## Quick Test Checklist

### 1. Test Commit Message Validation

```bash
# Test valid commit
echo "feat: add new feature" | npx commitlint
# ✅ Should pass

# Test invalid commit
echo "Added new feature" | npx commitlint
# ❌ Should fail with error messages
```

### 2. Test Release Dry Run

```bash
# Preview what would happen in a release
npm run release:dry-run

# Should show:
# - Version that would be bumped to
# - Commits that would be included
# - Changelog that would be generated
```

### 3. Test Manual Release (Local)

```bash
# Create a feature branch for testing
git checkout -b test/release-flow

# Make a test commit
git commit --allow-empty -m "feat: test feature for release"

# Run release (creates tag and updates changelog)
npm run release

# Check the results
git log --oneline -5
cat CHANGELOG.md | head -30

# Cleanup (don't push test release)
git reset --hard HEAD~1
git tag -d v<version>
git checkout main
git branch -D test/release-flow
```

### 4. Test Conventional Commit Types

Create test commits for each type:

```bash
# Features (minor version bump)
git commit --allow-empty -m "feat: add appointment system"
git commit --allow-empty -m "feat(blog): add RSS feed"

# Bug fixes (patch version bump)
git commit --allow-empty -m "fix: resolve login issue"
git commit --allow-empty -m "fix(analytics): correct tracking"

# Performance improvements
git commit --allow-empty -m "perf: optimize image loading"

# Refactoring
git commit --allow-empty -m "refactor: restructure API endpoints"

# Documentation
git commit --allow-empty -m "docs: update API guide"

# Tests
git commit --allow-empty -m "test: add unit tests for forms"

# Build/CI
git commit --allow-empty -m "build: update dependencies"
git commit --allow-empty -m "ci: improve GitHub Actions workflow"

# Chores
git commit --allow-empty -m "chore: update gitignore"
```

### 5. Test Breaking Changes

```bash
# Method 1: Using ! after type
git commit --allow-empty -m "feat!: change API structure

BREAKING CHANGE: API endpoints moved from /api to /api/v2"

# Method 2: Using footer
git commit --allow-empty -m "refactor: update validation

BREAKING CHANGE: Phone field now required with country code"
```

### 6. Test with Issue References

```bash
git commit --allow-empty -m "fix: resolve navigation bug

Closes #123
Relates to #45"
```

### 7. Test GitHub Actions Workflow (Requires Push)

```bash
# On a test branch
git checkout -b test/release-automation

# Make conventional commits
git commit --allow-empty -m "feat: test automated release"

# Push to GitHub
git push origin test/release-automation

# Check GitHub Actions:
# - Go to repository on GitHub
# - Click "Actions" tab
# - Look for "Release & Changelog" workflow
# - Should show if it would trigger
```

## Manual Workflow Test

### Step-by-Step Release Test

1. **Setup**:
   ```bash
   git checkout -b test/full-release
   ```

2. **Make changes**:
   ```bash
   git commit --allow-empty -m "feat: add feature A"
   git commit --allow-empty -m "fix: resolve bug B"
   git commit --allow-empty -m "docs: update guide C"
   ```

3. **Dry run**:
   ```bash
   npm run release:dry-run
   ```
   
   Verify output shows:
   - Current version
   - New version (should be minor bump due to feat)
   - List of commits to include
   - Changelog preview

4. **Create release**:
   ```bash
   npm run release
   ```
   
   Verify:
   - package.json version updated
   - CHANGELOG.md updated with new section
   - Git tag created
   - Commit created with "chore(release):" message

5. **Inspect results**:
   ```bash
   # Check version
   cat package.json | grep version
   
   # Check changelog
   cat CHANGELOG.md | head -50
   
   # Check git log
   git log --oneline -5
   
   # Check tags
   git tag -l
   ```

6. **Cleanup**:
   ```bash
   # If satisfied, push (but not to main!)
   git push origin test/full-release --follow-tags
   
   # Or rollback
   git reset --hard HEAD~1
   git tag -d v<version>
   ```

## Expected Results

### Valid Commit Examples

✅ `feat: add new feature`
✅ `fix(blog): resolve image issue`
✅ `docs: update README`
✅ `perf: optimize loading`
✅ `refactor(api): restructure endpoints`

### Invalid Commit Examples

❌ `Added new feature` (no type)
❌ `feature: add feature` (wrong type name)
❌ `Feat: add feature` (capitalized)
❌ `feat add feature` (missing colon)
❌ `feat:add feature` (no space after colon)

### Changelog Categories

After release, CHANGELOG.md should contain:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### ✨ Features
- feat: add appointment system ([abc123](link))

### 🐛 Bug Fixes
- fix: resolve login issue ([def456](link))

### ⚡ Performance Improvements
- perf: optimize loading ([ghi789](link))

### 📚 Documentation
- docs: update README ([jkl012](link))
```

## Troubleshooting Tests

### Commitlint Not Working

```bash
# Check installation
npx commitlint --version

# Test manually
echo "feat: test" | npx commitlint --verbose
```

### Husky Hook Not Triggering

```bash
# Check hook exists
ls -la .husky/commit-msg

# Check permissions
chmod +x .husky/commit-msg

# Try manual test commit
git commit --allow-empty -m "invalid message"
# Should be rejected
```

### Standard-Version Not Finding Commits

```bash
# Check if commits are conventional
git log --oneline -10

# Run with verbose output
npx standard-version --dry-run --verbose
```

### GitHub Actions Not Triggering

1. Check workflow file syntax:
   ```bash
   cat .github/workflows/release.yml
   ```

2. Verify trigger conditions:
   - Must be on main/master branch
   - Must have conventional commits
   - Can't be a release commit itself

3. Check Actions tab on GitHub for errors

## CI/CD Integration Test

### Test Release Workflow End-to-End

1. **Create feature branch**:
   ```bash
   git checkout -b feat/test-changelog
   ```

2. **Make changes with conventional commits**:
   ```bash
   git commit --allow-empty -m "feat: test feature"
   git commit --allow-empty -m "fix: test fix"
   ```

3. **Create PR to main** (but don't merge yet)

4. **Review**:
   - PR title should follow conventional format
   - PR template should be filled
   - Tests should pass

5. **After merge** (by maintainer):
   - GitHub Actions should trigger
   - Release should be created automatically
   - CHANGELOG should be updated
   - GitHub Release should be published

## Automated Tests

You can also create automated tests:

```javascript
// tests/changelog.test.js
import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';

describe('Changelog System', () => {
  it('should validate correct commit format', () => {
    const result = execSync(
      'echo "feat: test" | npx commitlint',
      { encoding: 'utf-8' }
    );
    expect(result).toBeTruthy();
  });

  it('should reject invalid commit format', () => {
    expect(() => {
      execSync(
        'echo "invalid" | npx commitlint',
        { encoding: 'utf-8' }
      );
    }).toThrow();
  });
});
```

## Success Criteria

✅ All commit types validate correctly
✅ Invalid commits are rejected
✅ Dry run shows expected version bump
✅ Release generates correct CHANGELOG.md
✅ Git tags are created properly
✅ GitHub Actions workflow passes
✅ GitHub Release is published (when pushed to main)

## Common Issues and Solutions

### Issue: Commits not showing in changelog
**Solution**: Ensure commits follow conventional format exactly

### Issue: Wrong version bump
**Solution**: 
- `feat:` = minor (0.x.0)
- `fix:`, `perf:`, etc = patch (0.0.x)
- `BREAKING CHANGE:` = major (x.0.0)

### Issue: Husky hooks not running
**Solution**: Run `npm install` to reinstall hooks

### Issue: GitHub Actions fails
**Solution**: Check Actions logs, verify GITHUB_TOKEN permissions

## Next Steps After Testing

Once all tests pass:

1. ✅ Merge the PR to main
2. ✅ Monitor first automatic release
3. ✅ Verify GitHub Release is published
4. ✅ Share conventional commits guide with team
5. ✅ Set up branch protection rules (optional)
6. ✅ Configure PR title validation (optional)

---

For questions or issues, see [CHANGELOG_AUTOMATION.md](./CHANGELOG_AUTOMATION.md) or [CONVENTIONAL_COMMITS_GUIDE.md](./CONVENTIONAL_COMMITS_GUIDE.md).
