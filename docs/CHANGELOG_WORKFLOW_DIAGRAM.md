# 🔄 Changelog Automation Workflow Diagram

Visual representation of the automated changelog generation workflow.

## Complete Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DEVELOPER WORKFLOW                             │
└─────────────────────────────────────────────────────────────────────┘

    Developer writes code
           │
           ▼
    Makes commit with conventional format
    (e.g., "feat: add new feature")
           │
           ▼
    ┌──────────────────┐
    │  Husky Git Hook  │ ◄── Triggers on commit
    └──────────────────┘
           │
           ▼
    ┌──────────────────┐
    │   Commitlint     │ ◄── Validates message format
    └──────────────────┘
           │
           ├─── ❌ Invalid format
           │         │
           │         ▼
           │    Commit rejected
           │    (with error message)
           │
           └─── ✅ Valid format
                     │
                     ▼
                Commit succeeds
                     │
                     ▼
              Push to GitHub
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        CI/CD WORKFLOW                                 │
└─────────────────────────────────────────────────────────────────────┘

    ┌──────────────────────┐
    │  GitHub Actions      │ ◄── Triggers on push to main
    │  Workflow Starts     │
    └──────────────────────┘
           │
           ▼
    ┌──────────────────────┐
    │ Check for            │
    │ Conventional Commits │
    └──────────────────────┘
           │
           ├─── ❌ No conventional commits found
           │         │
           │         ▼
           │    Skip release
           │    (logs message)
           │
           └─── ✅ Found conventional commits
                     │
                     ▼
    ┌──────────────────────┐
    │  Standard-Version    │ ◄── Analyzes commit history
    │  Analyzes Commits    │
    └──────────────────────┘
           │
           ├─ Identifies commit types (feat, fix, etc)
           ├─ Determines version bump (major, minor, patch)
           └─ Groups changes by category
           │
           ▼
    ┌──────────────────────┐
    │  Generate/Update     │
    │  CHANGELOG.md        │
    └──────────────────────┘
           │
           ├─ Add new version section
           ├─ Categorize changes
           ├─ Add commit links
           └─ Highlight breaking changes
           │
           ▼
    ┌──────────────────────┐
    │  Update package.json │
    │  version             │
    └──────────────────────┘
           │
           ▼
    ┌──────────────────────┐
    │  Create Git Tag      │
    │  (e.g., v2.1.0)      │
    └──────────────────────┘
           │
           ▼
    ┌──────────────────────┐
    │  Commit Changes      │
    │  "chore(release):"   │
    └──────────────────────┘
           │
           ▼
    ┌──────────────────────┐
    │  Push to Repository  │
    │  (with tags)         │
    └──────────────────────┘
           │
           ▼
    ┌──────────────────────┐
    │  Extract Release     │
    │  Notes from          │
    │  CHANGELOG.md        │
    └──────────────────────┘
           │
           ▼
    ┌──────────────────────┐
    │  Create GitHub       │
    │  Release             │
    └──────────────────────┘
           │
           ├─ Attach version tag
           ├─ Include changelog excerpt
           ├─ Add commit links
           └─ Highlight breaking changes
           │
           ▼
    ┌──────────────────────┐
    │  Publish Release     │
    │  ✨ Success! ✨      │
    └──────────────────────┘

```

## Commit Type Decision Tree

```
                    Start: Writing Commit Message
                                │
                                ▼
                    What type of change is this?
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
    New Feature?          Bug Fix?              Documentation?
        │                       │                       │
        ├─ Yes                  ├─ Yes                 ├─ Yes
        │   ▼                   │   ▼                  │   ▼
        │  feat:                │  fix:                │  docs:
        │  (minor bump)         │  (patch bump)        │  (patch bump)
        │                       │                       │
        └─ No                   └─ No                  └─ No
            │                       │                       │
            ▼                       ▼                       ▼
    ┌────────────┐        ┌────────────┐        ┌────────────┐
    │ Other      │        │ Other      │        │ Other      │
    │ Types?     │        │ Types?     │        │ Types?     │
    └────────────┘        └────────────┘        └────────────┘
            │                       │                       │
            ▼                       ▼                       ▼
    • perf: (performance)   • style: (formatting)   • test: (tests)
    • refactor: (code)      • build: (dependencies) • ci: (workflows)
    • chore: (maintenance)

                All lead to → Patch Version Bump
                                    │
                                    ▼
                    Is there a BREAKING CHANGE?
                                    │
                        ┌───────────┴───────────┐
                        │                       │
                        ▼                       ▼
                       Yes                     No
                        │                       │
                        ▼                       ▼
                  Major Bump              Keep bump type
                  (e.g., 1.x.x → 2.0.0)   from commit type
```

## Version Bumping Logic

```
                    Analyze Commit History
                            │
                            ▼
            ┌───────────────┴───────────────┐
            │                               │
            ▼                               ▼
    BREAKING CHANGE found?            feat: commits?
            │                               │
            ├─ Yes                          ├─ Yes
            │   ▼                           │   ▼
            │  MAJOR                        │  MINOR
            │  x.0.0                        │  0.x.0
            │                               │
            └─ No ─────┐                    └─ No ─────┐
                       │                               │
                       ▼                               ▼
            fix:, perf:, refactor:,           No changes or
            docs:, style:, test:,             only chore:
            build:, ci: commits?              commits?
                       │                               │
                       ├─ Yes                          ├─ Yes
                       │   ▼                           │   ▼
                       │  PATCH                        │  NO BUMP
                       │  0.0.x                        │  (skip)
                       │                               │
                       └───────────────────────────────┘

            Example Version Progression:
            1.0.0 → feat: → 1.1.0
            1.1.0 → fix: → 1.1.1
            1.1.1 → feat!: → 2.0.0
            2.0.0 → docs: → 2.0.1
