# Testing Guide - Saraiva Vision

Guia completo de testes para o projeto Saraiva Vision.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Configuração de Testes](#configuração-de-testes)
- [Tipos de Testes](#tipos-de-testes)
- [Executando Testes](#executando-testes)
- [Escrevendo Testes](#escrevendo-testes)
- [Boas Práticas](#boas-práticas)
- [Cobertura de Código](#cobertura-de-código)
- [CI/CD Integration](#cicd-integration)

---

## Visão Geral

O projeto utiliza uma stack moderna de testes com foco em qualidade e manutenibilidade:

- **Vitest**: Framework de testes rápido e compatível com Vite
- **React Testing Library**: Testes centrados no usuário
- **jsdom**: Simulação do DOM para ambiente Node.js
- **@testing-library/jest-dom**: Matchers customizados para DOM

### Filosofia de Testes

- **User-Centric**: Testes focam no comportamento do usuário
- **Confidence**: Proporcionam confiança nas mudanças de código  
- **Maintainable**: Fáceis de manter e entender
- **Fast**: Execução rápida para feedback imediato

---

## Configuração de Testes

### Estrutura de Arquivos

```
src/
├── components/
│   ├── Hero.jsx
│   ├── Navbar.jsx
│   └── __tests__/
│       ├── Hero.test.jsx
│       ├── Navbar.test.jsx
│       └── Button.test.jsx
├── utils/
│   ├── utils.js
│   └── __tests__/
│       └── utils.test.js
├── test/
│   └── setup.js           # Configuração global de testes
├── vitest.config.js       # Configuração do Vitest
└── package.json           # Scripts de teste
```

### Configuração do Vitest

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    globals: true,
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.config.js',
        '**/*.d.ts',
        'src/test/',
        'vevn/'
      ]
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})
```

### Setup Global

```javascript
// src/test/setup.js
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// Global mocks
vi.mock('@/lib/clinicInfo', () => ({
  clinicInfo: {
    name: 'Test Clinic',
    phone: '(11) 99999-9999',
    email: 'test@clinic.com',
    onlineSchedulingUrl: 'https://schedule.test.com'
  }
}))

// Mock browser APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
```

---

## Tipos de Testes

### 1. Testes Unitários

Testam componentes e funções individualmente.

```javascript
// src/utils/__tests__/utils.test.js
import { describe, it, expect } from 'vitest'
import { cn, formatDate, validateEmail } from '../utils'

describe('Utility Functions', () => {
  describe('cn (className utility)', () => {
    it('combines multiple class names', () => {
      const result = cn('class1', 'class2', 'class3')
      expect(result).toBe('class1 class2 class3')
    })

    it('filters out falsy values', () => {
      const result = cn('class1', null, 'class2', undefined, 'class3')
      expect(result).toBe('class1 class2 class3')
    })
  })

  describe('validateEmail', () => {
    it('validates correct email addresses', () => {
      expect(validateEmail('user@example.com')).toBe(true)
      expect(validateEmail('test.email+tag@domain.co.uk')).toBe(true)
    })

    it('rejects invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('user@')).toBe(false)
      expect(validateEmail('@domain.com')).toBe(false)
    })
  })
})
```

### 2. Testes de Componentes

Testam comportamento e renderização de componentes React.

```javascript
// src/components/__tests__/Button.test.jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Button } from '../ui/button'

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center')
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies variant styles correctly', () => {
    const { rerender } = render(<Button variant="secondary">Secondary</Button>)
    
    let button = screen.getByRole('button')
    expect(button).toHaveClass('bg-slate-100', 'text-slate-700')
    
    rerender(<Button variant="destructive">Destructive</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('bg-destructive', 'text-destructive-foreground')
  })
})
```

### 3. Testes de Integração

Testam interação entre múltiplos componentes.

```javascript
// src/components/__tests__/Hero.test.jsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import Hero from '../Hero'

// Mock dependencies
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => mockTranslations[key] || key,
    i18n: { language: 'pt' }
  }),
  Trans: ({ children, i18nKey }) => children || mockTranslations[i18nKey]
}))

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Hero Component', () => {
  it('displays main heading and subtitle', () => {
    renderWithRouter(<Hero />)
    
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Cuidando da sua visão com excelência')
    
    const subtitle = screen.getByText(/Na Saraiva Vision, combinamos tecnologia/i)
    expect(subtitle).toBeInTheDocument()
  })

  it('includes call-to-action buttons', () => {
    renderWithRouter(<Hero />)
    
    const scheduleButton = screen.getByText(/Agendar Consulta/i)
    const servicesButton = screen.getByText(/Nossos Serviços/i)
    
    expect(scheduleButton).toBeInTheDocument()
    expect(servicesButton).toBeInTheDocument()
  })
})
```

---

## Executando Testes

### Scripts Disponíveis

```bash
# Executar todos os testes em modo watch
npm run test

