# 🚀 Guia de Início Rápido para Desenvolvedores

Guia prático para configurar e começar a desenvolver no projeto Saraiva Vision em menos de 10 minutos.

## ⚡ Setup Rápido (5 minutos)

### 1. Pré-requisitos
```bash
# Verificar versões
node --version  # Deve ser 18+
npm --version   # Deve ser 8+
git --version   # Qualquer versão recente
```

### 2. Clone e Setup
```bash
# Clone o repositório
git clone https://github.com/Sudo-psc/saraiva-vision-site.git
cd saraiva-vision-site

# Instalar dependências (pode levar 2-3 minutos)
npm install --legacy-peer-deps

# Copiar variáveis de ambiente
cp .env.example .env

# Iniciar desenvolvimento
npm run dev
```

### 3. Verificar Setup
- Abra [http://localhost:5173](http://localhost:5173)
- Deve ver a página inicial da Saraiva Vision
- Console deve estar limpo (sem erros vermelhos)

## 🛠️ Comandos Essenciais

### Desenvolvimento
```bash
npm run dev          # Servidor de desenvolvimento (localhost:5173)
npm run dev:full     # Servidor completo com APIs (inclui backend)
npm run build        # Build de produção
npm run preview      # Preview do build
```

### Testes
```bash
npm run test         # Testes em modo watch
npm run test:run     # Executar testes uma vez
npm run test:coverage # Relatório de cobertura
```

### Validação
```bash
npm run verify       # Validação completa (build + testes + lints)
npm run verify:links # Verificar links quebrados
npm run verify:html  # Validar HTML
```

## 📁 Estrutura do Projeto (Navegação Rápida)

```
saraiva-vision-site/
├── 📄 README.md                    # Documentação principal
├── 📄 CLAUDE.md                    # Guias para desenvolvimento
├── 📁 src/                         # Código fonte
│   ├── 📁 components/              # Componentes React
│   │   ├── 📁 ui/                  # Componentes base (Button, etc.)
│   │   ├── 📁 icons/               # Ícones customizados
│   │   └── 📁 __tests__/           # Testes de componentes
│   ├── 📁 pages/                   # Páginas da aplicação
│   ├── 📁 hooks/                   # Custom hooks
│   ├── 📁 lib/                     # Utilitários e configs
│   ├── 📁 contexts/                # React contexts
│   ├── 📁 locales/                 # Traduções (pt/en)
│   └── 📁 utils/                   # Funções utilitárias
├── 📁 docs/                        # Documentação técnica
├── 📁 api/                         # Serverless functions
├── 📁 public/                      # Assets estáticos
└── 📄 package.json                 # Dependências e scripts
```

## 🎯 Primeiros Passos

### Para Desenvolver um Componente
```bash
# 1. Criar o componente
touch src/components/MeuComponente.jsx

# 2. Criar o teste
touch src/components/__tests__/MeuComponente.test.jsx

# 3. Executar testes
npm run test -- MeuComponente
```

### Para Criar uma Nova Página
```bash
# 1. Criar a página
touch src/pages/MinhaPage.jsx

# 2. Adicionar no router (src/App.jsx)
# 3. Testar navegação
npm run dev
```

### Para Alterar Estilos
- **Tailwind**: Use classes utilitárias (`className="bg-blue-500 text-white"`)
- **Tokens de design**: Veja [docs/BRAND_GUIDE.md](./docs/BRAND_GUIDE.md)
- **Cores**: `brand-blue`, `trust-green`, `soft-gray`

## 📋 Checklist do Primeiro Desenvolvimento

- [ ] Setup do projeto funcionando (localhost:5173 carrega)
- [ ] Testes passam (`npm run test:run`)
- [ ] Build funciona (`npm run build`)
- [ ] Leu [CLAUDE.md](./CLAUDE.md) para comandos de desenvolvimento
- [ ] Entendeu estrutura de pastas
- [ ] Criou um componente de teste
- [ ] Executou testes do componente

## 🎨 Design System - Uso Rápido

### Cores
```jsx
// Cores principais
<button className="bg-brand-blue-600 hover:bg-brand-blue-700 text-white">
  Primário
</button>

<div className="bg-trust-green-50 border border-trust-green-200">
  Sucesso/Confiança
</div>

<p className="text-soft-gray-700">Texto normal</p>
```

### Tipografia
```jsx
<h1 className="text-display-sm md:text-display-md">Título Principal</h1>
<h2 className="text-heading-xl">Seção</h2>
<p className="text-body-lg">Parágrafo normal</p>
```

### Espaçamento
```jsx
<section className="py-section">  {/* 64px */}
  <div className="container mx-auto px-4">
    <div className="space-y-6">  {/* 24px entre elementos */}
      {/* Conteúdo */}
    </div>
  </div>
</section>
```

## 🔧 Troubleshooting Rápido

### Problema: Porta 5173 ocupada
```bash
# Usar porta diferente
npm run dev -- --port 3000
```

### Problema: Erro de dependências
```bash
# Reinstalar com legacy peer deps
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Problema: Testes falhando
```bash
# Executar testes específicos
npm run test -- --run components
npm run test -- --run pages
```

### Problema: Build muito grande
- Normal: chunk principal ~550kB (compactado ~180kB)
- Otimizações: lazy loading já implementado

### Problema: Hot reload não funciona
```bash
# Reiniciar servidor
Ctrl+C
npm run dev
```

## 📚 Documentação por Tarefa

| Quero... | Documento |
|----------|-----------|
| Entender a arquitetura | [docs/SYSTEM_ARCHITECTURE.md](./docs/SYSTEM_ARCHITECTURE.md) |
| Seguir padrões de design | [docs/BRAND_GUIDE.md](./docs/BRAND_GUIDE.md) |
| Escrever testes | [docs/TESTING_GUIDE.md](./docs/TESTING_GUIDE.md) |
| Trabalhar com APIs | [docs/API_DESIGN_SPECIFICATION.md](./docs/API_DESIGN_SPECIFICATION.md) |
| Fazer deploy | [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) |
| Ver todos os documentos | [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) |

## 🚨 Comandos de Emergência

```bash
# Reset completo
git checkout .                    # Desfazer mudanças
rm -rf node_modules dist .vite    # Limpar cache
npm install --legacy-peer-deps    # Reinstalar
npm run dev                       # Iniciar

# Verificação completa
npm run build && npm run test:run && npm run verify:links

# Deploy local (para testar produção)
npm run build && npm run preview
```

## 💡 Dicas Pro

1. **Use o VS Code** com extensões ESLint e Tailwind CSS IntelliSense
2. **Mantenha o dev server rodando** durante desenvolvimento
3. **Execute testes frequentemente** (`npm run test`)
4. **Consulte CLAUDE.md** para comandos avançados
5. **Use lazy loading** para novos componentes pesados
6. **Siga o design system** (classes Tailwind pré-definidas)

## 🆘 Precisa de Ajuda?

1. **Documentação**: Consulte [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)
2. **Código**: Veja exemplos em `src/components/`
3. **Padrões**: [CLAUDE.md](./CLAUDE.md) tem guidelines de código
4. **Architecture**: [docs/SYSTEM_ARCHITECTURE.md](./docs/SYSTEM_ARCHITECTURE.md)

---

**Próximos passos sugeridos:**
1. Explorar código existente em `src/components/`
2. Ler [docs/BRAND_GUIDE.md](./docs/BRAND_GUIDE.md) para padrões visuais
3. Praticar criando um componente simples
4. Entender fluxo de testes com [docs/TESTING_GUIDE.md](./docs/TESTING_GUIDE.md)

*Tempo estimado para proficiência: 2-3 dias de desenvolvimento ativo*