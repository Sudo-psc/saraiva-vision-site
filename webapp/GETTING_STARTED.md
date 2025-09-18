# 🌟 Guia Completo de Início - Saraiva Vision

Guia passo-a-passo para configurar, entender e contribuir com o projeto Saraiva Vision, desde o primeiro contato até desenvolvimento avançado.

## 📝 Sobre Este Guia

Este guia é destinado a:
- **Desenvolvedores iniciantes** que nunca trabalharam com React/Vite
- **Desenvolvedores experientes** que querem entender rapidamente o projeto
- **Designers e criadores de conteúdo** que precisam entender a estrutura
- **Novos membros da equipe** que precisam de onboarding completo

## 🎯 O Que Você Vai Aprender

- [ ] Configurar ambiente de desenvolvimento completo
- [ ] Entender a arquitetura e estrutura do projeto
- [ ] Desenvolver seu primeiro componente
- [ ] Executar testes e validações
- [ ] Seguir padrões de código e design
- [ ] Fazer deploy local e contribuir

## 📋 Pré-requisitos

### Sistema Operacional
- **Windows**: 10 ou superior
- **macOS**: 10.15 ou superior
- **Linux**: Ubuntu 18.04+, Debian 10+, ou equivalente

### Software Necessário

#### 1. Node.js (Obrigatório)
```bash
# Verificar se já tem instalado
node --version  # Deve mostrar v18.x.x ou superior
npm --version   # Deve mostrar v8.x.x ou superior

# Se não tiver, baixar de: https://nodejs.org/
# Escolher versão LTS (Long Term Support)
```

#### 2. Git (Obrigatório)
```bash
# Verificar se já tem instalado
git --version  # Qualquer versão recente

# Se não tiver:
# Windows: https://git-scm.com/download/win
# macOS: brew install git (ou Xcode Command Line Tools)
# Ubuntu/Debian: sudo apt install git
```

#### 3. Editor de Código (Recomendado)
- **VS Code** (recomendado): https://code.visualstudio.com/
- **WebStorm**: https://www.jetbrains.com/webstorm/
- **Sublime Text**: https://www.sublimetext.com/

#### 4. Browser Moderno
- Chrome, Firefox, Safari ou Edge (versões recentes)

## 🚀 Configuração Inicial (Passo a Passo)

### Etapa 1: Clonar o Repositório
```bash
# 1. Abrir terminal/prompt de comando
# 2. Navegar para pasta onde quer o projeto
cd ~/Projetos  # ou C:\Projetos no Windows

# 3. Clonar o repositório
git clone https://github.com/Sudo-psc/saraiva-vision-site.git

# 4. Entrar na pasta do projeto
cd saraiva-vision-site

# 5. Verificar se está na pasta correta
ls -la  # ou dir no Windows
# Deve mostrar arquivos como package.json, README.md, etc.
```

### Etapa 2: Instalar Dependências
```bash
# Instalar todas as dependências do projeto
npm install --legacy-peer-deps

# Aguardar instalação (pode levar 2-5 minutos)
# Deve aparecer algo como "added 1331 packages"
```

### Etapa 3: Configurar Variáveis de Ambiente
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar arquivo .env (opcional para desenvolvimento)
# No VS Code: code .env
# Outros editores: abrir o arquivo .env na pasta do projeto
```

### Etapa 4: Iniciar Servidor de Desenvolvimento
```bash
# Iniciar o servidor
npm run dev

