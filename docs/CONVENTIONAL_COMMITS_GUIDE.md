# 📝 Conventional Commits & Changelog Guide

This guide explains how to use conventional commits for automatic changelog generation in the Saraiva Vision project.

## 📋 Table of Contents

1. [What are Conventional Commits?](#what-are-conventional-commits)
2. [Commit Message Format](#commit-message-format)
3. [Commit Types](#commit-types)
4. [Examples](#examples)
5. [Breaking Changes](#breaking-changes)
6. [Release Process](#release-process)
7. [Automated Changelog](#automated-changelog)
8. [Troubleshooting](#troubleshooting)

## What are Conventional Commits?

Conventional Commits is a specification for adding human and machine-readable meaning to commit messages. It provides a standardized format that enables:

- **Automatic CHANGELOG generation**
- **Semantic versioning automation**
- **Better collaboration** through clear commit history
- **Easier project navigation** and understanding

## Commit Message Format

Each commit message consists of a **header**, an optional **body**, and an optional **footer**:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Header (Required)

The header has a special format that includes a **type**, an optional **scope**, and a **subject**:

```
<type>(<scope>): <subject>
```

- **type**: Describes the kind of change (see types below)
- **scope**: Optional, indicates what part of the codebase is affected
- **subject**: Short description (max 100 characters)

### Body (Optional)

The body provides additional contextual information about the changes. It should:

- Be separated from the header by a blank line
- Explain the **what** and **why** vs. how
- Use imperative, present tense: "change" not "changed" nor "changes"
- Include motivation for the change and contrast with previous behavior

### Footer (Optional)

The footer should contain:

- Breaking change information (starting with `BREAKING CHANGE:`)
- Reference to issues/PRs closed by this commit (e.g., `Closes #123`)

## Commit Types

Our project uses these conventional commit types:

| Type | Description | Changelog Section | Version Bump |
|------|-------------|-------------------|--------------|
| `feat` | New feature | ✨ Features | Minor |
| `fix` | Bug fix | 🐛 Bug Fixes | Patch |
| `perf` | Performance improvement | ⚡ Performance Improvements | Patch |
| `refactor` | Code refactoring | ♻️ Code Refactoring | Patch |
| `docs` | Documentation changes | 📚 Documentation | Patch |
| `style` | Code style changes (formatting, etc.) | 💎 Styles | Patch |
| `test` | Adding or updating tests | ✅ Tests | Patch |
| `build` | Build system or dependencies | 🔧 Build System | Patch |
| `ci` | CI/CD changes | 👷 CI/CD | Patch |
| `chore` | Other changes (maintenance, etc.) | 🔨 Chores | Patch |
| `revert` | Revert a previous commit | 🔄 Reverts | Patch |

## Examples

### Simple Feature

```bash
git commit -m "feat: add appointment scheduling to contact form"
```

### Bug Fix with Scope

```bash
git commit -m "fix(blog): resolve image loading issue on mobile devices"
```

### Feature with Body

```bash
git commit -m "feat(analytics): integrate Google Analytics 4

Add GA4 tracking for page views and user interactions.
Includes custom events for contact form submissions and appointment bookings.

Closes #42"
```

### Performance Improvement

```bash
git commit -m "perf(images): optimize blog cover image loading

Implement lazy loading and WebP format for blog images.
Reduces initial page load by ~40%."
```

### Documentation Update

```bash
git commit -m "docs: update deployment guide with new CI/CD workflow"
```

### Code Refactoring

```bash
git commit -m "refactor(components): extract reusable form validation logic

Move form validation from individual components to shared utility.
Improves code maintainability and reduces duplication."
```

## Breaking Changes

Breaking changes **must** be indicated in the commit message. There are two ways:

### Method 1: Using `!` after type/scope

```bash
git commit -m "feat!: change API endpoint structure

BREAKING CHANGE: The contact form API endpoint has been changed from
/api/contact to /api/v2/contact. Update all client code accordingly.

Migration guide: Update fetch calls to use the new endpoint structure.
Old: POST /api/contact
New: POST /api/v2/contact"
```

### Method 2: Using `BREAKING CHANGE:` in footer

```bash
git commit -m "refactor(api): restructure contact form validation

BREAKING CHANGE: The validation schema has changed. The 'phone' field
is now required and must include country code.

Update form submissions to include phone numbers in format: +55XXXXXXXXXXX"
```

## Release Process

### Automatic Releases (Recommended)

Releases are automatically created when commits are pushed to the main branch:

1. **Commit using conventional format**:
   ```bash
   git commit -m "feat: add new feature"
   ```

2. **Push to main branch**:
   ```bash
   git push origin main
   ```

3. **GitHub Actions automatically**:
   - Generates/updates CHANGELOG.md
   - Bumps version in package.json
   - Creates a Git tag
   - Publishes a GitHub Release

### Manual Releases

You can also trigger releases manually using npm scripts:

```bash
# Automatic version bump based on commits
npm run release

# Specific version bump
npm run release:patch   # 1.0.0 -> 1.0.1
npm run release:minor   # 1.0.0 -> 1.1.0
npm run release:major   # 1.0.0 -> 2.0.0

# Dry run (see what would happen)
npm run release:dry-run

# First release (doesn't bump version)
npm run release:first
```

### Version Bumping Rules

- `feat` commits → **minor** version bump (1.0.0 → 1.1.0)
- `fix`, `perf`, `refactor` commits → **patch** version bump (1.0.0 → 1.0.1)
- `BREAKING CHANGE` in any commit → **major** version bump (1.0.0 → 2.0.0)

## Automated Changelog

The CHANGELOG.md file is automatically generated with:

### Features

- ✅ **Automatic categorization** by commit type
- ✅ **Direct links** to commits, PRs, and issues
- ✅ **Breaking changes** highlighted with warnings
- ✅ **Contributor attribution** with GitHub usernames
- ✅ **Version comparison** links between releases
- ✅ **Date stamps** for each release

### Changelog Structure

```markdown
# Changelog

## [2.1.0] - 2024-10-19

### ✨ Features
- feat: add appointment scheduling ([#123](link))
- feat(blog): implement podcast integration ([abc123](link))

### 🐛 Bug Fixes
- fix: resolve mobile navigation issue ([#124](link))

### ⚠️ BREAKING CHANGES
- **BREAKING CHANGE**: API endpoint structure changed
  Migration guide: Update all /api/contact calls to /api/v2/contact

### 📚 Documentation
- docs: update API documentation

## [2.0.1] - 2024-10-15
...
```

## Troubleshooting

### Commit Message Rejected

If your commit is rejected by the commit-msg hook:

```
⧗   input: Added new feature
✖   subject may not be empty [subject-empty]
✖   type may not be empty [type-empty]
```

**Solution**: Use conventional commit format:
```bash
git commit -m "feat: add new feature"
```

### Release Not Generated

If a release isn't automatically generated:

1. **Check commit format**: Ensure you're using conventional commits
2. **Check branch**: Releases only trigger on main/master branch
3. **Check recent commits**: The workflow skips if there's already a release commit

### Skipping CI for Commits

To skip CI/CD for documentation or non-code changes:

```bash
git commit -m "docs: update README [skip ci]"
```

### Manual Changelog Edit

If you need to manually edit the changelog:

1. Edit CHANGELOG.md as needed
2. Commit with: `git commit -m "docs(changelog): manual update"`
3. The next automatic release will append to your changes

## Best Practices

1. ✅ **Write clear, descriptive subjects** (50 chars or less)
2. ✅ **Use present tense** ("add" not "added")
3. ✅ **Capitalize first letter** of subject
4. ✅ **No period at the end** of subject
5. ✅ **Include scope** when relevant (e.g., `feat(blog):`)
6. ✅ **Reference issues** in body or footer (`Closes #123`)
7. ✅ **Explain why** in the body, not what (the diff shows what)
8. ✅ **Highlight breaking changes** prominently

## Additional Resources

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Standard Version Documentation](https://github.com/conventional-changelog/standard-version)

## Support

For questions or issues:
- Check this guide first
- Review existing commit history for examples
- Ask in team chat or create an issue
- See [CONTRIBUTING.md](../CONTRIBUTING.md) for more guidelines

---

**Remember**: Good commit messages help everyone understand the project's history and evolution. Take the time to write meaningful commits! 🎯
