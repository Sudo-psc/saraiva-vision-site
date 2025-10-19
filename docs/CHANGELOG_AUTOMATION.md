# 📦 Changelog Automation System

This document describes the automated changelog generation system for Saraiva Vision.

## 🎯 Overview

The project uses an automated changelog system based on **Conventional Commits** that provides:

- ✅ Automatic CHANGELOG.md generation
- ✅ Semantic versioning automation
- ✅ GitHub Releases with formatted changelogs
- ✅ Categorized change lists (Features, Bug Fixes, etc.)
- ✅ Direct links to commits, PRs, and issues
- ✅ Breaking changes highlighting
- ✅ Complete version history with dates and authors

## 🔧 Components

### 1. Commitlint

**Purpose**: Validates commit messages against conventional commit format

**Configuration**: `commitlint.config.js`

**Enforces**:
- Proper commit type (feat, fix, docs, etc.)
- Subject case and length limits
- Body and footer formatting

### 2. Husky

**Purpose**: Git hooks for commit message validation

**Configuration**: `.husky/commit-msg`

**Triggers**: On every commit attempt, validates the message format

### 3. Standard-Version

**Purpose**: Automates changelog generation and version bumping

**Configuration**: `.versionrc.json`

**Features**:
- Generates CHANGELOG.md from commit history
- Bumps version in package.json based on commit types
- Creates git tags for releases
- Customizable changelog sections and formatting

### 4. GitHub Actions

**Purpose**: Automates the release process in CI/CD

**Configuration**: `.github/workflows/release.yml`

**Workflow**:
1. Triggers on push to main branch
2. Checks for conventional commits
3. Generates/updates changelog
4. Bumps version and creates tag
5. Publishes GitHub Release
6. Updates repository with changes

## 📝 Commit Message Format

### Structure

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Supported Types

| Type | Description | Changelog Section | Version Impact |
|------|-------------|-------------------|----------------|
| `feat` | New feature | ✨ Features | Minor (0.x.0) |
| `fix` | Bug fix | 🐛 Bug Fixes | Patch (0.0.x) |
| `perf` | Performance improvement | ⚡ Performance | Patch (0.0.x) |
| `refactor` | Code refactoring | ♻️ Refactoring | Patch (0.0.x) |
| `docs` | Documentation | 📚 Documentation | Patch (0.0.x) |
| `style` | Code style | 💎 Styles | Patch (0.0.x) |
| `test` | Tests | ✅ Tests | Patch (0.0.x) |
| `build` | Build system | 🔧 Build | Patch (0.0.x) |
| `ci` | CI/CD | 👷 CI/CD | Patch (0.0.x) |
| `chore` | Maintenance | 🔨 Chores | Patch (0.0.x) |

### Breaking Changes

Indicate breaking changes using:
- `!` after type: `feat!: breaking change`
- `BREAKING CHANGE:` in footer

**Impact**: Triggers major version bump (x.0.0)

## 🚀 Release Process

### Automatic (Recommended)

1. **Commit with conventional format**:
   ```bash
   git commit -m "feat: add new appointment system"
   ```

2. **Push to main**:
   ```bash
   git push origin main
   ```

3. **Automated steps** (via GitHub Actions):
   - Validates conventional commits
   - Generates/updates CHANGELOG.md
   - Bumps version in package.json
   - Creates git tag (e.g., v2.1.0)
   - Publishes GitHub Release
   - Pushes changes back to repository

### Manual

Use npm scripts for manual releases:

```bash
# Automatic version bump based on commits
npm run release

# Specific version type
npm run release:patch   # 2.0.0 -> 2.0.1
npm run release:minor   # 2.0.0 -> 2.1.0
npm run release:major   # 2.0.0 -> 3.0.0

# Preview without making changes
npm run release:dry-run

# First release (no version bump)
npm run release:first
```

## 📋 Changelog Structure

The generated CHANGELOG.md follows this structure:

```markdown
# Changelog

All notable changes to the Saraiva Vision medical platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## ⚠️ Breaking Changes Warning

Breaking changes are marked with **BREAKING CHANGE** and include migration guides when applicable.

## [2.1.0] - 2024-10-19

### ✨ Features
- add appointment scheduling system ([#123](link)) ([abc123](link))
- **blog**: implement podcast integration ([#124](link)) ([def456](link))

### 🐛 Bug Fixes
- **analytics**: resolve tracking issue on mobile ([#125](link)) ([ghi789](link))
- correct contact form validation ([#126](link)) ([jkl012](link))

### ⚡ Performance Improvements
- optimize image loading with lazy loading ([mno345](link))

### 📚 Documentation
- update API documentation ([pqr678](link))

### ⚠️ BREAKING CHANGES
- **BREAKING CHANGE**: API endpoint structure changed
  - Old: `POST /api/contact`
  - New: `POST /api/v2/contact`
  - Migration: Update all API calls to use /api/v2/ prefix

## [2.0.1] - 2024-10-15
...
```

## 🔗 Links in Changelog

The changelog automatically includes:

### Commit Links
```markdown
- fix: resolve issue ([abc123](https://github.com/owner/repo/commit/abc123))
```

### Issue Links
```markdown
Closes #123 -> [#123](https://github.com/owner/repo/issues/123)
```

