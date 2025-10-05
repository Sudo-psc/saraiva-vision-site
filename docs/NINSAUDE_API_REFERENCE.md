# 🏥 API Ninsaúde Clinic - Referência Completa

## 📋 Informações Gerais

**Base URL:** `https://api.ninsaude.com/v1/`  
**Versão:** 2024-12-24  
**Protocolo:** HTTPS  
**Formato:** JSON  
**Autenticação:** OAuth2 (Bearer Token)

---

## 🔐 AUTENTICAÇÃO

### 1. Capturar Refresh Token (Login)

**Endpoint:** `POST /v1/oauth2/token`

**Headers:**
```
Content-Type: application/x-www-form-urlencoded
```

**Body (x-www-form-urlencoded):**
```
grant_type=password
account={{strSuaConta}}
username={{strSeuUsuario}}
password={{strSuaSenha}}
accountUnit={{intUnidadeAtendimento}}
```

**Response 200:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "def502004f3c8b2e...",
  "token_type": "Bearer",
  "expires_in": 900
}
```

**Notas:**
- **Refresh Token:** Não possui validade, usado apenas para gerar Access Tokens
- **Access Token:** Validade de 15 minutos (900 segundos)
- Armazenar Refresh Token com segurança máxima
- Nunca expor tokens no client-side

---

### 2. Capturar Access Token (Renovar Sessão)

**Endpoint:** `POST /v1/oauth2/token`

**Headers:**
```
Content-Type: application/x-www-form-urlencoded
```

**Body (x-www-form-urlencoded):**
```
grant_type=refresh_token
refresh_token={{strRefreshToken}}
```

**Response 200:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "Bearer",
  "expires_in": 900
}
```

---

### 3. Revogar Refresh Token (Logout)

**Endpoint:** `POST /v1/oauth2/revoke`

**Headers:**
```
Content-Type: application/x-www-form-urlencoded
```

**Body (x-www-form-urlencoded):**
```
token_type_hint=refresh_token
token={{strRefreshToken}}
```

**Response 200:**
```json
{
  "message": "Token revoked successfully"
}
```

---

## 📅 AGENDAMENTOS

### Headers Obrigatórios (Todas as Rotas)

```
Authorization: bearer {{access_token}}
Content-Type: application/json
```

---

### 1. Listar Horários Disponíveis

**Endpoint:** `GET /v1/agenda/horarios-disponiveis`

**Query Parameters:**
```
date (obrigatório): YYYY-MM-DD
professional_id (opcional): ID do profissional
specialty_id (opcional): ID da especialidade
account_unit (opcional): ID da unidade de atendimento
```

**Example Request:**
```
GET /v1/agenda/horarios-disponiveis?date=2025-10-15&professional_id=123
Authorization: bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "time": "08:00",
      "available": true,
      "professional": {
        "id": 123,
        "name": "Dr. João Silva",
        "specialty": "Oftalmologia"
      },
      "duration": 30
    },
    {
      "id": 2,
      "time": "08:30",
      "available": true,
      "professional": {
        "id": 123,
        "name": "Dr. João Silva",
        "specialty": "Oftalmologia"
      },
      "duration": 30
    }
  ],
  "count": 2
}
```

---

### 2. Criar Agendamento

**Endpoint:** `POST /v1/agenda/agendar`

**Request Body:**
```json
{
  "patient": {
    "name": "Maria Silva",
    "email": "maria@example.com",
    "phone": "33988776655",
    "cpf": "12345678900",
    "birthdate": "1990-05-15"
  },
  "appointment": {
    "date": "2025-10-15",
    "time": "08:00",
    "professional_id": 123,
    "specialty_id": 10,
    "account_unit": 1,
    "reason": "Consulta de rotina oftalmológica",
    "notes": "Primeira consulta",
    "type": "consulta"
  },
  "consent": {
    "lgpd": true,
    "timestamp": "2025-10-05T10:30:00.000Z",
    "ip": "192.168.1.1"
  }
}
```

**Response 201:**
```json
{
  "id": "AGD-2025-001234",
  "protocol": "001234",
  "status": "confirmed",
  "date": "2025-10-15",
  "time": "08:00",
  "patient": {
    "id": 5678,
    "name": "Maria Silva",
    "email": "maria@example.com"
  },
  "professional": {
    "id": 123,
    "name": "Dr. João Silva",
    "specialty": "Oftalmologia"
  },
  "account_unit": {
    "id": 1,
    "name": "Clínica Saraiva Vision",
    "address": "Rua Principal, 123"
  },
  "created_at": "2025-10-05T10:30:00.000Z"
}
```