# Executar testes uma vez
npm run test:run

# Executar testes com interface gráfica
npm run test:ui

# Gerar relatório de cobertura
npm run test:coverage
```

### Opções de Execução

```bash
# Executar testes específicos
npm run test Button

# Executar testes em modo watch para arquivo específico
npm run test Hero.test.jsx

# Executar testes com debug
npm run test -- --reporter=verbose

# Executar testes em paralelo
npm run test -- --threads
```

### Filtros e Seleção

```bash
# Executar apenas testes que fazem match com padrão
vitest run --grep "Button Component"

# Executar testes que não fazem match
vitest run --grep "Button Component" --invert

# Executar testes de arquivo específico
vitest run src/components/__tests__/Button.test.jsx
```

---

## Escrevendo Testes

### Estrutura de Teste

```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import userEvent from '@testing-library/user-event'

describe('Component Name', () => {
  // Setup comum para todos os testes
  beforeEach(() => {
    // Configuração antes de cada teste
  })

  afterEach(() => {
    // Limpeza após cada teste
    vi.clearAllMocks()
  })

  it('should describe what the test does', () => {
    // Arrange - Preparar
    const props = { /* props do componente */ }
    
    // Act - Executar
    render(<Component {...props} />)
    
    // Assert - Verificar
    expect(screen.getByText('Expected text')).toBeInTheDocument()
  })
})
```

### Queries Recomendadas

```javascript
// Por ordem de prioridade (mais acessível primeiro)

// 1. Por role (mais acessível)
screen.getByRole('button', { name: /submit/i })
screen.getByRole('heading', { level: 1 })

// 2. Por label
screen.getByLabelText(/email/i)

// 3. Por placeholder
screen.getByPlaceholderText(/enter your email/i)

// 4. Por text content
screen.getByText(/welcome message/i)

// 5. Por display value (para inputs)
screen.getByDisplayValue('John Doe')

// 6. Por alt text (para imagens)
screen.getByAltText(/profile picture/i)

// 7. Por title
screen.getByTitle(/tooltip text/i)

// 8. Por test ID (último recurso)
screen.getByTestId('custom-element')
```

### Mocking Strategies

```javascript
// Mock de módulos
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'pt' }
  })
}))

// Mock de funções
const mockOnClick = vi.fn()

// Mock de hooks customizados
vi.mock('@/hooks/useWhatsApp', () => ({
  useWhatsApp: () => ({
    generateWhatsAppUrl: vi.fn(() => 'https://wa.me/123'),
    openFloatingCTA: vi.fn() // abre CTAModal (evento `open-cta-modal`)
  })
}))

// Mock de APIs
vi.mock('@/lib/api', () => ({
  fetchReviews: vi.fn(() => Promise.resolve(mockReviews))
}))
```

### Testando Interações do Usuário

```javascript
import userEvent from '@testing-library/user-event'

it('handles user interactions', async () => {
  const user = userEvent.setup()
  render(<ContactForm />)
  
  // Typing
  await user.type(screen.getByLabelText(/email/i), 'test@example.com')
  
  // Clicking
  await user.click(screen.getByRole('button', { name: /submit/i }))
  
  // Keyboard navigation
  await user.keyboard('{Tab}')
  await user.keyboard('{Enter}')
  
  // Verificar resultados
  await waitFor(() => {
    expect(screen.getByText(/success/i)).toBeInTheDocument()
  })
})
```

### Testando Estados Assíncronos

```javascript
import { waitFor, waitForElementToBeRemoved } from '@testing-library/react'

