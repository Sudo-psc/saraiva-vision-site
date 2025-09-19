# Playbook de Integração do @codex no Workflow de Desenvolvimento

Este playbook detalha como integrar e utilizar o `@codex` (referindo-se ao assistente Gemini neste contexto) para otimizar a geração de boilerplates e refactors controlados em nosso projeto. O objetivo é padronizar a interação, garantir a qualidade do código gerado e acelerar o desenvolvimento.

## 1. O que é o @codex?

O `@codex` é um assistente de IA projetado para auxiliar desenvolvedores na criação rápida de código boilerplate, refatorações controladas e na geração de configurações padronizadas. Ele atua como um copiloto inteligente, fornecendo snippets de código e sugestões baseadas nas melhores práticas e nas convenções do nosso projeto.

## 2. Guidelines de Uso

Para garantir a eficácia e a segurança na utilização do `@codex`, siga as seguintes diretrizes:

### 2.1. Quando Solicitar Snippets e Refactors

*   **Boilerplate:** Utilize o `@codex` para gerar estruturas iniciais de arquivos, funções, componentes, endpoints, configurações de Nginx, Dockerfiles, etc.
*   **Refactors Controlados:** Para refatorações pequenas e bem definidas, onde o escopo da mudança é claro e o impacto pode ser facilmente verificado. Evite refatorações complexas ou que alterem a arquitetura central sem uma revisão humana aprofundada.
*   **Exploração:** Para entender como implementar uma funcionalidade específica dentro do contexto do projeto, solicitando exemplos de código.
*   **Padronização:** Para garantir que novos trechos de código sigam as convenções de estilo e estrutura existentes.

### 2.2. Limites de Diffs e Revisão

*   **Diffs Pequenos:** Priorize solicitações que resultem em diffs (diferenças de código) pequenos e fáceis de revisar. Se a mudança for grande, tente quebrá-la em etapas menores.
*   **Revisão Humana Obrigatória:** **Todo código gerado ou modificado pelo `@codex` deve ser revisado por um desenvolvedor humano.** Não faça commit de código gerado sem uma revisão cuidadosa.
*   **Testes:** Sempre execute os testes existentes e, se necessário, crie novos testes para validar o código gerado ou refatorado.

### 2.3. Padrões de Commit

Ao commitar código que foi gerado ou significativamente influenciado pelo `@codex`, utilize o seguinte padrão de mensagem de commit para clareza e rastreabilidade:

```
<tipo>(<escopo>): <mensagem concisa> [codex]

[codex] Gerado/Refatorado com auxílio do @codex. Revisado e validado.
```

**Exemplos:**

*   `feat(api): add /health endpoint [codex]`
*   `refactor(frontend): update Button component to use new design system [codex]`
*   `chore(nginx): add FastCGI config for WordPress [codex]`

## 3. Prompts Modelo e Templates por Área

### 3.1. API (Node.js)

**Objetivo:** Gerar endpoints básicos para monitoramento.

**Prompt Exemplo (Endpoint /health):**

```
"Crie um endpoint GET `/health` em Node.js/Express que retorne um status 200 e um JSON `{ status: 'UP' }`. Inclua tratamento de erros básico."
```

**Template de Código (`/health`):**

```javascript
// Exemplo de arquivo: src/api/routes/health.js
const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  try {
    res.status(200).json({ status: 'UP' });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ status: 'DOWN', error: error.message });
  }
});

module.exports = router;

// Exemplo de integração em src/api/app.js
// const healthRoutes = require('./routes/health');
// app.use('/', healthRoutes);
```

**Prompt Exemplo (Endpoint /status):**

```
"Crie um endpoint GET `/status` em Node.js/Express que retorne um status 200 e um JSON com informações básicas do serviço, como versão e timestamp atual. Inclua tratamento de erros."
```

**Template de Código (`/status`):**

```javascript
// Exemplo de arquivo: src/api/routes/status.js
const express = require('express');
const router = express.Router();
const packageJson = require('../../../package.json'); // Assumindo que package.json está na raiz do projeto

router.get('/status', (req, res) => {
  try {
    res.status(200).json({
      service: packageJson.name,
      version: packageJson.version,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    console.error('Status check failed:', error);
    res.status(500).json({ status: 'ERROR', error: error.message });
  }
});

module.exports = router;

// Exemplo de integração em src/api/app.js
// const statusRoutes = require('./routes/status');
// app.use('/', statusRoutes);
```