```

## CHANGELOG Generation Flow

```
    Standard-Version starts
            │
            ▼
    Read package.json version
    (e.g., 2.0.1)
            │
            ▼
    Find last release tag
    (e.g., v2.0.1)
            │
            ▼
    Get commits since last tag
            │
            ▼
    Parse each commit message
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
    feat:           fix:
    │               │
    ▼               ▼
    Group by type
            │
            ▼
    ┌─────────────────────────────────────┐
    │      Generated CHANGELOG             │
    ├─────────────────────────────────────┤
    │ ## [2.1.0] - 2024-10-19            │
    │                                     │
    │ ### ✨ Features                     │
    │ - feat: description ([link])        │
    │                                     │
    │ ### 🐛 Bug Fixes                    │
    │ - fix: description ([link])         │
    │                                     │
    │ ### ⚠️ BREAKING CHANGES             │
    │ - Details and migration guide       │
    └─────────────────────────────────────┘
            │
            ▼
    Write to CHANGELOG.md
            │
            ▼
    Update package.json version
            │
            ▼
    Create git tag
            │
            ▼
    Done!
```

## GitHub Release Flow

```
    GitHub Actions completes
    changelog generation
            │
            ▼
    Extract version from
    package.json
    (e.g., v2.1.0)
            │
            ▼
    Read CHANGELOG.md
            │
            ▼
    Extract section for
    current version
            │
            ▼
    Format release notes:
            │
    ┌───────┴───────────────────────────┐
    │                                   │
    ├─ ⚠️ Breaking changes warning      │
    │  (if applicable)                  │
    │                                   │
    ├─ ✨ Features list                 │
    │  (with links)                     │
    │                                   │
    ├─ 🐛 Bug Fixes list                │
    │  (with links)                     │
    │                                   │
    ├─ Other sections...                │
    │                                   │
    └───────────────────────────────────┘
            │
            ▼
    Create GitHub Release
            │
    ┌───────┴──────────────────┐
    │                          │
    ├─ Tag: v2.1.0             │
    ├─ Name: Release v2.1.0    │
    ├─ Body: (formatted notes) │
    ├─ Latest: true            │
    └──────────────────────────┘
            │
            ▼
    Publish to GitHub
            │
            ▼
    ✨ Success! ✨
    Release is now public
```

## Error Handling Flow

```
    Commit attempted
            │
            ▼
    Is format valid?
            │
    ┌───────┴────────┐
    │                │
    ▼                ▼
   No               Yes
    │                │
    ▼                │
    Show error       │
    message          │
    │                │
    ▼                │
    List problems:   │
    • type empty     │
    • subject empty  │
    • etc.           │
    │                │
    ▼                │
    Provide help     │
    link             │
    │                │
    ▼                │
    Reject commit    │
    │                │
    └────────────────┘
            │
            ▼
    Developer fixes
    and tries again
```

## Integration Points

```
┌─────────────────────────────────────────────────────────────┐
│                  EXISTING CI/CD PIPELINE                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  [Lint] → [Test] → [Build] → [Release] → [Deploy]          │
│                                    ▲                          │
│                                    │                          │
│                          NEW INTEGRATION POINT                │
│                                    │                          │
│                    ┌───────────────┴──────────────┐          │
│                    │                               │          │
│                    │  Changelog Automation        │          │
│                    │  - Generate CHANGELOG        │          │
│                    │  - Bump version              │          │
│                    │  - Create release            │          │
│                    │                               │          │
│                    └───────────────────────────────┘          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Timeline Example

```
Day 1:
  10:00 → feat: add feature A (commit)
  10:05 → fix: resolve bug B (commit)
  10:10 → docs: update guide (commit)
  10:15 → Push to main
  10:16 → GitHub Actions triggered
  10:18 → Changelog generated
  10:19 → Version bumped: 2.0.1 → 2.1.0
  10:20 → Git tag created: v2.1.0
  10:21 → GitHub Release published ✨
  
  Result: All changes documented and released automatically!
```

## Quick Reference

| Component | Purpose | Trigger |
|-----------|---------|---------|
| Husky | Git hooks | Every commit |
| Commitlint | Validation | Every commit |
| Standard-Version | Changelog | Manual or CI |
| GitHub Actions | Automation | Push to main |
| GitHub Releases | Distribution | After changelog |

## Success Metrics

```
Before Automation:
  Manual CHANGELOG updates     → Error-prone
  Inconsistent versioning      → Confusing
  Missing change documentation → Lost history
  Manual release notes         → Time-consuming

After Automation:
  ✅ Automatic CHANGELOG        → Consistent
  ✅ Semantic versioning        → Predictable
  ✅ Complete documentation     → Full traceability
  ✅ Auto-generated releases    → Efficient
```

---

For more details, see:
- [Conventional Commits Guide](./CONVENTIONAL_COMMITS_GUIDE.md)
- [Changelog Automation](./CHANGELOG_AUTOMATION.md)
- [Testing Guide](./CHANGELOG_TESTING.md)