# Aguardar mensagem similar a:
#   Local:   http://localhost:5173/
#   Network: use --host to expose
```

### Etapa 5: Verificar Funcionamento
1. Abrir browser em [http://localhost:5173](http://localhost:5173)
2. Deve aparecer a página inicial da Saraiva Vision
3. Console do browser deve estar sem erros (F12 → Console)

### ✅ Checkpoint: Setup Básico
Se chegou até aqui e o site carrega sem erros, parabéns! Você tem o ambiente funcionando.

## 📁 Entendendo a Estrutura do Projeto

```
saraiva-vision-site/
├── 📄 package.json          # Dependências e scripts do projeto
├── 📄 vite.config.js        # Configuração do build/dev server
├── 📄 tailwind.config.js    # Configuração do Tailwind CSS
├── 📄 .env                  # Variáveis de ambiente (você criou)
├── 📄 README.md             # Documentação principal
│
├── 📁 public/               # Arquivos estáticos (imagens, robots.txt)
│   ├── img/                 # Imagens do site
│   ├── favicon.ico          # Ícone do site
│   └── manifest.json        # Configuração PWA
│
├── 📁 src/                  # Código fonte principal
│   ├── 📄 main.jsx          # Ponto de entrada da aplicação
│   ├── 📄 App.jsx           # Componente principal e rotas
│   ├── 📄 index.css         # Estilos globais
│   │
│   ├── 📁 components/       # Componentes React reutilizáveis
│   │   ├── Hero.jsx         # Seção principal da home
│   │   ├── Navbar.jsx       # Menu de navegação
│   │   ├── Footer.jsx       # Rodapé
│   │   ├── ui/              # Componentes base (Button, Toast, etc.)
│   │   └── __tests__/       # Testes dos componentes
│   │
│   ├── 📁 pages/            # Páginas da aplicação
│   │   ├── HomePage.jsx     # Página inicial
│   │   ├── ServiceDetailPage.jsx  # Página de serviços
│   │   └── ContactPage.jsx  # Página de contato
│   │
│   ├── 📁 hooks/            # React hooks customizados
│   ├── 📁 lib/              # Configurações e utilitários
│   ├── 📁 contexts/         # Context providers (estado global)
│   ├── 📁 locales/          # Traduções (português/inglês)
│   └── 📁 utils/            # Funções auxiliares
│
├── 📁 api/                  # Funções serverless (backend)
├── 📁 docs/                 # Documentação técnica
└── 📁 tests/               # Configuração de testes
```

### 🎯 Arquivos Mais Importantes para Iniciantes

1. **`src/App.jsx`** - Define rotas e estrutura geral
2. **`src/components/Hero.jsx`** - Exemplo de componente simples
3. **`src/pages/HomePage.jsx`** - Página principal
4. **`package.json`** - Lista de dependências e scripts
5. **`tailwind.config.js`** - Cores e estilos personalizados

## 🧩 Entendendo React e o Projeto

### O Que É um Componente React?
```jsx
// Exemplo simples de componente
const MeuComponente = () => {
  return (
    <div className="p-4 bg-blue-100">
      <h2>Olá, mundo!</h2>
      <p>Este é um componente React</p>
    </div>
  );
};

export default MeuComponente;
```

### Como o Projeto Usa React
- **Componentes**: Cada parte da interface é um componente (Hero, Navbar, etc.)
- **Props**: Dados passados entre componentes
- **State**: Estado interno dos componentes (dados que mudam)
- **Hooks**: Funcionalidades especiais (`useState`, `useEffect`, etc.)

### O Que É Tailwind CSS?
```jsx
// Em vez de CSS separado, usamos classes utilitárias
<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
  Clique aqui
</button>

// px-4 = padding horizontal de 1rem
// py-2 = padding vertical de 0.5rem  
// bg-blue-500 = fundo azul
// text-white = texto branco
// rounded = bordas arredondadas
// hover:bg-blue-600 = azul mais escuro no hover
```

## 🛠️ Seu Primeiro Desenvolvimento

### Exercício 1: Criar Componente Simples
```bash
# 1. Criar arquivo para novo componente
touch src/components/MeuPrimeiroComponente.jsx

# 2. Abrir arquivo no editor
code src/components/MeuPrimeiroComponente.jsx
```

```jsx
// Conteúdo do arquivo MeuPrimeiroComponente.jsx
const MeuPrimeiroComponente = () => {
  return (
    <div className="p-6 bg-brand-blue-50 border border-brand-blue-200 rounded-lg">
      <h3 className="text-heading-md text-brand-blue-800 mb-2">
        Meu Primeiro Componente
      </h3>
      <p className="text-body-lg text-soft-gray-700">
        Este é o meu primeiro componente no projeto Saraiva Vision! 🎉
      </p>
      <button className="mt-4 px-4 py-2 bg-brand-blue-600 text-white rounded hover:bg-brand-blue-700">
        Clique aqui
      </button>
    </div>
  );
};

