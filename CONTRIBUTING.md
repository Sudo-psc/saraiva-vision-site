# Contributing to Saraiva Vision

Thank you for your interest in contributing to Saraiva Vision! This document provides guidelines for contributing to the project.

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Commit Guidelines](#commit-guidelines)
4. [Pull Request Process](#pull-request-process)
5. [Code Standards](#code-standards)
6. [Testing](#testing)

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/saraiva-vision-site.git
   cd saraiva-vision-site
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a feature branch**:
   ```bash
   git checkout -b feat/your-feature-name
   ```

## Development Workflow

### Running the Development Server

```bash
npm run dev:vite
```

The site will be available at `http://localhost:3002`

### Building for Production

```bash
npm run build:vite
```

### Running Tests

```bash
# Run all tests
npm run test:run

# Run with coverage
npm run test:coverage

# Run specific test suites
npm run test:api
npm run test:frontend
```

### Linting

```bash
npm run lint
```

## Commit Guidelines

**This project uses [Conventional Commits](https://www.conventionalcommits.org/)**

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Commit Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system or dependencies
- `ci`: CI/CD changes
- `chore`: Other changes

### Examples

```bash
# Simple feature
git commit -m "feat: add appointment scheduling"

# Bug fix with scope
git commit -m "fix(blog): resolve image loading issue"

# Feature with description
git commit -m "feat(analytics): integrate GA4

Add tracking for page views and user interactions.

Closes #42"

# Breaking change
git commit -m "feat!: change API endpoint structure

BREAKING CHANGE: Contact form API endpoint changed from
/api/contact to /api/v2/contact."
```

### Commit Message Validation

Your commits will be automatically validated using commitlint. If a commit doesn't follow the conventional format, it will be rejected.

For detailed information, see [Conventional Commits Guide](docs/CONVENTIONAL_COMMITS_GUIDE.md).

## Pull Request Process

1. **Update documentation** if you've made changes that affect it
2. **Add tests** for new features or bug fixes
3. **Ensure all tests pass**: `npm run test:run`
4. **Ensure code is linted**: `npm run lint`
5. **Update CHANGELOG.md** (if not using conventional commits automation)
6. **Create a Pull Request** with:
   - Clear title following conventional commit format
   - Description of changes
   - Link to related issues
   - Screenshots (if UI changes)

### PR Title Format

Use the same conventional commit format for PR titles:

```
feat(scope): add new feature
fix(scope): resolve bug
docs: update documentation
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented if yes)

## Related Issues
Closes #123
```

## Code Standards

### JavaScript/React

- Use **ES6+ syntax**
- Follow **Airbnb style guide**
- Use **functional components** with hooks
- Prefer **const** over let, avoid var
- Use **meaningful variable names**
- Write **self-documenting code** (minimal comments)

### Styling

- Use **Tailwind CSS** utilities only
- No inline styles or CSS modules
- Follow existing component patterns
- Ensure **WCAG 2.1 AA accessibility**

### File Organization

```
src/
├── components/     # React components (PascalCase.jsx)
├── hooks/         # Custom hooks (use*.js)
├── utils/         # Utility functions (camelCase.js)
├── data/          # Static data
└── pages/         # Route components
```

### Naming Conventions

- **Components**: PascalCase (e.g., `ContactForm.jsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useAnalytics.js`)
- **Utils**: camelCase (e.g., `formatDate.js`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)

## Testing

### Test Structure

- Place tests in `__tests__/` directories
- Name test files: `Component.test.jsx` or `function.test.js`
- Use descriptive test names
- Follow AAA pattern: Arrange, Act, Assert

### Test Coverage

- Maintain **80%+ coverage** for critical paths
- Test edge cases and error scenarios
- Mock external dependencies
- Avoid testing implementation details

### Example Test

```javascript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ContactForm from '../ContactForm';

describe('ContactForm', () => {
  it('renders all required fields', () => {
    render(<ContactForm />);
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });
});
```

## Medical Compliance

This is a medical platform subject to CFM and LGPD regulations:

- **Never** include fake medical information
- **Always** include appropriate disclaimers
- **Ensure** patient data privacy
- **Follow** medical advertising guidelines
- **Validate** all medical content with licensed professionals

## Code Review Process

1. Pull requests require review before merging
2. Address all review comments
3. Keep PRs focused and reasonably sized
4. Be responsive to feedback
5. Be respectful and constructive

## Getting Help

- Check [documentation](docs/)
- Review existing issues on GitHub
- Ask questions in pull request comments
- Contact maintainers if needed

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Project documentation
- Release notes

Thank you for contributing to Saraiva Vision! 🎉