**Response 400 (Horário Indisponível):**
```json
{
  "error": [
    {
      "code": 400,
      "message": "Horário não está mais disponível"
    }
  ]
}
```

**Response 400 (Dados Inválidos):**
```json
{
  "error": [
    {
      "code": 400,
      "message": "Campo 'email' é obrigatório"
    }
  ]
}
```

---

### 3. Buscar Agendamento por ID

**Endpoint:** `GET /v1/agenda/{id}`

**Example:**
```
GET /v1/agenda/AGD-2025-001234
Authorization: bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

**Response 200:**
```json
{
  "id": "AGD-2025-001234",
  "protocol": "001234",
  "status": "confirmed",
  "date": "2025-10-15",
  "time": "08:00",
  "patient": { ... },
  "professional": { ... },
  "account_unit": { ... }
}
```

---

### 4. Cancelar Agendamento

**Endpoint:** `DELETE /v1/agenda/{id}`

**Example:**
```
DELETE /v1/agenda/AGD-2025-001234
Authorization: bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

**Response 200:**
```json
{
  "message": "Agendamento cancelado com sucesso",
  "id": "AGD-2025-001234",
  "cancelled_at": "2025-10-05T11:00:00.000Z"
}
```

---

### 5. Atualizar Agendamento

**Endpoint:** `PUT /v1/agenda/{id}`

**Request Body:**
```json
{
  "date": "2025-10-16",
  "time": "09:00",
  "notes": "Reagendamento solicitado pelo paciente"
}
```

**Response 200:**
```json
{
  "id": "AGD-2025-001234",
  "protocol": "001234",
  "status": "rescheduled",
  "date": "2025-10-16",
  "time": "09:00",
  "updated_at": "2025-10-05T11:30:00.000Z"
}
```

---

## 👤 PACIENTES

### 1. Buscar Paciente por CPF

**Endpoint:** `GET /v1/paciente/buscar-cpf/{cpf}`

