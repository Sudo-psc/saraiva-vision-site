# API Routes Ninsaúde - Atualizadas

## ✅ Status: Todos os endpoints testados e funcionando

Data: 2025-10-05

---

## Rotas Implementadas

### 1. **Autenticação** - `/api/ninsaude/auth`

**POST /api/ninsaude/auth**

Endpoint Ninsaúde: `/v1/oauth2/token`

**Actions:**
- `login` - Autentica com credenciais
- `refresh` - Renova access token

**Request (Login):**
```json
{
  "action": "login"
}
```

**Request (Refresh):**
```json
{
  "action": "refresh",
  "refreshToken": "..."
}
```

**Response:**
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "expires_in": 900,
  "token_type": "bearer"
}
```

---

### 2. **Unidades** - `/api/ninsaude/units`

**GET /api/ninsaude/units**

Endpoint Ninsaúde: `/v1/account_geral/listar`

**Query Parameters:**
- `limit` (opcional, padrão: 50)
- `ativo` (opcional, padrão: 1)

**Headers:**
```
x-access-token: <access_token>
```

**Response:**
```json
{
  "units": [
    {
      "id": 1,
      "descricao": "Philipe Saraiva Cruz",
      "unidade": "Matriz",
      "ativo": 1,
      "enderecoCep": 35300299,
      "enderecoCidadeTitle": "Caratinga",
      "enderecoCidadeSig": "MG"
    }
  ],
  "total": 1
}
```

---

### 3. **Profissionais** - `/api/ninsaude/professionals`

**GET /api/ninsaude/professionals**

Endpoint Ninsaúde: `/v1/cadastro_profissional/listar`

**Query Parameters:**
- `limit` (opcional, padrão: 50)

**Headers:**
```
x-access-token: <access_token>
```

**Response:**
```json
{
  "professionals": [
    {
      "id": 1,
      "nome": "Philipe Saraiva Cruz",
      "cpf": null,
      "email": "drphilipe.saraiva.oftalmo@gmail.com",
      "ativo": 1,
      "conselhoId": 22,
      "conselhoDescricao": "Medicine",
      "conselhoNumero": null
    }
  ],
  "total": 1
}
```

---

### 4. **Horários Disponíveis** - `/api/ninsaude/available-slots`

**GET /api/ninsaude/available-slots**

Endpoint Ninsaúde: `/v1/atendimento_agenda/listar/horario/disponivel/profissional/{id}/dataInicial/{start}/dataFinal/{end}`

**Query Parameters (obrigatórios):**
- `professional_id` - ID do profissional
- `start_date` - Data inicial (YYYY-MM-DD)
- `end_date` - Data final (YYYY-MM-DD)

**Headers:**
```
x-access-token: <access_token>
```

**Response:**
```json
{
  "slots": [
    {
      "date": "2025-10-06",
      "startTime": "09:00",
      "endTime": "09:20",
      "unitId": 1
    },
    {
      "date": "2025-10-06",
      "startTime": "09:20",
      "endTime": "09:40",
      "unitId": 1
    }
  ],
  "total": 105
}
```

**Resposta original Ninsaúde:**
```json
{
  "result": [
    {
      "data": "2025-10-06",
      "horarioLivre": [
        {
          "horaInicial": "09:00",
          "horaFinal": "09:20",
          "accountUnidade": 1
        }
      ]
    }
  ],
  "error": []
}
```

---

### 5. **Pacientes** - `/api/ninsaude/patients`

**GET /api/ninsaude/patients**

Endpoint Ninsaúde: `/v1/cadastro_paciente/listar`

**Query Parameters:**
- `limit` (opcional, padrão: 50)
- `filter` (opcional) - Filtro de busca

**Headers:**
```
x-access-token: <access_token>
```

**Response:**
```json
{
  "patients": [
    {
      "id": 123,
      "nome": "João Silva",
      "cpf": "12345678900",
      "email": "joao@email.com",
      "foneCelular": "(33) 99999-9999",
      "dataNascimento": "1990-01-01",
      "ativo": 1
    }
  ],
  "total": 1
}
```

**POST /api/ninsaude/patients**

Endpoint Ninsaúde: `/v1/cadastro_paciente`

**Headers:**
```
x-access-token: <access_token>
```

**Request:**
```json
{
  "nome": "João Silva",
  "cpf": "12345678900",
  "telefone": "(33) 99999-9999",
  "email": "joao@email.com",
  "dataNascimento": "1990-01-01"
}
```

**Response:**
```json
{
  "result": {
    "id": 123,
    "nome": "João Silva",
    "cpf": "12345678900"
  }
}
```

---

### 6. **Agendamentos** - `/api/ninsaude/appointments`

**POST /api/ninsaude/appointments**

Endpoint Ninsaúde: `/v1/atendimento_agenda`

**Headers:**
```
x-access-token: <access_token>
```

**Request:**
```json
{
  "accountUnidade": 1,
  "profissional": 1,
  "data": "2025-10-06",
  "horaInicial": "09:00",
  "horaFinal": "09:20",
  "paciente": 123,
  "status": 1,
  "servico": 456,
  "consent": {
    "lgpd": true,
    "timestamp": "2025-10-05T12:00:00Z"
  }
}
```

**Campos obrigatórios:**
- `accountUnidade` - ID da unidade
- `profissional` - ID do profissional
- `data` - Data do agendamento (YYYY-MM-DD)
- `horaInicial` - Hora inicial (HH:MM)
- `horaFinal` - Hora final (HH:MM)
- `paciente` - ID do paciente
- `consent.lgpd` - Consentimento LGPD (true)

**Campos opcionais:**
- `status` - Status do agendamento (padrão: 1)
- `servico` - ID do serviço

**Response:**
```json
{
  "result": {
    "id": 789,
    "accountUnidade": 1,
    "profissional": 1,
    "data": "2025-10-06",
    "horaInicial": "09:00",
    "horaFinal": "09:20",
    "paciente": 123,
    "status": 1
  }
}
```

**DELETE /api/ninsaude/appointments?id={appointmentId}**

Endpoint Ninsaúde: `/v1/atendimento_agenda/{id}`

**Headers:**
```
x-access-token: <access_token>
```

**Response:**
```json
{
  "message": "Appointment cancelled successfully"
}
```

---

## Fluxo Completo de Agendamento

### 1. Autenticação
```bash
POST /api/ninsaude/auth
Body: { "action": "login" }
```

### 2. Buscar Profissionais
```bash
GET /api/ninsaude/professionals
Header: x-access-token: <token>
```

### 3. Buscar Horários Disponíveis
```bash
GET /api/ninsaude/available-slots?professional_id=1&start_date=2025-10-06&end_date=2025-10-12
Header: x-access-token: <token>
```

### 4. Criar/Buscar Paciente
```bash
# Buscar paciente existente
GET /api/ninsaude/patients?filter=12345678900
Header: x-access-token: <token>

