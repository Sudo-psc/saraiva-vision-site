# 📝 Conventional Commits Quick Reference

Quick reference card for conventional commits in Saraiva Vision project.

## Basic Format

```
<type>(<scope>): <subject>
```

## Types Reference

| Type | When to Use | Example | Version |
|------|-------------|---------|---------|
| `feat` | New feature | `feat: add online scheduling` | Minor ⬆️ |
| `fix` | Bug fix | `fix: resolve form validation` | Patch ⬆️ |
| `perf` | Performance | `perf: optimize image loading` | Patch ⬆️ |
| `refactor` | Code restructure | `refactor: simplify validation logic` | Patch ⬆️ |
| `docs` | Documentation | `docs: update API guide` | Patch ⬆️ |
| `style` | Code formatting | `style: fix indentation` | Patch ⬆️ |
| `test` | Tests | `test: add form validation tests` | Patch ⬆️ |
| `build` | Build/dependencies | `build: update npm packages` | Patch ⬆️ |
| `ci` | CI/CD | `ci: improve workflow` | Patch ⬆️ |
| `chore` | Maintenance | `chore: update gitignore` | Patch ⬆️ |

## Quick Examples

### Feature
```bash
git commit -m "feat: add appointment scheduling"
git commit -m "feat(blog): add podcast integration"
```

### Bug Fix
```bash
git commit -m "fix: resolve mobile navigation issue"
git commit -m "fix(analytics): correct tracking script"
```

### With Body
```bash
git commit -m "feat(contact): add WhatsApp integration

Allows users to contact via WhatsApp directly from the contact page.
Includes country code validation and business hours check.

Closes #42"
```

### Breaking Change
```bash
git commit -m "feat!: change API endpoint structure

BREAKING CHANGE: API endpoints moved from /api to /api/v2
Migration: Update all API calls to use /api/v2 prefix"
```

## Scope Examples

Common scopes in this project:

- `(blog)` - Blog-related changes
- `(analytics)` - Analytics and tracking
- `(contact)` - Contact form and communication
- `(api)` - Backend API changes
- `(ui)` - User interface components
- `(seo)` - SEO and metadata
- `(a11y)` - Accessibility improvements
- `(perf)` - Performance optimizations
- `(security)` - Security fixes

## Do's and Don'ts

### ✅ Do

- Use present tense: "add" not "added"
- Keep subject under 100 characters
- Capitalize first letter of subject
- Use lowercase for type
- Include scope when relevant
- Reference issues: `Closes #123`

### ❌ Don't

- Don't use period at end of subject
- Don't capitalize type: `Feat:` ❌
- Don't forget colon: `feat add feature` ❌
- Don't use wrong types: `feature:` ❌
- Don't write vague messages: `fix: fix stuff` ❌

## Quick Validation Test

```bash
# Test if your message is valid
echo "feat: your message here" | npx commitlint

# If it fails, you'll see what's wrong
```

## Version Bumping

- `feat:` commits → Minor version (1.0.0 → 1.1.0)
- `fix:`, `perf:`, etc → Patch version (1.0.0 → 1.0.1)
- `BREAKING CHANGE:` → Major version (1.0.0 → 2.0.0)

## Changelog Emojis

Your commits will appear in CHANGELOG.md under:

- ✨ Features (`feat`)
- 🐛 Bug Fixes (`fix`)
- ⚡ Performance (`perf`)
- ♻️ Refactoring (`refactor`)
- 📚 Documentation (`docs`)
- 💎 Styles (`style`)
- ✅ Tests (`test`)
- 🔧 Build (`build`)
- 👷 CI/CD (`ci`)
- 🔨 Chores (`chore`)

## CLI Commands

```bash
# Create a release
npm run release

# See what would happen (dry run)
npm run release:dry-run

# Specific version bump
npm run release:patch  # 1.0.0 → 1.0.1
npm run release:minor  # 1.0.0 → 1.1.0
npm run release:major  # 1.0.0 → 2.0.0
```

## Pro Tips

1. **Write meaningful subjects**: Explain WHAT changed, not how
2. **Use scopes**: Helps organize changelog
3. **Reference issues**: Makes tracking easier
4. **Explain breaking changes**: Include migration guide
5. **Keep commits atomic**: One logical change per commit

## Common Patterns

### Multiple files, one purpose
```bash
git commit -m "feat(blog): add RSS feed support

- Add RSS generator script
- Create feed template
- Update blog routes
- Add feed link to header"
```

### Bug fix with context
```bash
git commit -m "fix(analytics): resolve duplicate event tracking

Events were being tracked twice due to component remounting.
Added effect cleanup to prevent duplicate tracking.

Fixes #156"
```

### Documentation update
```bash
git commit -m "docs: add API authentication guide

Includes examples for token generation and usage"
```

## Help & Resources

- Full guide: [CONVENTIONAL_COMMITS_GUIDE.md](./CONVENTIONAL_COMMITS_GUIDE.md)
- Testing: [CHANGELOG_TESTING.md](./CHANGELOG_TESTING.md)
- Automation: [CHANGELOG_AUTOMATION.md](./CHANGELOG_AUTOMATION.md)
- Contributing: [../CONTRIBUTING.md](../CONTRIBUTING.md)

## Quick Check Before Commit

- [ ] Does it follow the format: `type(scope): subject`?
- [ ] Is the type correct (feat, fix, docs, etc)?
- [ ] Is the subject clear and descriptive?
- [ ] Did I reference related issues?
- [ ] Did I mark breaking changes?

---

**Remember**: Good commit messages make everyone's life easier! 🎯

Print this guide or keep it handy for quick reference.
