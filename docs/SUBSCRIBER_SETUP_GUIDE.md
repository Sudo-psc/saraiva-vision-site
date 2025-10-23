# Guia de Configuração - Área do Assinante

Este guia irá ajudá-lo a configurar Firebase Auth e Airtable para a área do assinante.

## Pré-requisitos

- Conta Google (para Firebase)
- Conta Airtable (plano gratuito ou pago)
- Node.js 22+ instalado
- Acesso ao projeto Saraiva Vision

## Parte 1: Configuração do Firebase

### 1.1 Criar Projeto Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto" ou "Create a project"
3. Nome do projeto: `saraiva-vision-prod` (ou similar)
4. Desabilite Google Analytics (opcional)
5. Clique em "Criar projeto"

### 1.2 Configurar Firebase Authentication

1. No menu lateral, clique em **Authentication**
2. Clique em "Get started"
3. Na aba **Sign-in method**, habilite os seguintes provedores:
   - **Google**: Clique em Google → Enable → Configure
     - Project support email: `contato@saraivavision.com.br`
     - Salvar
   - **Email/Password** (opcional): Enable para permitir login com email

### 1.3 Configurar Domínio Autorizado

1. Em Authentication → Settings → Authorized domains
2. Adicione os seguintes domínios:
   - `saraivavision.com.br`
   - `www.saraivavision.com.br`
   - `localhost` (para desenvolvimento)

### 1.4 Obter Credenciais do Firebase

1. No menu lateral, clique no ícone de engrenagem ⚙️ → **Project settings**
2. Na seção "Your apps", clique no ícone `</>` (Web app)
3. Registre o app:
   - App nickname: `Saraiva Vision Web`
   - Firebase Hosting: Não é necessário
   - Clique em "Register app"
4. Copie as configurações fornecidas:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

5. Adicione essas informações ao arquivo `.env`:

```bash
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 1.5 Configurar Firebase Admin SDK (Backend)

1. No Firebase Console, vá para Project Settings → Service accounts
2. Clique em "Generate new private key"
3. Salve o arquivo JSON em local seguro (NÃO commite ao git)
4. No servidor de produção, coloque o arquivo em:
   ```
   /home/saraiva-vision-site/api/config/firebase-admin-key.json
   ```
5. Adicione ao `.gitignore`:
   ```
   api/config/firebase-admin-key.json
   ```

## Parte 2: Configuração do Airtable

### 2.1 Criar Conta e Base

1. Acesse [Airtable](https://airtable.com/)
2. Crie uma conta ou faça login
3. Clique em "Create a base"
4. Nome da base: `Saraiva Vision - Subscribers`

### 2.2 Criar Tabela "Subscribers"

1. Renomeie a primeira tabela para `Subscribers`
2. Configure os seguintes campos:

| Nome do Campo       | Tipo de Campo     | Configuração                          |
|---------------------|-------------------|---------------------------------------|
| id                  | Autonumber        | (automático)                          |
| firebase_uid        | Single line text  | Único, obrigatório                    |
| email               | Email             | Obrigatório                           |
| display_name        | Single line text  | -                                     |
| photo_url           | URL               | -                                     |
| subscription_status | Single select     | active, inactive, expired             |
| subscription_plan   | Single select     | basico, padrao, premium               |
| subscription_start  | Date              | Include time: No                      |
| subscription_end    | Date              | Include time: No                      |
| created_at          | Created time      | (automático)                          |
| updated_at          | Last modified time| (automático)                          |
| phone               | Phone number      | -                                     |
| cpf                 | Single line text  | (será criptografado no backend)       |
| birth_date          | Date              | Include time: No                      |
| address             | Long text         | -                                     |
| medical_history     | Long text         | (será criptografado no backend)       |
| appointments        | Link to records   | Link to: Appointments                 |
| notes               | Long text         | -                                     |

### 2.3 Criar Tabela "Appointments"

1. Adicione nova tabela: `Appointments`
2. Configure os seguintes campos:

| Nome do Campo       | Tipo de Campo     | Configuração                          |
|---------------------|-------------------|---------------------------------------|
| id                  | Autonumber        | (automático)                          |
| subscriber_id       | Link to records   | Link to: Subscribers                  |
| appointment_date    | Date              | Include time: No                      |
| appointment_time    | Single line text  | -                                     |
| status              | Single select     | scheduled, completed, cancelled       |
| service_type        | Single select     | consulta, exame, cirurgia, retorno    |
| doctor_name         | Single line text  | Default: Dr. Philipe Saraiva          |
| notes               | Long text         | -                                     |
| created_at          | Created time      | (automático)                          |

### 2.4 Criar Tabela "Activity_Log"

1. Adicione nova tabela: `Activity_Log`
2. Configure os seguintes campos:

| Nome do Campo       | Tipo de Campo     | Configuração                          |
|---------------------|-------------------|---------------------------------------|
| id                  | Autonumber        | (automático)                          |
| subscriber_id       | Link to records   | Link to: Subscribers                  |
| action              | Single select     | login, logout, update_profile, etc    |
| timestamp           | Created time      | (automático)                          |
| ip_address          | Single line text  | -                                     |
| user_agent          | Long text         | -                                     |
| details             | Long text         | (JSON stringified)                    |

### 2.5 Obter Credenciais do Airtable

1. Acesse [Airtable Account](https://airtable.com/account)
2. Em "API", clique em "Generate API key"
3. Copie a API key
4. Acesse [Airtable API Documentation](https://airtable.com/api)
5. Selecione sua base "Saraiva Vision - Subscribers"
6. Na URL, você verá algo como: `https://airtable.com/app123ABC456DEF/api/docs`
7. O `app123ABC456DEF` é o seu Base ID

8. Adicione ao arquivo `.env`:

```bash
AIRTABLE_API_KEY=keyXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
AIRTABLE_SUBSCRIBERS_TABLE=Subscribers
AIRTABLE_APPOINTMENTS_TABLE=Appointments
AIRTABLE_ACTIVITY_LOG_TABLE=Activity_Log
```

## Parte 3: Instalação de Dependências

### 3.1 Frontend Dependencies

```bash
cd /home/user/saraiva-vision-site
npm install firebase
npm install airtable  # Apenas para testes, backend usa direto
```

### 3.2 Backend Dependencies

```bash
cd /home/user/saraiva-vision-site
npm install firebase-admin
npm install airtable
npm install jsonwebtoken
```

### 3.3 Development Dependencies

```bash
npm install --save-dev @testing-library/react-hooks
```

## Parte 4: Configuração de Segurança

### 4.1 Firebase Security Rules

1. No Firebase Console, vá para Authentication → Settings
2. Configure "User account management":
   - Email verification: Enabled (recomendado)
   - Sign-in quota: 100 por hora (padrão)

### 4.2 Airtable Permissions

1. Em Settings → Collaborators
2. Mantenha a API key privada
3. Use variáveis de ambiente, nunca hardcode

### 4.3 Backend Environment Variables (Produção)

No servidor VPS (31.97.129.78), crie arquivo `.env` em `/home/saraiva-vision-site/`:

```bash
sudo nano /home/saraiva-vision-site/.env
```

Adicione as variáveis:

```bash
# Firebase Admin SDK
FIREBASE_ADMIN_KEY_PATH=/home/saraiva-vision-site/api/config/firebase-admin-key.json

# Airtable
AIRTABLE_API_KEY=keyXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
AIRTABLE_SUBSCRIBERS_TABLE=Subscribers
AIRTABLE_APPOINTMENTS_TABLE=Appointments
AIRTABLE_ACTIVITY_LOG_TABLE=Activity_Log

# Security
JWT_SECRET=your_secure_random_string_here
JWT_EXPIRY=7d
```

Gerar JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4.4 Permissões de Arquivo

```bash
sudo chmod 600 /home/saraiva-vision-site/.env
sudo chmod 600 /home/saraiva-vision-site/api/config/firebase-admin-key.json
```

## Parte 5: Teste de Configuração

### 5.1 Testar Firebase

Crie arquivo de teste:

```bash
node -e "
const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');

const config = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
};

const app = initializeApp(config);
const auth = getAuth(app);

console.log('Firebase initialized:', !!auth);
"
```

### 5.2 Testar Airtable

Crie arquivo de teste:

```bash
node -e "
const Airtable = require('airtable');

Airtable.configure({
  apiKey: process.env.AIRTABLE_API_KEY
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

base('Subscribers').select({ maxRecords: 1 }).firstPage((err, records) => {
  if (err) {
    console.error('Airtable test failed:', err);
    return;
  }
  console.log('Airtable connection successful!');
});
"
```

## Parte 6: Configuração do Nginx (Produção)

Adicionar ao arquivo `/etc/nginx/sites-enabled/saraivavision`:

```nginx
# Subscriber API endpoints
location /api/subscribers/ {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;

    # Rate limiting for auth endpoints
    limit_req zone=api_limit burst=10 nodelay;
    limit_req_status 429;
}
```

Recarregar Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Parte 7: Checklist Final

### Firebase
- [ ] Projeto criado no Firebase Console
- [ ] Google Auth habilitado
- [ ] Domínios autorizados configurados
- [ ] Credenciais adicionadas ao .env
- [ ] Firebase Admin SDK configurado no backend

### Airtable
- [ ] Base criada com nome correto
- [ ] Tabela Subscribers criada com todos os campos
- [ ] Tabela Appointments criada com todos os campos
- [ ] Tabela Activity_Log criada com todos os campos
- [ ] API key gerada
- [ ] Base ID obtido
- [ ] Credenciais adicionadas ao .env

### Segurança
- [ ] Arquivo .env configurado
- [ ] Permissões de arquivo corretas (600)
- [ ] JWT_SECRET gerado
- [ ] Firebase Admin key em local seguro
- [ ] .gitignore atualizado

### Backend
- [ ] Dependências instaladas
- [ ] Nginx configurado
- [ ] API endpoints preparados
- [ ] Rate limiting configurado

### Testes
- [ ] Firebase connection test passou
- [ ] Airtable connection test passou
- [ ] Build local bem-sucedido

## Próximos Passos

Após completar este guia de configuração:

1. Implementar serviços de autenticação (firebaseAuth.js)
2. Implementar serviço Airtable (airtableService.js)
3. Criar componentes de UI (Login, Dashboard, etc.)
4. Escrever testes
5. Deploy em produção

## Troubleshooting

### Erro: Firebase API key invalid
- Verifique se copiou corretamente todas as credenciais
- Confirme que o projeto está ativo no Firebase Console

### Erro: Airtable authentication failed
- Verifique se a API key está correta
- Confirme que o Base ID está correto
- Verifique se as tabelas existem com os nomes corretos

### Erro: CORS no Firebase Auth
- Verifique se o domínio está na lista de Authorized domains
- Para desenvolvimento local, certifique-se de que `localhost` está autorizado

### Erro: Cannot read environment variables
- Verifique se o arquivo .env está na raiz do projeto
- Confirme que as variáveis começam com `VITE_` para o frontend
- Reinicie o servidor de desenvolvimento após alterar .env

## Suporte

Para dúvidas ou problemas:
- Documentação Firebase: https://firebase.google.com/docs/auth
- Documentação Airtable: https://airtable.com/developers/web/api/introduction
- Issues do projeto: [GitHub Issues]

---

**Última atualização**: 2025-10-23
**Versão**: 1.0.0