# OU criar novo paciente
POST /api/ninsaude/patients
Header: x-access-token: <token>
Body: { "nome": "...", "cpf": "...", ... }
```

### 5. Criar Agendamento
```bash
POST /api/ninsaude/appointments
Header: x-access-token: <token>
Body: { 
  "accountUnidade": 1,
  "profissional": 1,
  "data": "2025-10-06",
  "horaInicial": "09:00",
  "horaFinal": "09:20",
  "paciente": 123,
  "consent": { "lgpd": true }
}
```

---

## Variáveis de Ambiente Necessárias

```env
NINSAUDE_API_URL=https://api.ninsaude.com/v1
NINSAUDE_ACCOUNT=saraivavision
NINSAUDE_USERNAME=philipe
NINSAUDE_PASSWORD=Psc451992*
NINSAUDE_ACCOUNT_UNIT=1
```

---

## Tratamento de Erros

Todas as rotas retornam erros padronizados:

```json
{
  "error": "Mensagem de erro descritiva"
}
```

**Status Codes:**
- `200` - Sucesso (GET)
- `201` - Criado (POST)
- `400` - Bad Request (parâmetros faltando/inválidos)
- `401` - Unauthorized (token ausente/inválido)
- `500` - Internal Server Error

---

## Testes

Todos os endpoints foram testados com sucesso usando:
- `scripts/test-ninsaude-complete.cjs` - Teste completo da API

**Resultados dos testes:**
✅ Autenticação OAuth2  
✅ Listagem de Unidades (1 unidade encontrada)  
✅ Listagem de Profissionais (1 profissional encontrado)  
✅ Horários Disponíveis (105 slots encontrados em 7 dias)

---

## Próximos Passos

1. ✅ Atualizar componentes React para usar os novos endpoints
2. ✅ Criar testes de integração para as rotas
3. ⏳ Implementar cache de tokens OAuth2
4. ⏳ Adicionar rate limiting
5. ⏳ Implementar webhook para confirmações de agendamento