it('handles loading states', async () => {
  render(<AsyncComponent />)
  
  // Verificar estado de loading
  expect(screen.getByText(/loading/i)).toBeInTheDocument()
  
  // Aguardar carregamento completar
  await waitFor(() => {
    expect(screen.getByText(/data loaded/i)).toBeInTheDocument()
  })
  
  // Verificar que loading foi removido
  await waitForElementToBeRemoved(screen.queryByText(/loading/i))
})
```

---

## Boas Práticas

### 1. AAA Pattern (Arrange, Act, Assert)

```javascript
it('should calculate total price correctly', () => {
  // Arrange - Preparar dados e estado
  const items = [
    { price: 10, quantity: 2 },
    { price: 15, quantity: 1 }
  ]
  
  // Act - Executar a ação
  const total = calculateTotal(items)
  
  // Assert - Verificar o resultado
  expect(total).toBe(35)
})
```

### 2. Testes Determinísticos

```javascript
// ❌ Evitar - Teste não determinístico
it('generates random ID', () => {
  expect(generateId()).toBe('abc123') // Pode falhar
})

// ✅ Preferir - Teste determinístico
it('generates ID with correct format', () => {
  const id = generateId()
  expect(id).toMatch(/^[a-z0-9]{6}$/)
})
```

### 3. Nomes Descritivos

```javascript
// ❌ Evitar - Nome vago
it('works correctly', () => { })

// ✅ Preferir - Nome específico
it('should display error message when email is invalid', () => { })
```

### 4. Um Conceito Por Teste

```javascript
// ❌ Evitar - Teste muito abrangente
it('handles form submission', () => {
  // Testa validação
  // Testa loading
  // Testa success
  // Testa error
})

// ✅ Preferir - Testes específicos
it('validates email format before submission', () => { })
it('shows loading state during submission', () => { })
it('displays success message after successful submission', () => { })
it('shows error message when submission fails', () => { })
```

### 5. Evitar Dependências Entre Testes

```javascript
// ❌ Evitar - Testes dependentes
let sharedState = {}

it('creates user', () => {
  sharedState.user = createUser()
  expect(sharedState.user).toBeDefined()
})

it('updates user', () => {
  updateUser(sharedState.user) // Depende do teste anterior
})

// ✅ Preferir - Testes independentes
it('creates user', () => {
  const user = createUser()
  expect(user).toBeDefined()
})

it('updates user', () => {
  const user = createUser() // Cada teste configura seu próprio estado
  updateUser(user)
})
```

---

## Cobertura de Código

### Métricas de Cobertura

- **Statements**: Linhas de código executadas
- **Branches**: Caminhos condicionais testados  
- **Functions**: Funções executadas
- **Lines**: Linhas de código cobertas

### Relatórios

```bash
# Gerar relatório de cobertura
npm run test:coverage

# Relatórios gerados:
# - coverage/index.html (visual)
# - coverage/coverage-final.json (dados)
# - Terminal output (resumo)
```

### Metas de Cobertura

| Métrica | Meta Mínima | Meta Ideal |
|---------|-------------|------------|
| Statements | 80% | 90%+ |
| Branches | 70% | 85%+ |
| Functions | 80% | 90%+ |
| Lines | 80% | 90%+ |

### Configuração de Thresholds

```javascript
// vitest.config.js
export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        global: {
          statements: 80,
          branches: 70,
          functions: 80,
          lines: 80
        }
      }
    }
  }
})
```

---

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test:run
    
    - name: Generate coverage
      run: npm run test:coverage
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/coverage-final.json
```

### Pre-commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:run",
      "pre-push": "npm run test:coverage"
    }
  }
}
```

### Quality Gates

- **100% dos testes** devem passar
- **Cobertura mínima** de 80% em todas as métricas
- **Zero vulnerabilidades** de segurança
- **Lint sem erros** em todo o código

---

## Debugging Testes

### Debug no VS Code

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Vitest",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
      "args": ["run", "--threads", "false"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Debugging Tips

```javascript
// Debugger no código
it('debugs test', () => {
  debugger; // Para quando devtools estão abertos
  
  // Ou usar console.log
  console.log(screen.debug()); // Mostra HTML atual
  
  // Ou screen.logTestingPlaygroundURL()
  screen.logTestingPlaygroundURL(); // URL para Testing Playground
})

// Pause no teste específico
it.only('focuses only this test', () => {
  // Apenas este teste será executado
})

// Skip temporário
it.skip('skips this test', () => {
  // Este teste será ignorado
})
```

---

## Ferramentas Auxiliares

### Testing Playground

Ferramenta online para gerar queries: https://testing-playground.com/

### React DevTools

Extensão para browser que ajuda a debuggar componentes React durante testes.

### Vitest UI

Interface gráfica para visualizar e debuggar testes:

```bash
npm run test:ui
```

---

Este guia fornece uma base sólida para escrever e manter testes de qualidade no projeto Saraiva Vision. Lembre-se: bons testes são um investimento na qualidade e manutenibilidade do código!
