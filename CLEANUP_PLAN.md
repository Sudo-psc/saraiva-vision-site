# 🧹 Project Cleanup Plan - Saraiva Vision

*Generated: 2025-09-01*

## 📊 Cleanup Analysis Results

### Files Identified for Cleanup

#### 🗂️ Duplicate Documentation
- **IMPLEMENTATION_GUIDE.md** (root) vs **docs/IMPLEMENTATION_GUIDE.md**
  - Root version: 7.1KB, dated 2025-08-16 (older, specific to refinement)
  - Docs version: newer, more comprehensive
  - **Action**: Remove root version, keep docs version

#### 🧪 Test Files (Development/Debug)
- `test-recaptcha-direct.mjs` - Development testing script
- `test-contact-api.mjs` - API testing script  
- `test-recaptcha-complete.html` - HTML test file
- `public/test-spotify.html` - Spotify integration test
- `test-maps.html` - Google Maps test
- `test-*.png` - Test images (2 files)
- `dist/test-spotify.html` - Build artifact
- **Action**: Remove development test files, keep `src/test/test-utils.jsx` (legitimate test utility)

#### 📋 Log Files
- `api.log` (826 bytes)
- `build.log` (1.88KB)
- `logs/dev.log`
- `dist/sw-build.log`
- **Action**: Remove log files, add to `.gitignore`

#### 🍎 System Files
- `Icones/.DS_Store` - macOS system file
- **Action**: Remove and add to `.gitignore`

#### 📝 Potentially Outdated Documentation
- `BORDAS_CARDS_CORRECOES.md` - Specific corrections (Portuguese)
- `GOOGLE_REVIEWS_WIDGET_FIXES.md` - Specific fixes
- `PODCAST_SIMPLIFICATION_COMPLETE.md` - Completed task
- `MIGRATION_SUCCESS.md` - Completed migration
- `nginx-consolidation-summary.md` - Completed task
- **Action**: Move to `docs/archive/` folder for history

#### 🔧 Development Scripts (Review)
- `debug-recaptcha.sh` - Debug script (keep, useful for debugging)
- `migrate-to-workbox.sh` - Migration script (archive)
- `rollback.sh` - Rollback utility (keep)
- Multiple deployment scripts - consolidate if possible

### 🧹 Code Cleanup Opportunities

#### Console Statements
- Found 10 console statements in `src/utils/healthcareSessionManager.js`
- **Action**: Replace with proper logging utility or remove in production

#### Unused Components (Identified)
- `src/components/DesignSystemDemo.jsx` - Demo component
- `src/components/SpotifyEmbed.jsx` - Spotify functionality
- `src/hooks/useBackgroundAudio.js` - Audio hooks
- **Action**: Verify usage before removal

## 🚀 Cleanup Execution Plan

### Phase 1: Safe Cleanup (Low Risk)
1. Remove duplicate documentation
2. Remove test files and logs  
3. Remove system files (.DS_Store)
4. Add items to `.gitignore`

### Phase 2: Code Optimization (Medium Risk)
1. Remove/replace console statements
2. Clean up unused imports
3. Archive completed task documentation

### Phase 3: Component Cleanup (High Risk)
1. Verify component usage with grep
2. Remove truly unused components
3. Update imports if needed

## 🎯 Expected Benefits
- **Reduced repo size**: ~50-100MB reduction
- **Cleaner documentation**: Organized, no duplicates
- **Improved developer experience**: Less clutter
- **Better performance**: Fewer files to process
- **Enhanced security**: No log files with sensitive data

## ⚠️ Safety Measures
- Backup before cleanup
- Test after each phase
- Verify component usage before removal
- Keep rollback capability

---

*Ready to execute cleanup phases. Each phase will be done incrementally with validation.*