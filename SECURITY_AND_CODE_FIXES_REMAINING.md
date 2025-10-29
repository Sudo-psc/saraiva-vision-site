# 🔒 Security and Code Quality Fixes - Remaining Tasks

## ✅ COMPLETED (Committed: bfa5ceea)

1. **MONIT_INSTALLATION_REPORT.md** - Removed PII email, secured credentials documentation
2. **MONIT_README.md** - Removed exposed credentials, added secure access instructions
3. **.gitignore** - Added monit-credentials.txt and monitrc.new

## 🚨 CRITICAL - Immediate Action Required

### 1. Rotate Exposed Monit Password
**Priority**: IMMEDIATE
**Action**: Change Monit admin password on server
```bash
# Generate new password
NEW_PASS=$(openssl rand -base64 24)
# Update monitrc
sudo sed -i "s/allow admin:OLD_PASSWORD/allow admin:$NEW_PASS/" /etc/monit/monitrc
# Update credentials file
echo "Username: admin" | sudo tee /home/saraiva-vision-site/monit-credentials.txt
echo "Password: $NEW_PASS" | sudo tee -a /home/saraiva-vision-site/monit-credentials.txt
sudo chmod 600 /home/saraiva-vision-site/monit-credentials.txt
# Reload Monit
sudo monit reload
```

### 2. Purge monit-credentials.txt from Git History
**Priority**: CRITICAL
**Tool**: git-filter-repo (recommended) or BFG Repo-Cleaner

```bash
# Install git-filter-repo
pip3 install git-filter-repo

# Backup repo first
cd /home/saraiva-vision-site
git clone --mirror . ../saraiva-vision-site-backup.git

# Remove file from history
git filter-repo --path monit-credentials.txt --invert-paths --force

# Force push (coordinate with team first!)
git push origin --force --all
git push origin --force --tags
```

### 3. Secure monitrc.new File
**File**: `/home/saraiva-vision-site/monitrc.new`
**Issue**: Lines 22-25 contain hardcoded password and allow 0.0.0.0

**Required Changes**:
```bash
# Current (INSECURE):
set httpd port 2812
    allow 0.0.0.0/0
    allow admin:pnnH2rs1RaBcLBWnZrl33Qm3

# Change to (SECURE):
set httpd port 2812
    use address 127.0.0.1  # Bind to localhost only
    allow localhost
    allow admin:PASSWORD_FROM_ENV  # Load from env or external file
```

## 📝 CODE QUALITY FIXES

### 4. blogPosts.js - False Medical Claim
**File**: `src/data/blogPosts.js`
**Lines**: 935-936
**Issue**: Claims "Em 2024, a FDA aprovou os primeiros testes clínicos de lentes que monitoram glicose"

**Fix Required**:
```javascript
// CURRENT (FALSE):
"Em 2024, a FDA aprovou os primeiros testes clínicos de lentes que monitoram glicose continuamente"

// REPLACE WITH (ACCURATE):
"Pesquisas sobre lentes de contato com monitoramento contínuo de glicose continuam em desenvolvimento, mas nenhuma aprovação da FDA foi registrada publicamente em 2024. Grandes desenvolvedores pausaram ou descontinuaram programas. Fonte: https://www.fda.gov/medical-devices"
```

### 5. CI/CD Workflow Fixes

#### A. ci-parallel.yml - Unused PNPM_VERSION
**File**: `.github/workflows/ci-parallel.yml`
**Lines**: 9-11
**Options**:
1. Remove unused variable
2. OR implement pnpm usage

```yaml
# Option 1: Remove
env:
  NODE_VERSION: '22'
  # PNPM_VERSION: '9'  # REMOVED - not used

# Option 2: Implement pnpm
- name: Setup pnpm
  uses: pnpm/action-setup@v2
  with:
    version: ${{ env.PNPM_VERSION }}
- run: pnpm install
- run: pnpm run build
```

#### B. ci-parallel.yml - TOTAL_SIZE Glob Error
**File**: `.github/workflows/ci-parallel.yml`
**Lines**: 277-278

```bash
# CURRENT (BREAKS ON EMPTY):
TOTAL_SIZE=$(du -ch dist/assets/*.js 2>/dev/null | tail -1 | awk '{print $1}' || echo "0K")

# FIX 1: Enable nullglob
shopt -s nullglob
TOTAL_SIZE=$(du -ch dist/assets/*.js 2>/dev/null | tail -1 | awk '{print $1}' || echo "0K")

# FIX 2: Use find (RECOMMENDED):
TOTAL_SIZE=$(find dist/assets -name "*.js" -exec du -ch {} + 2>/dev/null | tail -1 | awk '{print $1}' || echo "0K")
```

#### C. deploy-production-optimized.yml - npm audit Bypass
**File**: `.github/workflows/deploy-production-optimized.yml`
**Lines**: 156-158

```yaml
# CURRENT (ALLOWS VULNERABILITIES):
- name: Security Audit
  run: npm audit --production || echo "⚠️ Vulnerabilities found"

# FIX (BLOCKS ON VULNERABILITIES):
- name: Security Audit
  run: npm audit --production || exit 1
```

#### D. performance-monitoring.yml - Brittle Parsing
**File**: `.github/workflows/performance-monitoring.yml`
**Lines**: 179-193

**Recommended Approach**: Modify performance-analyzer.js to output JSON

