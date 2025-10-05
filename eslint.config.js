import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    ignores: [
      'dist/**',
      'build/**',
      'coverage/**',
      'node_modules/**',
      'public/**',
      'generated/**',
      'vercel-outbox.json',
      '.vercel/**',
      '.next/**',
      '.next-local-deploy/**',
      'api/**',
      'scripts/**',
      'src/__tests__/**',
      'src/test/**',
      'src/sw.workbox.js',
    ],
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: false,
    },
  },
  js.configs.recommended,
  // Node.js script files (.cjs and .mjs)
  {
    files: ['**/*.{cjs,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      'no-empty': 'off',
      'no-useless-catch': 'off',
      'no-case-declarations': 'off',
      'no-async-promise-executor': 'off',
      'no-control-regex': 'off',
      'no-useless-escape': 'off',
    },
  },
  // React/TypeScript files
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: false,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      'no-empty': 'off',
      'no-useless-catch': 'off',
      'no-case-declarations': 'off',
      'no-async-promise-executor': 'off',
      'no-control-regex': 'off',
      'no-useless-escape': 'off',
    },
  },
];
