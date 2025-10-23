# Área do Assinante - Arquitetura e Planejamento

## Visão Geral

Sistema de autenticação e gerenciamento de assinantes para a plataforma Saraiva Vision, integrando Firebase Auth para autenticação e Airtable como banco de dados de assinantes.

## Stack Tecnológica

- **Autenticação**: Firebase Auth (Google Sign-In)
- **Banco de Dados**: Airtable (gerenciamento de assinantes)
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js/Express (API endpoints)
- **Testes**: Vitest + Testing Library

## Arquitetura

### 1. Camadas da Aplicação

```
┌─────────────────────────────────────────┐
│         UI Components Layer              │
│  (Login, Dashboard, Profile, etc.)       │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│      Authentication Layer                │
│  (Firebase Auth + Route Guards)          │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│         Services Layer                   │
│  (FirebaseAuth + Airtable Services)      │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│         API Layer (Backend)              │
│  (Express endpoints + validation)        │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│      External Services                   │
│  (Firebase + Airtable APIs)              │
└─────────────────────────────────────────┘
```

### 2. Fluxo de Autenticação

```
┌─────────┐
│  User   │
└────┬────┘
     │
     ↓
┌─────────────────────┐
│  Login Page         │
│  (Gmail OAuth)      │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│  Firebase Auth      │
│  (Google Provider)  │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│  Get Firebase Token │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│  Backend API        │
│  (/api/auth/verify) │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│  Check/Create       │
│  Airtable Record    │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│  Return Session     │
│  + User Data        │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│  Dashboard Page     │
│  (Protected Route)  │
└─────────────────────┘
```

## Modelo de Dados - Airtable

### Tabela: Subscribers (Assinantes)

| Campo               | Tipo        | Descrição                           | Obrigatório |
|---------------------|-------------|-------------------------------------|-------------|
| id                  | Auto Number | ID único do registro                | Sim         |
| firebase_uid        | Single Line | UID do Firebase                     | Sim         |
| email               | Email       | Email do assinante                  | Sim         |
| display_name        | Single Line | Nome de exibição                    | Não         |
| photo_url           | URL         | URL da foto de perfil               | Não         |
| subscription_status | Single Select | Status: active, inactive, expired  | Sim         |
| subscription_plan   | Single Select | Plano: basico, padrao, premium     | Sim         |
| subscription_start  | Date        | Data de início da assinatura        | Sim         |
| subscription_end    | Date        | Data de fim da assinatura           | Não         |
| created_at          | Created Time | Data de criação do registro        | Auto        |
| updated_at          | Last Modified | Última modificação                | Auto        |
| phone               | Phone       | Telefone de contato                 | Não         |
| cpf                 | Single Line | CPF (criptografado)                 | Não         |
| birth_date          | Date        | Data de nascimento                  | Não         |
| address             | Long Text   | Endereço completo                   | Não         |
| medical_history     | Long Text   | Histórico médico (criptografado)    | Não         |
| appointments        | Link to Records | Link para tabela de consultas   | Não         |
| notes               | Long Text   | Notas administrativas               | Não         |

### Tabela: Appointments (Consultas)

| Campo               | Tipo        | Descrição                           | Obrigatório |
|---------------------|-------------|-------------------------------------|-------------|
| id                  | Auto Number | ID único do registro                | Sim         |
| subscriber_id       | Link to Records | Link para Subscribers          | Sim         |
| appointment_date    | Date        | Data da consulta                    | Sim         |
| appointment_time    | Single Line | Hora da consulta                    | Sim         |
| status              | Single Select | scheduled, completed, cancelled   | Sim         |
| service_type        | Single Select | Tipo de serviço                   | Sim         |
| doctor_name         | Single Line | Nome do médico                      | Não         |
| notes               | Long Text   | Observações da consulta             | Não         |
| created_at          | Created Time | Data de criação                    | Auto        |

### Tabela: Activity_Log (Log de Atividades)

| Campo               | Tipo        | Descrição                           | Obrigatório |
|---------------------|-------------|-------------------------------------|-------------|
| id                  | Auto Number | ID único do registro                | Sim         |
| subscriber_id       | Link to Records | Link para Subscribers          | Sim         |
| action              | Single Select | login, logout, update_profile, etc | Sim         |
| timestamp           | Created Time | Timestamp da ação                  | Auto        |
| ip_address          | Single Line | Endereço IP                         | Não         |
| user_agent          | Long Text   | User agent do navegador             | Não         |
| details             | Long Text   | Detalhes adicionais (JSON)          | Não         |

## Estrutura de Pastas