**Example:**
```
GET /v1/paciente/buscar-cpf/12345678900
Authorization: bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

**Response 200:**
```json
{
  "id": 5678,
  "name": "Maria Silva",
  "email": "maria@example.com",
  "phone": "33988776655",
  "cpf": "12345678900",
  "birthdate": "1990-05-15",
  "address": {
    "street": "Rua das Flores",
    "number": "100",
    "neighborhood": "Centro",
    "city": "Caratinga",
    "state": "MG",
    "zip": "35300000"
  }
}
```

**Response 404:**
```json
{
  "error": [
    {
      "code": 404,
      "message": "Paciente não encontrado"
    }
  ]
}
```

---

### 2. Criar Paciente

**Endpoint:** `POST /v1/paciente`

**Request Body:**
```json
{
  "name": "João Pedro Santos",
  "email": "joao@example.com",
  "phone": "33987654321",
  "cpf": "98765432100",
  "birthdate": "1985-03-20",
  "gender": "M",
  "address": {
    "street": "Av. Brasil",
    "number": "500",
    "neighborhood": "Centro",
    "city": "Caratinga",
    "state": "MG",
    "zip": "35300000"
  }
}
```

**Response 201:**
```json
{
  "id": 5679,
  "name": "João Pedro Santos",
  "email": "joao@example.com",
  "cpf": "98765432100",
  "created_at": "2025-10-05T12:00:00.000Z"
}
```

---

## 🏢 UNIDADES DE ATENDIMENTO

### 1. Listar Unidades

**Endpoint:** `GET /v1/account_geral/listar`

**Query Parameters:**
```
limit (opcional): Limite de registros (máx: 150)
offset (opcional): Offset para paginação
order (opcional): Ordenação (ex: -ativo,nome)
property (opcional): Propriedades (ex: id,descricao,ativo)
ativo (opcional): 1 (ativas) ou 0 (inativas)
filter (opcional): Filtro geral
```

**Example:**
```
GET /v1/account_geral/listar?limit=10&ativo=1&property=id,descricao
Authorization: bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "descricao": "Clínica Saraiva Vision",
      "ativo": 1,
      "unidade": "Principal",
      "enderecoCidade": 14,
      "foneComercial": "33988776655"
    }
  ],
  "count": 1
}
```

---

## 🩺 PROFISSIONAIS

### 1. Listar Profissionais

**Endpoint:** `GET /v1/profissional/listar`

**Query Parameters:**
```
limit (opcional)
offset (opcional)
ativo (opcional): 1 ou 0
specialty_id (opcional): Filtrar por especialidade
```

**Response 200:**
```json
{
  "data": [
    {
      "id": 123,
      "name": "Dr. João Silva",
      "crm": "MG123456",
      "specialty": "Oftalmologia",
      "ativo": 1,
      "email": "dr.joao@saraivavision.com.br"
    }
  ],
  "count": 1
}
```

---

## 📊 STATUS CODES

| Código | Significado |
|--------|-------------|
| **200** | Sem erro |
| **201** | Criado com sucesso |
| **400** | Requisição mal formada |
| **401** | Sessão expirou (renovar Access Token) |
| **403** | Usuário sem acesso ao recurso |
| **404** | Registro não encontrado |
| **500** | Erro grave ou regra de negócio |
| **501** | Erro de programação |
| **503** | Serviços indisponíveis |

---

## 🔧 PARÂMETROS DE LISTAGEM

### Query Parameters Globais

```
limit: Limite de registros (máx: 150)
offset: Offset = limit * página
order: Ordenação crescente/decrescente (-campo)
property: Propriedades separadas por vírgula
```

**Exemplo:**
```
/v1/agenda/listar?limit=10&offset=20&order=-data,hora&property=id,paciente,horario
```

---

## 📅 FORMATOS DE DATA

- **Data:** `YYYY-MM-DD` (ex: 2025-10-15)
- **Hora:** `HH:mm:ss` (ex: 14:30:00)
- **Data/Hora:** `YYYY-MM-DD HH:mm:ss` (ex: 2025-10-15 14:30:00)
- **ISO 8601:** `YYYY-MM-DDTHH:mm:ss.sssZ` (ex: 2025-10-15T14:30:00.000Z)

---

## 🛡️ SEGURANÇA

### Certificados
- ✅ Let's Encrypt Authority X3 2048 bits
- ✅ SSAE16 / ISAE 3402 Type II
- ✅ ISO 27001, 27017, 27018
- ✅ PCI DSS v3.2
- ✅ HIPAA

### Boas Práticas

1. **Nunca expor credenciais no client-side**
2. **Refresh Token:** Armazenar com segurança máxima (backend)
3. **Access Token:** Renovar automaticamente a cada 15 minutos
4. **HTTPS:** Sempre usar conexões seguras
5. **LGPD:** Sempre coletar consentimento com timestamp

---

## 🔄 FLUXO DE AUTENTICAÇÃO

```
1. Login Inicial
   POST /oauth2/token (grant_type=password)
   → Recebe: refresh_token + access_token

2. Uso da API (15 minutos)
   GET/POST/PUT/DELETE /v1/*
   Authorization: bearer {access_token}

3. Renovação (antes de expirar)
   POST /oauth2/token (grant_type=refresh_token)
   → Recebe: novo access_token

4. Logout
   POST /oauth2/revoke
   → Revoga refresh_token
```

---

## 📝 EXEMPLO COMPLETO (cURL)

### 1. Login
```bash
curl -X POST https://api.ninsaude.com/v1/oauth2/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&account=minha_conta&username=usuario&password=senha&accountUnit=1"
```

### 2. Listar Horários
```bash
curl -X GET "https://api.ninsaude.com/v1/agenda/horarios-disponiveis?date=2025-10-15" \
  -H "Authorization: bearer SEU_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### 3. Criar Agendamento
```bash
curl -X POST https://api.ninsaude.com/v1/agenda/agendar \
  -H "Authorization: bearer SEU_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patient": {
      "name": "Maria Silva",
      "email": "maria@example.com",
      "phone": "33988776655"
    },
    "appointment": {
      "date": "2025-10-15",
      "time": "08:00",
      "professional_id": 123
    },
    "consent": {
      "lgpd": true,
      "timestamp": "2025-10-05T10:30:00.000Z"
    }
  }'
```

---

**Última Atualização:** Outubro 2025  
**Versão API:** 2024-12-24  
**Fonte:** Ninsaúde Clinic Postman Collection