### PR Links
```markdown
Fixes #124 -> [#124](https://github.com/owner/repo/pull/124)
```

### Version Comparison
```markdown
[2.1.0]: https://github.com/owner/repo/compare/v2.0.1...v2.1.0
```

## 🎨 Breaking Changes Highlighting

Breaking changes are prominently displayed:

1. **In CHANGELOG.md**:
   - Dedicated section at the end
   - Clear warning message
   - Migration instructions

2. **In GitHub Releases**:
   - Warning at the top
   - Bold text for visibility
   - Links to migration guides

Example:
```markdown
### ⚠️ BREAKING CHANGES

**BREAKING CHANGE**: Contact form validation schema updated
- The `phone` field is now required
- Phone numbers must include country code (+55)
- Old format: `11999999999`
- New format: `+5511999999999`

Migration guide: Update form submissions to include phone numbers with country code.
```

## 📊 GitHub Releases

Automatic GitHub Releases include:

- **Version tag**: e.g., v2.1.0
- **Release name**: Release v2.1.0
- **Changelog excerpt**: Only changes for this version
- **Breaking changes warning**: If applicable
- **Commit links**: Direct links to all commits
- **Issue/PR references**: Clickable links
- **Author attribution**: GitHub usernames
- **Release date**: Automatic timestamp

## 🔍 Version History

Complete version history is maintained with:

- **Version numbers**: Following semantic versioning
- **Release dates**: ISO format (YYYY-MM-DD)
- **Commit SHAs**: Full traceability
- **Authors**: GitHub usernames
- **Categories**: Organized by change type
- **Comparisons**: Links to diff between versions

## 🛠️ Configuration

### Commitlint Configuration

File: `commitlint.config.js`

```javascript
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor',
      'perf', 'test', 'build', 'ci', 'chore', 'revert'
    ]],
    'subject-case': [2, 'never', ['upper-case']],
    'header-max-length': [2, 'always', 100],
  },
};
```

### Standard-Version Configuration

File: `.versionrc.json`

Key configurations:
- Custom changelog sections with emojis
- Issue/PR/commit link formats
- Breaking changes header
- Version bump rules

### GitHub Actions Configuration

File: `.github/workflows/release.yml`

Features:
- Automatic on push to main
- Manual trigger with version type selection
- Conventional commit validation
- Skip logic for release commits
- GitHub Release publication

## 🚨 Troubleshooting

### Commit Rejected

**Problem**: Commit message doesn't follow format

**Solution**:
```bash
# ❌ Wrong
git commit -m "Added new feature"

# ✅ Correct
git commit -m "feat: add new feature"
```

### No Release Generated

**Possible causes**:
1. No conventional commits found
2. Already a release commit
3. Not on main branch

**Check**:
```bash
# View recent commits
git log --oneline -10

# Check branch
git branch --show-current
```

### Changelog Not Updated

**Causes**:
1. Commits don't follow conventional format
2. Changes not merged to main
3. GitHub Actions workflow failed

**Fix**:
- Check GitHub Actions logs
- Verify commit message format
- Ensure proper branch

### Manual Changelog Edit

If you need to manually edit the changelog:

1. Edit CHANGELOG.md
2. Commit: `git commit -m "docs(changelog): manual update"`
3. Next automatic release will preserve your changes

## 📚 Best Practices

1. ✅ **Write meaningful commit subjects**
   - Bad: "fix stuff"
   - Good: "fix: resolve mobile navigation issue"

2. ✅ **Use scopes for clarity**
   - `feat(blog): add RSS feed`
   - `fix(analytics): correct tracking script`

3. ✅ **Include issue references**
   - `fix: resolve login issue (closes #123)`

4. ✅ **Document breaking changes thoroughly**
   - Include migration steps
   - Explain impact
   - Provide examples

5. ✅ **Keep commits focused**
   - One logical change per commit
   - Makes rollback easier
   - Clearer changelog

## 📖 Additional Resources

- [Conventional Commits Guide](./CONVENTIONAL_COMMITS_GUIDE.md)
- [Contributing Guidelines](../CONTRIBUTING.md)
- [Conventional Commits Spec](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Standard-Version Docs](https://github.com/conventional-changelog/standard-version)

## 🔄 Workflow Diagram

```
Developer commits with conventional format
                 ↓
Husky validates commit message
                 ↓
Code pushed to main branch
                 ↓
GitHub Actions triggered
                 ↓
Check for conventional commits
                 ↓
Generate/update CHANGELOG.md
                 ↓
Bump version in package.json
                 ↓
Create git tag
                 ↓
Push changes to repository
                 ↓
Create GitHub Release
                 ↓
Done! 🎉
```

## 🎯 Integration with CI/CD

The changelog system integrates seamlessly with the existing CI/CD:

1. **Pre-deployment**: Changelog generated before deployment
2. **Version tracking**: Each deployment has a version number
3. **Rollback support**: Easy to identify what changed in each version
4. **Audit trail**: Complete history of all changes

## 🔐 Security & Compliance

The changelog system supports CFM/LGPD compliance by:

- **Traceability**: Complete audit trail
- **Version control**: All changes documented
- **Author tracking**: Who made what changes
- **Issue linking**: Connect changes to requirements

---

For questions or issues with the changelog system, refer to this documentation or create an issue on GitHub.