```
src/
├── modules/
│   └── subscribers/
│       ├── components/
│       │   ├── auth/
│       │   │   ├── LoginForm.jsx
│       │   │   ├── SignupForm.jsx
│       │   │   ├── GoogleSignInButton.jsx
│       │   │   └── PasswordResetForm.jsx
│       │   ├── dashboard/
│       │   │   ├── Dashboard.jsx
│       │   │   ├── DashboardLayout.jsx
│       │   │   ├── SubscriptionCard.jsx
│       │   │   └── AppointmentsList.jsx
│       │   └── profile/
│       │       ├── ProfileForm.jsx
│       │       ├── ProfileHeader.jsx
│       │       └── MedicalHistoryForm.jsx
│       ├── pages/
│       │   ├── LoginPage.jsx
│       │   ├── SignupPage.jsx
│       │   ├── DashboardPage.jsx
│       │   └── ProfilePage.jsx
│       ├── services/
│       │   ├── firebaseAuth.js
│       │   ├── airtableService.js
│       │   └── subscriberService.js
│       ├── hooks/
│       │   ├── useAuth.js
│       │   ├── useSubscriber.js
│       │   └── useProtectedRoute.js
│       ├── contexts/
│       │   └── AuthContext.jsx
│       └── __tests__/
│           ├── firebaseAuth.test.js
│           ├── airtableService.test.js
│           ├── LoginForm.test.jsx
│           └── Dashboard.test.jsx
├── components/
│   └── ProtectedRoute.jsx
└── lib/
    └── firebase.js

api/
└── src/
    └── routes/
        └── subscribers/
            ├── auth.js
            ├── profile.js
            └── appointments.js
```

## Componentes Principais

### 1. AuthContext (Context Provider)

```jsx
// src/modules/subscribers/contexts/AuthContext.jsx
- Gerencia estado global de autenticação
- Fornece user, loading, error
- Funções: login, logout, updateProfile
- Persistência de sessão com localStorage
```

### 2. FirebaseAuth Service

```javascript
// src/modules/subscribers/services/firebaseAuth.js
- signInWithGoogle()
- signOut()
- onAuthStateChanged()
- getCurrentUser()
- getIdToken()
```

### 3. Airtable Service

```javascript
// src/modules/subscribers/services/airtableService.js
- createSubscriber(firebaseUser)
- getSubscriberByFirebaseUid(uid)
- updateSubscriber(id, data)
- getSubscriberAppointments(subscriberId)
- createAppointment(subscriberData)
- logActivity(subscriberId, action, details)
```

### 4. Protected Route Component

```jsx
// src/components/ProtectedRoute.jsx
- Verifica autenticação antes de renderizar
- Redireciona para /login se não autenticado
- Mostra loading durante verificação
```

## Rotas da Aplicação

```jsx
// Adições ao App.jsx
<Route path="/login" element={<LoginPage />} />
<Route path="/signup" element={<SignupPage />} />
<Route path="/assinante" element={
  <ProtectedRoute>
    <DashboardPage />
  </ProtectedRoute>
} />
<Route path="/assinante/perfil" element={
  <ProtectedRoute>
    <ProfilePage />
  </ProtectedRoute>
} />
<Route path="/assinante/consultas" element={
  <ProtectedRoute>
    <AppointmentsPage />
  </ProtectedRoute>
} />
```

## API Endpoints (Backend)

### Authentication

```
POST   /api/subscribers/auth/verify
  Body: { firebaseToken: string }
  Response: { user: Object, subscriber: Object }

POST   /api/subscribers/auth/logout
  Body: { firebaseUid: string }
  Response: { success: boolean }
```

### Subscriber Management

```
GET    /api/subscribers/profile/:firebaseUid
  Response: { subscriber: Object }

PUT    /api/subscribers/profile/:firebaseUid
  Body: { updates: Object }
  Response: { subscriber: Object }

GET    /api/subscribers/:firebaseUid/appointments
  Response: { appointments: Array }

POST   /api/subscribers/:firebaseUid/appointments
  Body: { appointment: Object }
  Response: { appointment: Object }
```