```javascript
// In performance-analyzer.js, add JSON output option:
if (process.argv.includes('--json')) {
  console.log(JSON.stringify({
    totalComponents: this.stats.totalComponents,
    avgComplexity: this.stats.avgComplexity,
    largeComponents: this.stats.largeComponents,
    bundleSize: this.stats.bundleSize,
    // ... other metrics
  }));
  return;
}
```

```yaml
# In workflow:
- name: Run Performance Analysis
  id: perf
  run: |
    npm run analyze:performance -- --json > perf-results.json
    echo "results=$(cat perf-results.json)" >> $GITHUB_OUTPUT

- name: Parse Results
  run: |
    TOTAL=$(jq -r '.totalComponents' <<< "${{ steps.perf.outputs.results }}")
    COMPLEXITY=$(jq -r '.avgComplexity' <<< "${{ steps.perf.outputs.results }}")
    # Validate numbers
    if ! [[ "$TOTAL" =~ ^[0-9]+$ ]]; then
      echo "❌ Invalid totalComponents"
      exit 1
    fi
```

### 6. Shell Script Fixes

#### A. monit-backup.sh - cd Error Handling
**File**: `monit-backup.sh`
**Lines**: 70-74

```bash
# CURRENT (UNSAFE):
cd "$BACKUP_DIR"
ls -t | tail -n +6 | xargs rm -rf

# FIX (SAFE):
if ! cd "$BACKUP_DIR"; then
  echo "❌ ERROR: Cannot access backup directory: $BACKUP_DIR"
  exit 1
fi
# Now safe to delete
ls -t | tail -n +6 | xargs rm -rf
```

#### B. monit-quick-status.sh - Unquoted Substitution
**File**: `monit-quick-status.sh`
**Line**: ~20

```bash
# CURRENT (WORD-SPLITTING ISSUE):
uptime=$(ps -p $PID -o etime= 2>/dev/null | xargs)
echo "Uptime: $uptime"

# FIX (QUOTED):
uptime="$(ps -p "$PID" -o etime= 2>/dev/null | xargs)"
echo "Uptime: ${uptime:-unknown}"
```

#### C. sanity/diagnose.sh - Hardcoded Paths
**File**: `sanity/diagnose.sh`
**Lines**: 18-141

```bash
# CURRENT (BRITTLE):
cd /home/saraiva-vision-site/sanity
npm install

# FIX (PORTABLE):
#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR/sanity" || exit 1
npm install

# Support multiple config file extensions
for config in sanity.config.{js,ts,mjs}; do
  if [[ -f "$config" ]]; then
    # Parse projectId/dataset
    break
  fi
done
```

### 7. Performance Analyzer Fixes

#### A. isComponent False Positives
**File**: `scripts/performance-analyzer.js`
**Lines**: 111-114

```javascript
// CURRENT (TOO PERMISSIVE):
const isComponent = /^function\s+[A-Z]/.test(content) ||
                   /^const\s+[A-Z].*=.*=>/.test(content);

// FIX (STRICT):
function isComponent(content, name) {
  // Must be PascalCase
  if (!/^[A-Z][a-z0-9]*([A-Z][a-z0-9]*)*$/.test(name)) {
    return false;
  }

  // Must have JSX or be exported
  const hasJSX = /<[A-Z]/.test(content) || /React\.createElement/.test(content);
  const isExported = /export\s+(default\s+)?/.test(content);
  const isClass = /class\s+\w+\s+extends\s+(React\.)?Component/.test(content);

  return (hasJSX || isClass) && isExported;
}
```

#### B. Division by Zero
**File**: `scripts/performance-analyzer.js`
**Lines**: 304-305

```javascript
// CURRENT (NaN RISK):
const percent = (value / this.stats.totalComponents * 100).toFixed(1);

// FIX (SAFE):
const percent = this.stats.totalComponents > 0
  ? (value / this.stats.totalComponents * 100).toFixed(1)
  : 'N/A';
console.log(`Percentage: ${percent}${typeof percent === 'number' ? '%' : ''}`);
```

### 8. JSON Duplicate Key Fix
**File**: `docs/editorial/posts_lentes_contato_2025.json`
**Lines**: 84-86

```json
// CURRENT (INVALID - DUPLICATE _type):
{
  "_type": "callout",
  "_type": "block",
  "style": "blockquote"
}

// FIX (VALID):
{
  "_type": "callout",
  "style": "blockquote"
}
```

## 📋 Summary Checklist

- [x] Remove PII from documentation
- [x] Secure Monit credentials in docs
- [x] Add sensitive files to .gitignore
- [ ] Rotate exposed Monit password
- [ ] Purge credentials from Git history
- [ ] Secure monitrc.new file
- [ ] Fix false medical claim in blogPosts.js
- [ ] Fix CI/CD workflow issues (4 files)
- [ ] Fix shell script errors (3 files)
- [ ] Fix performance analyzer issues (2 problems)
- [ ] Fix JSON duplicate key

## 🔄 Recommended Commit Strategy

1. **Security** (DONE): PII removal, credential documentation
2. **Critical**: Rotate passwords, purge history
3. **Workflows**: All CI/CD fixes in one commit
4. **Scripts**: All shell script fixes in one commit
5. **Code Quality**: Performance analyzer + blogPosts.js
6. **Data**: JSON fixes

---
**Generated**: 2025-10-29
**Author**: Dr. Philipe Saraiva Cruz (via Claude Code)