export default MeuPrimeiroComponente;
```

### Exercício 2: Usar o Componente
```jsx
// Abrir src/pages/HomePage.jsx
// Adicionar import no topo do arquivo:
import MeuPrimeiroComponente from '../components/MeuPrimeiroComponente';

// Adicionar o componente dentro do return, por exemplo:
return (
  <div>
    {/* ... outros componentes ... */}
    <Hero />
    <MeuPrimeiroComponente />  {/* ← Adicione esta linha */}
    <Services />
    {/* ... resto do componente ... */}
  </div>
);
```

### Exercício 3: Ver o Resultado
1. Salvar os arquivos (Ctrl+S)
2. O browser deve atualizar automaticamente
3. Deve aparecer seu componente na página inicial

### ✅ Checkpoint: Primeiro Componente
Se você conseguiu ver seu componente na página, parabéns! Você criou seu primeiro componente React.

## 🧪 Executando Testes

### Por Que Testar?
- Garantir que código funciona como esperado
- Evitar bugs quando alterar código
- Documentar como componentes devem funcionar

### Executar Testes Existentes
```bash
# Executar todos os testes uma vez
npm run test:run

# Executar testes em modo assistido (reexecuta quando arquivos mudam)
npm run test

# Executar testes de um componente específico
npm run test -- Hero

# Gerar relatório de cobertura
npm run test:coverage
```

### Criar Teste para Seu Componente
```bash
# Criar arquivo de teste
touch src/components/__tests__/MeuPrimeiroComponente.test.jsx
```

```jsx
// Conteúdo do arquivo de teste
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import MeuPrimeiroComponente from '../MeuPrimeiroComponente';

describe('MeuPrimeiroComponente', () => {
  test('renderiza título corretamente', () => {
    render(<MeuPrimeiroComponente />);
    
    expect(screen.getByText('Meu Primeiro Componente')).toBeInTheDocument();
  });

  test('possui botão clicável', () => {
    render(<MeuPrimeiroComponente />);
    
    const botao = screen.getByRole('button', { name: /clique aqui/i });
    expect(botao).toBeInTheDocument();
  });
});
```

### Executar Seu Teste
```bash
npm run test -- MeuPrimeiroComponente
```

## 🎨 Design System e Padrões

### Cores do Projeto
```jsx
// Use estas classes predefinidas:
'bg-brand-blue-600'    // Azul principal
'bg-trust-green-600'   // Verde de confiança  
'bg-soft-gray-100'     // Cinza suave
'text-soft-gray-800'   // Texto escuro
'text-soft-gray-600'   // Texto médio
```

### Tipografia
```jsx
'text-display-lg'      // Títulos principais (H1)
'text-heading-xl'      // Títulos de seção (H2)
'text-heading-lg'      // Subtítulos (H3)
'text-body-lg'         // Texto normal
'text-caption'         // Texto pequeno
```

### Espaçamentos
```jsx
'p-4'                  // Padding: 1rem
'p-section'            // Padding de seção: 4rem
'space-y-6'            // Espaço vertical entre filhos: 1.5rem
'gap-4'                // Espaço em grid/flex: 1rem
```

### Componentes Prontos
```jsx
// Importar componentes da pasta ui/
import { Button } from '@/components/ui/button';
import { Toast } from '@/components/ui/toast';

// Usar com variantes
<Button variant="primary" size="lg">
  Botão Principal
</Button>

<Button variant="secondary" size="sm">
  Botão Secundário
