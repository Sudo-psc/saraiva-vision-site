# TestSprite MCP Setup Guide

## Overview

TestSprite is an AI-powered testing tool integrated via Model Context Protocol (MCP) that provides automated test generation and execution capabilities.

## Configuration

### Current Setup

**Status**: ✅ Configured (requires Claude Code restart)

**Package**: `@testsprite/testsprite-mcp@1.0.0`

**Configuration Location**: `/root/.claude.json`

### MCP Server Configuration

```json
{
  "TestSprite": {
    "type": "stdio",
    "command": "npx",
    "args": [
      "@testsprite/testsprite-mcp@latest",
      "server"
    ],
    "env": {
      "API_KEY": "sk-user-BUJnzLXk2tr1yasWUvQyWq_XPR1jpw72o0AbLpVuLo9hio5bx6nI5wKfp2AX0n3iO1ZACCMZq6jIZNuiqBKfu2cfPgYtlbCBOmo77J2_lt3MKu9ii0w1HV9gfE0mD6NjLSw"
    }
  }
}
```

## Troubleshooting History

### Issue: MCP Tools Not Available

**Date**: 2025-10-25

**Problem**: TestSprite MCP server showed as "connected" in health checks but tools were not available.

**Root Cause**: Missing `server` subcommand in configuration.

**Solution Applied**:
1. Removed existing TestSprite MCP configuration
2. Re-added with proper `server` subcommand
3. Verified package availability (`npx @testsprite/testsprite-mcp@latest --version`)

**Commands Used**:
```bash
# Remove old configuration
claude mcp remove TestSprite

# Add with correct configuration
claude mcp add TestSprite \
  --env API_KEY=sk-user-BUJnzLXk2tr1yasWUvQyWq_XPR1jpw72o0AbLpVuLo9hio5bx6nI5wKfp2AX0n3iO1ZACCMZq6jIZNuiqBKfu2cfPgYtlbCBOmo77J2_lt3MKu9ii0w1HV9gfE0mD6NjLSw \
  -- npx @testsprite/testsprite-mcp@latest server
```

## Required Next Steps

### ⚠️ Claude Code Restart Required

To activate the TestSprite MCP server with the updated configuration:

1. **Exit Claude Code** completely
2. **Restart Claude Code** in the project directory
3. **Verify connection** with:
   ```bash
   claude mcp list | grep TestSprite
   ```
4. **Expected output**: `TestSprite: npx @testsprite/testsprite-mcp@latest server - ✓ Connected`

## Available TestSprite Tools

Once properly connected, the following MCP tools will be available:

### 1. `testsprite_bootstrap_tests`

Bootstrap automated tests for a project.

**Parameters**:
- `localPort`: Development server port (e.g., 3002 for Vite)
- `type`: Test type ('frontend' | 'backend')
- `projectPath`: Absolute path to project root
- `testScope`: Scope of testing ('codebase' | 'page')
- `pathname`: Optional page path for page-specific tests

**Example Usage**:
```typescript
{
  "localPort": 3002,
  "type": "frontend",
  "projectPath": "/home/saraiva-vision-site",
  "testScope": "codebase",
  "pathname": ""
}
```

### 2. `testsprite_generate_code_summary`

Generate a comprehensive code summary for the project.

**Parameters**:
- `projectRootPath`: Absolute path to project root

**Example Usage**:
```typescript
{
  "projectRootPath": "/home/saraiva-vision-site"
}
```

## Testing Workflow

### Recommended Testing Approach

1. **Generate Code Summary**
   - Analyzes project structure and generates comprehensive overview
   - Helps TestSprite understand the codebase architecture

2. **Bootstrap Tests**
   - For frontend: Use port 3002 (Vite dev server)
   - For backend: Use port 3001 (API server)
   - Generates initial test scaffolding

3. **Review and Execute**
   - Review generated tests
   - Run tests with existing Vitest infrastructure
   - Iterate and refine

### Integration with Existing Tests

TestSprite complements your existing Vitest test infrastructure:

**Current Test Infrastructure**:
- `npm run test:run` - All tests
- `npm run test:unit` - Unit tests
- `npm run test:integration` - Integration tests
- `npm run test:frontend` - Frontend component tests
- `npm run test:api` - API tests
- `npm run test:coverage` - Coverage reports

**TestSprite Added Value**:
- AI-powered test case generation
- Intelligent test planning
- Automated test scaffolding
- Coverage gap identification

## Verification Steps

After restarting Claude Code, verify TestSprite is working:

```bash
# 1. Check MCP server health
claude mcp list | grep TestSprite

# 2. Expected: ✓ Connected status

# 3. Try basic operation (from Claude Code chat):
# "Generate code summary for /home/saraiva-vision-site using TestSprite"
```

## API Key Management

**Current Key**: Stored in MCP configuration

**Security Notes**:
- API key is project-specific (in `/root/.claude.json`)
- Not committed to version control
- Rotate key if exposed

**To Update API Key**:
```bash
# Remove current configuration
claude mcp remove TestSprite

# Add with new API key
claude mcp add TestSprite \
  --env API_KEY=your-new-api-key \
  -- npx @testsprite/testsprite-mcp@latest server
```

## Common Issues

### Issue: "Not connected" error

**Symptom**: Tools return "Not connected" error

**Solutions**:
1. Restart Claude Code
2. Verify MCP configuration: `grep -A 12 '"TestSprite"' /root/.claude.json`
3. Check package installation: `npx @testsprite/testsprite-mcp@latest --version`
4. Verify API key is present in configuration

### Issue: "No such tool available"

**Symptom**: Tool not found when invoking TestSprite functions

**Solutions**:
1. MCP server not loaded - restart Claude Code
2. Check MCP health: `claude mcp list`
3. Verify configuration includes `server` subcommand

### Issue: Package not found

**Symptom**: `npx` cannot find `@testsprite/testsprite-mcp`

**Solutions**:
```bash
# Clear npx cache
rm -rf ~/.npm/_npx

# Try manual installation
npm install -g @testsprite/testsprite-mcp

# Verify installation
npx @testsprite/testsprite-mcp@latest --version
```

## Documentation Updates

**Last Updated**: 2025-10-25

**Updated By**: Claude Code (Dr. Philipe Saraiva Cruz)

**Changes**:
- Initial setup and configuration
- Troubleshooting connection issues
- Added server subcommand to MCP configuration
- Documented restart requirement

## Related Documentation

- **Main Testing Guide**: `/docs/testing/TESTING_GUIDE.md` (to be created)
- **Vitest Configuration**: `/vitest.config.js`
- **Test Scripts**: `/package.json` (test:* scripts)
- **Claude Configuration**: `/root/.claude.json`

## Support

For TestSprite-specific issues:
- Documentation: https://testsprite.com/docs
- Package: https://www.npmjs.com/package/@testsprite/testsprite-mcp

For project-specific testing questions:
- Project Lead: Dr. Philipe Saraiva Cruz
- Repository: [Project repository]
