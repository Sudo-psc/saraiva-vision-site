# Coding Standards

## File Naming
- **Components**: PascalCase (`ContactForm.jsx`)
- **Utils/Hooks**: camelCase (`useAuth.js`)
- **Constants**: UPPER_SNAKE_CASE
- **Tests**: Co-located `__tests__/` or `.test.jsx`

## Import Organization
1. React imports
2. External libraries
3. Internal modules (use `@/` alias)
4. Styles

## TypeScript
- Partial strict mode (`strict: false` for compatibility)
- Path aliases: `@/` → `src/`
- DB types in `src/lib/supabase.ts`

## React Patterns
- Prefer composition over inheritance
- Use React.memo for expensive renders
- Custom hooks for shared logic
- Error boundaries for crash protection

## API Structure
- Dual: `api/` (legacy) + `api/src/` (modern ES modules)
- Validation: Zod schemas
- Security: Rate limiting, CORS middleware
- Separate linting: `npm run validate:api`