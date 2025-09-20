# Vercel Intelligent Deployment System

## Overview

This project includes an intelligent Vercel deployment system designed to handle runtime errors and provide multiple deployment strategies with automatic error recovery.

## Features

### 🚀 **Intelligent Deployment Strategies**
- **Multiple Runtime Support**: Node.js 16.x, 18.x, 20.x, Edge Runtime
- **Automatic Fallback**: Switches between configurations when errors occur
- **Retry Mechanism**: Up to 3 retries with exponential backoff
- **Static Fallback**: Falls back to static deployment if all function strategies fail

### 🛠️ **Configuration Management**
- **Multiple Environments**: Production, Development, Edge, Node.js 20, Static
- **Dynamic Configuration**: Apply different runtime configurations on demand
- **Backup & Restore**: Automatic backup and restore of configurations
- **Validation**: Built-in configuration validation and testing

### 🔍 **Health Monitoring**
- **Pre-deployment Checks**: Validates environment before deployment
- **Build Testing**: Tests multiple build configurations
- **Dependency Verification**: Ensures all dependencies are properly installed
- **Authentication Status**: Checks Vercel CLI authentication

## Scripts

### Deployment Commands

```bash
# Intelligent deployment with automatic error recovery
npm run deploy:intelligent

# Configuration management
npm run deploy:config list              # List all configurations
npm run deploy:config apply <name>       # Apply specific configuration
npm run deploy:config test <name>        # Test configuration
npm run deploy:config backup             # Backup current config
npm run deploy:config restore            # Restore from backup

# Specific deployment strategies
npm run deploy:production               # Deploy with Node.js 18.x
npm run deploy:edge                     # Deploy with Edge Runtime
npm run deploy:node20                   # Deploy with Node.js 20.x
npm run deploy:static                   # Deploy as static site

# Health checks
node scripts/vercel-health-check.js full   # Comprehensive health check
node scripts/vercel-health-check.js quick  # Quick check (CLI + Auth + Build)
```

### Available Configurations

| Configuration | Runtime | Description | Use Case |
|---------------|---------|-------------|----------|
| `production` | `@vercel/node@18.x` | Production environment | Default production deployment |
| `development` | `@vercel/node@18.x` | Development environment | Development/testing |
| `edge` | `@vercel/edge` | Edge Runtime | Lightweight functions |
| `node20` | `@vercel/node@20.x` | Node.js 20.x | Latest Node.js version |
| `static` | None | Static only | No serverless functions |
| `minimal` | `@vercel/node@18.x` | Minimal functions | Only essential functions |

## How It Works

### 1. Intelligent Deployment Process

The `deploy:intelligent` script follows this process:

1. **Backup Current Configuration**: Creates backup of existing `vercel.json`
2. **Build Validation**: Tests multiple build configurations
3. **Deployment Attempts**: Tries different strategies in this order:
   - Standard deployment with different runtime versions
   - Force deployment with cache bypass
   - Debug deployment with verbose logs
4. **Automatic Retry**: Up to 3 attempts for each strategy
5. **Fallback to Static**: If all function strategies fail

### 2. Error Recovery Mechanisms

- **Runtime Version Fallback**: Tries Node.js 18.x → 20.x → 16.x → Edge
- **Strategy Rotation**: Standard → Force → Debug deployment methods
- **Static Deployment**: Final fallback when functions fail
- **Configuration Restore**: Restores original config on failure

### 3. Health Check System

The health check performs these validations:

- **Vercel CLI**: Installation and version check
- **Authentication**: Vercel login status
- **Git Status**: Repository cleanliness
- **Dependencies**: Package installation status
- **Configuration**: `vercel.json` validation
- **Local Build**: Build capability test
- **Deployment History**: Recent commit analysis

## Usage Examples

### Basic Usage

```bash
# Check deployment health
node scripts/vercel-health-check.js quick

# Deploy with intelligent error handling
npm run deploy:intelligent

# List available configurations
npm run deploy:config list
```

### Advanced Usage

```bash
# Test a specific configuration
npm run deploy:config test node20

# Apply edge runtime configuration
npm run deploy:config apply edge

# Deploy with specific configuration
npm run deploy:edge

# Create custom configuration
node scripts/vercel-config-manager.js create custom-optimization
```

### Manual Configuration Management

```bash
# Backup current configuration
npm run deploy:config backup

# Apply different runtime
npm run deploy:config apply node20

# Test if configuration works
npm run deploy:config test node20

# Restore if needed
npm run deploy:config restore
```

## Troubleshooting

### Common Issues

1. **Runtime Error**: "Function Runtimes must have a valid version"
   - Solution: Use `npm run deploy:intelligent` to auto-fix

2. **Authentication Failed**: "No existing credentials found"
   - Solution: Run `vercel login` first

3. **Build Failures**: Local build issues
   - Solution: Check health check with `node scripts/vercel-health-check.js full`

4. **Configuration Errors**: Invalid vercel.json
   - Solution: Use configuration manager to apply valid config

### Error Recovery Flow

```
Deployment Error
    ↓
Try Next Runtime Version (18.x → 20.x → 16.x → Edge)
    ↓
Try Next Strategy (Standard → Force → Debug)
    ↓
Retry (up to 3 times)
    ↓
Fallback to Static Deployment
    ↓
Manual Intervention Required
```

## Architecture

### Script Structure

```
scripts/
├── vercel-intelligent-deploy.js    # Main deployment orchestrator
├── vercel-config-manager.js        # Configuration management
├── vercel-health-check.js          # Health monitoring
└── .vercel-configs/                # Configuration storage
```

### Key Components

- **VercelIntelligentDeployer**: Main deployment class with retry logic
- **VercelConfigManager**: Configuration management and validation
- **VercelHealthCheck**: Pre-deployment health monitoring
- **Configuration Store**: `.vercel-configs/` directory for custom configs

## Best Practices

1. **Before Deployment**: Always run health check first
2. **Configuration Testing**: Test new configurations before deployment
3. **Backup Strategy**: Use backup/restore for experimental configurations
4. **Monitor Logs**: Watch deployment logs for debugging information
5. **Version Strategy**: Start with Node.js 18.x, try others if needed

## Integration with CI/CD

The deployment system can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Health Check
  run: node scripts/vercel-health-check.js quick

- name: Intelligent Deploy
  run: npm run deploy:intelligent
  if: success()
```

## Future Enhancements

- **Automatic Rollback**: Rollback to previous successful deployment
- **Performance Monitoring**: Track deployment performance metrics
- **Configuration Templates**: Pre-built templates for common scenarios
- **Multi-environment Support**: Enhanced staging/production workflows
- **Notification System**: Deployment success/failure notifications

## Support

For issues or questions:
1. Check health check results
2. Review deployment logs
3. Try different configurations
4. Consult Vercel documentation
5. Review script logs in `scripts/` directory