### 3.2. Frontend (React/Vite com HMR)

**Objetivo:** Gerar um componente React funcional com suporte a Hot Module Replacement (HMR).

**Prompt Exemplo (Componente de Botão):**

```
"Crie um componente React funcional chamado `Button` em TypeScript, que aceite `children` e um `onClick` prop. Inclua estilos básicos com Tailwind CSS e garanta que seja compatível com HMR em um projeto Vite."
```

**Template de Código (`Button.tsx`):**

```typescript
// Exemplo de arquivo: src/components/Button.tsx
import React from 'react';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ onClick, children, className }) => {
  return (
    <button
      className={`px-4 py-2 font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 ${className || ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;

// Para HMR, Vite já configura automaticamente para componentes React.
// Exemplo de uso:
// import Button from './components/Button';
// <Button onClick={() => alert('Clicked!')}>Click Me</Button>
```

### 3.3. Nginx

**Objetivo:** Gerar configurações de Nginx para reverse proxy e FastCGI.

**Prompt Exemplo (Reverse Proxy para API):**

```
"Crie um bloco `location` do Nginx para atuar como reverse proxy para uma API Node.js rodando em `http://api:3001`. O proxy deve estar configurado para `/api/` e incluir headers essenciais como `Host`, `X-Real-IP`, `X-Forwarded-For` e `X-Forwarded-Proto`."
```

**Template de Código (Nginx Reverse Proxy):**

```nginx
# Exemplo de arquivo: nginx-includes/api-proxy.conf
location /api/ {
    proxy_pass http://api:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

**Prompt Exemplo (FastCGI para WordPress):**

```
"Crie um bloco `location` do Nginx para processar arquivos `.php` via FastCGI para um backend WordPress. A configuração deve apontar para `wordpress:9000` e incluir os parâmetros FastCGI necessários, como `SCRIPT_FILENAME` e `PATH_INFO`."
```

**Template de Código (Nginx FastCGI para WordPress):**

```nginx
# Exemplo de arquivo: nginx-includes/wordpress-fastcgi.conf
location ~ \.php$ {
    try_files $uri =404;
    fastcgi_split_path_info ^(.+\.php)(/.+)$;
    fastcgi_pass wordpress:9000;
    fastcgi_index index.php;
    include fastcgi_params;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    fastcgi_param PATH_INFO $fastcgi_path_info;
}
```

### 3.4. Docker

**Objetivo:** Gerar snippets para Dockerfiles e `docker-compose.yml`.

**Prompt Exemplo (Dockerfile para API Node.js):**

```
"Crie um Dockerfile otimizado para uma aplicação Node.js/Express. Deve usar um estágio multi-stage para build e produção, copiar dependências, instalar, e expor a porta 3001."
```

**Template de Código (Dockerfile.api):**

```dockerfile
# Exemplo de arquivo: Dockerfile.api

# Estágio de Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .
RUN npm run build # Se houver um passo de build para a API

# Estágio de Produção
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist # Ajuste se o build gerar arquivos em outro diretório
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src ./src # Se a API não tiver um passo de build, copie o src diretamente

EXPOSE 3001
CMD ["node", "src/server.js"] # Ajuste para o seu arquivo de entrada da API
```

**Prompt Exemplo (Serviço `docker-compose` para Frontend Vite):**

```
"Crie um snippet de serviço `docker-compose` para uma aplicação frontend React/Vite. Deve mapear a porta 3002, usar um Dockerfile específico (`Dockerfile.frontend`), montar volumes para hot-reloading e depender da API."
```

**Template de Código (docker-compose.dev.yml snippet):**

```yaml
# Exemplo de arquivo: docker-compose.dev.yml
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3002:3002"
    volumes:
      - ./frontend:/app # Ajuste para o diretório do seu frontend
      - /app/node_modules # Evita que o node_modules do host sobrescreva o do container
    environment:
      - NODE_ENV=development
    depends_on:
      - api # Assumindo que o frontend depende da API
    # command: npm run dev # Ou o comando para iniciar o servidor de desenvolvimento do Vite
```

## 4. Exemplos de Sessões @codex

### 4.1. Sessão API: Criando um novo endpoint

**Desenvolvedor:** "Preciso de um novo endpoint na API Node.js para listar usuários. Deve ser um GET em `/users` e retornar um array de objetos de usuário mockados. Use Express e siga as convenções existentes."

**@codex (Gemini):**

```javascript
// src/api/routes/users.js
const express = require('express');
const router = express.Router();

// Mock de dados de usuários
const mockUsers = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
];

router.get('/users', (req, res) => {
  try {
    res.status(200).json(mockUsers);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
```

**Desenvolvedor:** "Ok, isso parece bom. Agora, como eu integraria isso no `app.js` principal?"

**@codex (Gemini):**

```javascript
// src/api/app.js (snippet)
const express = require('express');
const app = express();
const healthRoutes = require('./routes/health');
const statusRoutes = require('./routes/status');
const userRoutes = require('./routes/users'); // Nova linha

// ... outras configurações ...

app.use('/', healthRoutes);
app.use('/', statusRoutes);
app.use('/', userRoutes); // Nova linha

// ... restante do código ...
```

### 4.2. Sessão Frontend: Criando um componente de card

**Desenvolvedor:** "Crie um componente React funcional em TypeScript chamado `Card` que aceite `title`, `description` e `children`. Ele deve ter um estilo básico com Tailwind CSS, com bordas arredondadas e sombra."

**@codex (Gemini):**

```typescript
// src/components/Card.tsx
import React from 'react';

interface CardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, description, children, className }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className || ''}`}>
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      {description && <p className="text-gray-600 mb-4">{description}</p>}
      <div>{children}</div>
    </div>
  );
};

