# Suggested Commands - Saraiva Vision Site

## Development Commands
```bash
# Start development server
npm run dev                    # Vite dev server on port 3002

# Preview production build
npm run preview               # Preview built site locally
```

## Build Commands
```bash
# Build for production
npm run build                 # Standard Vite build to dist/
npm run build:vercel         # Same as build, for Vercel
npm run build:static         # Build in static mode
```

## Vercel Deployment Commands
```bash
# Simple deployment (recommended)
npm run deploy:simple        # Direct deployment with auto-confirmation

# Intelligent deployment (with error recovery)
npm run deploy:intelligent   # Multi-strategy deployment with fallback

# Configuration management
npm run deploy:config list              # List available configurations
npm run deploy:config apply <name>      # Apply specific configuration
npm run deploy:config test <name>       # Test configuration
npm run deploy:config backup            # Backup current config
npm run deploy:config restore           # Restore from backup

# Specific deployment strategies
npm run deploy:production               # Deploy with Node.js 18.x
npm run deploy:edge                     # Deploy with Edge Runtime
npm run deploy:node20                   # Deploy with Node.js 20.x
npm run deploy:static                   # Deploy as static site

# Manual Vercel commands
npx vercel login                        # Login to Vercel
npx vercel --prod                       # Deploy to production
npx vercel dev --listen 3000           # Local Vercel development
npx vercel pull --yes --environment=production  # Pull environment variables
```

## Health Checks
```bash
# Deployment health checks
node scripts/vercel-health-check.js full   # Comprehensive health check
node scripts/vercel-health-check.js quick  # Quick check (CLI + Auth + Build)
```

## Git Commands
```bash
# Standard git workflow
git status                    # Check repository status
git add .                     # Stage all changes
git commit -m "message"       # Commit changes
git push origin main          # Push to main branch
```

## Task Completion Commands
After completing any development task, run:
```bash
npm run build                 # Verify build works
# No lint/test commands configured in this project
```