</Button>
```

## 🔧 Comandos Essenciais

### Desenvolvimento
```bash
npm run dev           # Servidor de desenvolvimento
npm run build         # Build de produção
npm run preview       # Visualizar build
```

### Testes e Validação
```bash
npm run test          # Testes em modo watch
npm run test:run      # Executar todos testes
npm run test:coverage # Relatório de cobertura
npm run verify        # Validação completa
```

### Limpeza e Reset
```bash
# Se algo der errado, reset completo:
rm -rf node_modules .vite dist
npm install --legacy-peer-deps
npm run dev
```

## 📚 Próximos Passos

### Depois de Dominar o Básico
1. **Ler documentação específica**:
   - [docs/BRAND_GUIDE.md](./docs/BRAND_GUIDE.md) - Padrões de design
   - [docs/TESTING_GUIDE.md](./docs/TESTING_GUIDE.md) - Testes avançados
   - [docs/SYSTEM_ARCHITECTURE.md](./docs/SYSTEM_ARCHITECTURE.md) - Arquitetura

2. **Explorar funcionalidades avançadas**:
   - React Router (navegação)
   - React i18next (internacionalização)
   - Framer Motion (animações)
   - APIs e integrações

3. **Contribuir com o projeto**:
   - Corrigir bugs
   - Adicionar funcionalidades
   - Melhorar testes
   - Otimizar performance

### Recursos para Aprender Mais

#### React
- [Documentação oficial](https://react.dev/)
- [React Tutorial interativo](https://react.dev/learn)

#### Tailwind CSS
- [Documentação](https://tailwindcss.com/docs)
- [Tailwind Play](https://play.tailwindcss.com/) - Playground online

#### JavaScript Moderno
- [MDN Web Docs](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
- [JavaScript.info](https://javascript.info/)

#### Git
- [Git Tutorial](https://git-scm.com/docs/gittutorial)
- [GitHub Guides](https://guides.github.com/)

## 🆘 Resolução de Problemas

### Problemas Comuns

#### "npm: command not found"
**Solução**: Instalar Node.js de https://nodejs.org/

#### "Port 5173 is already in use"
```bash
# Usar porta diferente
npm run dev -- --port 3000

# Ou matar processo
pkill -f vite
npm run dev
```

#### "Module not found"
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

#### Site não carrega/página branca
1. Verificar console do browser (F12)
2. Verificar se servidor está rodando
3. Tentar hard refresh (Ctrl+Shift+R)

#### Testes falhando
```bash
# Executar testes específicos para debug
npm run test -- --run --reporter=verbose
```

### Onde Buscar Ajuda

1. **Documentação do projeto**: [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)
2. **Troubleshooting**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
3. **Issues do GitHub**: Problemas conhecidos e soluções
4. **Documentação das tecnologias**: React, Tailwind, Vite

## 🎯 Checklist de Progresso

### ✅ Setup e Configuração
- [ ] Node.js e npm instalados
- [ ] Git instalado
- [ ] Editor de código configurado
- [ ] Projeto clonado e dependências instaladas
- [ ] Servidor de desenvolvimento funcionando
- [ ] Site carregando em localhost:5173

### ✅ Entendimento Básico
- [ ] Entendo a estrutura de pastas
- [ ] Sei o que são componentes React
- [ ] Entendo como funciona Tailwind CSS
- [ ] Sei navegar pelo código existente

### ✅ Primeiro Desenvolvimento
- [ ] Criei meu primeiro componente
- [ ] Usei o componente em uma página
- [ ] Vi o resultado no browser
- [ ] Criei teste para o componente
- [ ] Teste está passando

### ✅ Ferramentas e Padrões
- [ ] Sei executar testes
- [ ] Entendo o design system do projeto
- [ ] Sei usar componentes pré-existentes
- [ ] Sei usar as cores e tipografias padrão

### ✅ Próximo Nível
- [ ] Li documentação de arquitetura
- [ ] Entendo como APIs funcionam
- [ ] Sei fazer deploy local
- [ ] Posso contribuir com melhorias

## 🎉 Parabéns!

Se você chegou até aqui e completou os exercícios, você está pronto para contribuir com o projeto Saraiva Vision!

### Próximos Objetivos Sugeridos:
1. **Explorar componentes existentes** em `src/components/`
2. **Entender uma página completa** como `HomePage.jsx`
3. **Modificar um componente existente** para praticar
4. **Criar um componente mais complexo** com estado e efeitos
5. **Aprender sobre testes avançados** com [docs/TESTING_GUIDE.md](./docs/TESTING_GUIDE.md)

---

*Bem-vindo(a) à equipe de desenvolvimento Saraiva Vision! 🚀*