export default Card;
```

### 4.3. Sessão Nginx: Adicionando redirecionamento HTTPS

**Desenvolvedor:** "Preciso adicionar uma configuração no Nginx para redirecionar todo o tráfego HTTP para HTTPS para o domínio `saraivavision.com`."

**@codex (Gemini):**

```nginx
# Exemplo de arquivo: nginx.conf ou um arquivo de site disponível
server {
    listen 80;
    server_name saraivavision.com www.saraivavision.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name saraivavision.com www.saraivavision.com;

    # ... suas configurações SSL (certificados, etc.) ...

    # ... suas configurações de proxy e FastCGI ...
}
```

### 4.4. Sessão WordPress: Configurando um serviço `docker-compose`

**Desenvolvedor:** "Crie um snippet de serviço `docker-compose` para o WordPress. Deve usar a imagem `wordpress:latest`, mapear a porta 8080, montar um volume para persistência de dados e configurar variáveis de ambiente para o banco de dados MySQL."

**@codex (Gemini):**

```yaml
# Exemplo de arquivo: docker-compose.dev.yml (snippet)
services:
  wordpress:
    image: wordpress:latest
    ports:
      - "8080:80"
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: wordpress
      WORDPRESS_DB_NAME: wordpress
    volumes:
      - wordpress_data:/var/www/html # Volume para persistência dos arquivos do WP
    depends_on:
      - db # Assumindo que você tem um serviço de banco de dados chamado 'db'

  db:
    image: mysql:5.7
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: wordpress
    volumes:
      - db_data:/var/lib/mysql

volumes:
  wordpress_data:
  db_data:
```

## 5. Padronização de Prompts e Validações

Para maximizar a eficácia do `@codex`, os prompts devem ser:

*   **Claros e Concisos:** Vá direto ao ponto, especificando o que você precisa.
*   **Contextuais:** Forneça o máximo de contexto relevante possível (linguagem, framework, arquivos relacionados, convenções de projeto).
*   **Específicos:** Em vez de "Crie um componente", diga "Crie um componente React funcional em TypeScript chamado `MeuComponente` que exiba um título e uma descrição."
*   **Com Exemplos (se aplicável):** Se tiver um padrão específico em mente, inclua um pequeno exemplo.

**Validação:**

Após receber a resposta do `@codex`:

1.  **Leia o Código:** Entenda o que foi gerado.
2.  **Compare com o Contexto:** Verifique se o código se encaixa no seu projeto (convenções de nome, estilo, dependências).
3.  **Teste:** Execute testes unitários, de integração ou manuais para garantir que a funcionalidade esteja correta.
4.  **Ajuste:** Faça quaisquer ajustes necessários para integrar perfeitamente o código ao seu codebase.

Ao seguir este playbook, garantiremos que o `@codex` seja uma ferramenta poderosa e segura para acelerar nosso desenvolvimento.