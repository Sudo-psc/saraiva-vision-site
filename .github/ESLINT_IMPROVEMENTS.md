# ESLint Configuration Improvements

To improve the ESLint configuration for the GitHub Copilot instructions, I recommend the following updates:

## 1. Create .eslintignore file

```
# Build artifacts
dist/
build/
node_modules/

# Generated files
*.min.js
*.bundle.js

# Test coverage
coverage/

# Temporary files
.tmp/
.temp/

# OS files
.DS_Store
Thumbs.db
```

## 2. Update .eslintrc.json for ESM compatibility

```json
{
  "extends": ["react-app"],
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module"
  },
  "env": {
    "browser": true,
    "es2022": true,
    "node": true
  },
  "globals": {
    "gtag": "readonly",
    "dataLayer": "readonly",
    "chrome": "readonly",
    "globalThis": "readonly"
  },
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  },
  "overrides": [
    {
      "files": ["**/*.test.js", "**/*.test.jsx", "**/debug-*.js", "**/tools/**/*.js"],
      "rules": {
        "no-console": "off",
        "no-unused-vars": "off"
      }
    }
  ]
}
```

## 3. Package.json script updates

Add these scripts for better development workflow:

```json
{
  "scripts": {
    "lint": "eslint src --ext .js,.jsx --max-warnings 10",
    "lint:fix": "eslint src --ext .js,.jsx --fix",
    "lint:ci": "eslint src --ext .js,.jsx --max-warnings 0"
  }
}
```

These configurations will ensure GitHub Copilot suggestions align with the project's code quality standards while avoiding common ESM and browser API issues.