## Variáveis de Ambiente

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Airtable Configuration
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_base_id
AIRTABLE_SUBSCRIBERS_TABLE=Subscribers
AIRTABLE_APPOINTMENTS_TABLE=Appointments
AIRTABLE_ACTIVITY_LOG_TABLE=Activity_Log
```

## Segurança

### 1. Proteção de Dados (LGPD)

- Criptografia de dados sensíveis (CPF, histórico médico)
- Uso de `src/utils/healthcareCompliance.js` para validação
- Consentimento explícito para coleta de dados
- Logs de acesso e atividades

### 2. Autenticação

- Firebase Auth com Google OAuth 2.0
- Tokens JWT para autenticação de API
- Verificação de token no backend
- Rate limiting nos endpoints de autenticação

### 3. Autorização

- Verificação de propriedade de recursos
- Middleware de autorização no backend
- Proteção de rotas no frontend
- Validação de permissões por plano de assinatura

### 4. Validação de Dados

- Zod schemas para validação de entrada
- Sanitização com DOMPurify
- Validação de formatos (CPF, email, telefone)
- Limites de tamanho de dados

## Estratégia de Testes

### 1. Testes Unitários

```javascript
// Services
- firebaseAuth.test.js (100% coverage)
- airtableService.test.js (100% coverage)
- subscriberService.test.js (100% coverage)

// Utils
- validation.test.js
- encryption.test.js
```

### 2. Testes de Integração

```javascript
// API Endpoints
- auth.integration.test.js
- profile.integration.test.js
- appointments.integration.test.js

// Service Integration
- firebase-airtable.integration.test.js
```

### 3. Testes de Componentes

```jsx
// UI Components
- LoginForm.test.jsx
- Dashboard.test.jsx
- ProfileForm.test.jsx
- ProtectedRoute.test.jsx
```

### 4. Testes E2E

```javascript
// User Flows
- login-flow.e2e.test.js
- signup-flow.e2e.test.js
- profile-update.e2e.test.js
- appointment-booking.e2e.test.js
```

## Dependências Necessárias

### Frontend

```bash
npm install firebase
npm install airtable
npm install @firebase/auth
```

### Backend

```bash
npm install firebase-admin
npm install airtable
npm install jsonwebtoken
```

### Desenvolvimento

```bash
npm install --save-dev @testing-library/react-hooks
npm install --save-dev firebase-mock
```

## Fluxo de Implementação

### Fase 1: Setup e Configuração
1. Configurar Firebase project
2. Criar base no Airtable com tabelas
3. Adicionar variáveis de ambiente
4. Instalar dependências

### Fase 2: Services Layer
1. Implementar firebaseAuth.js
2. Implementar airtableService.js
3. Criar testes unitários para services
4. Implementar AuthContext

### Fase 3: Backend API
1. Criar endpoints de autenticação
2. Criar endpoints de perfil
3. Implementar middleware de autenticação
4. Adicionar rate limiting e validação

### Fase 4: Frontend UI
1. Criar componentes de autenticação
2. Implementar dashboard
3. Criar formulários de perfil
4. Adicionar ProtectedRoute

### Fase 5: Testes
1. Testes unitários (services + utils)
2. Testes de integração (API)
3. Testes de componentes (UI)
4. Testes E2E (fluxos completos)

### Fase 6: Documentação e Deploy
1. Atualizar documentação
2. Criar guia de uso para assinantes
3. Deploy em produção
4. Monitoramento e ajustes

## Considerações de Performance

1. **Caching**:
   - Cache de dados de assinante no localStorage
   - Cache de token do Firebase
   - Invalidação de cache ao atualizar dados

2. **Lazy Loading**:
   - Componentes de dashboard carregados sob demanda
   - Código de Firebase/Airtable em chunks separados

3. **Otimização de Queries**:
   - Buscar apenas dados necessários do Airtable
   - Filtros no servidor, não no cliente
   - Paginação para listas de consultas

## Monitoramento e Analytics

1. **Logs de Autenticação**:
   - Registrar logins/logouts
   - Registrar tentativas falhadas
   - Alertas para atividades suspeitas

2. **Métricas de Uso**:
   - Tempo de sessão
   - Páginas mais visitadas
   - Taxa de conversão de signup

3. **Erros e Exceções**:
   - Captura de erros de autenticação
   - Logs de falhas de API
   - Notificações para equipe técnica

## Conformidade Médica (CFM/LGPD)

1. **Dados Médicos**:
   - Histórico médico criptografado
   - Acesso restrito apenas ao próprio assinante
   - Logs de acesso a dados sensíveis

2. **Consentimento**:
   - Termo de consentimento no signup
   - Opção de download de dados pessoais
   - Direito ao esquecimento (exclusão de conta)

3. **Comunicação**:
   - Emails transacionais apenas
   - Opt-in para comunicações de marketing
   - Conformidade com CFM para conteúdo médico

## Próximos Passos

1. Criar projeto no Firebase Console
2. Criar base no Airtable
3. Configurar variáveis de ambiente
4. Implementar serviços de autenticação
5. Criar componentes de UI
6. Escrever testes
7. Deploy e monitoramento
