# Guia de Configuração do Chatbot xAI (Grok)

## 📋 Visão Geral

O chatbot da Clínica Saraiva Vision foi atualizado para usar a tecnologia xAI (Grok) com Next.js + AI SDK, proporcionando respostas mais inteligentes e naturais.

## 🚀 Funcionalidades

### ✨ Principais Recursos
- **Inteligência Artificial Avançada**: Powered by xAI Grok-2-1212
- **Streaming de Respostas**: Respostas em tempo real
- **Fallback Inteligente**: Sistema de backup para garantir disponibilidade
- **Contexto Médico**: Treinado especificamente para oftalmologia
- **Segurança**: Não fornece diagnósticos, apenas informações

### 🔧 Endpoints Disponíveis
1. **`/api/chatbot`** - Endpoint principal com fallback
2. **`/api/chatbot/chat-json`** - Resposta JSON estruturada
3. **`/api/chatbot/chat`** - Streaming de resposta

## ⚙️ Configuração

### 1. Instalar Dependências

```bash
npm install @ai-sdk/xai ai
```

### 2. Configurar Variáveis de Ambiente

Adicione ao seu arquivo `.env`:

```env
# Chatbot Configuration - xAI Grok
XAI_API_KEY=your_xai_api_key_here
XAI_MODEL=grok-2-1212
XAI_MAX_TOKENS=8192
XAI_TEMPERATURE=0.1
```

### 3. Obter API Key da xAI

1. Acesse [console.x.ai](https://console.x.ai)
2. Crie uma conta ou faça login
3. Gere uma nova API key
4. Adicione a key no arquivo `.env`

## 🧪 Testando a Integração

### Teste Rápido via Script

```bash
node test-xai-chatbot.js
```

### Teste Manual via cURL

```bash
# Teste básico
curl -X POST http://localhost:3000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "Olá, como você pode me ajudar?"}'

# Teste streaming
curl -X POST http://localhost:3000/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Quero agendar uma consulta"}' \
  --no-buffer
```

## 📊 Estrutura da Resposta

### Resposta JSON (endpoints /api/chatbot e /api/chatbot/chat-json)

```json
{
  "success": true,
  "data": {
    "response": "Olá! Sou o assistente virtual...",
    "sessionId": "session_1234567890_abc123",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "suggestsBooking": false,
    "aiPowered": true,
    "model": "grok-2-1212",
    "tokensUsed": 150
  }
}
```

### Resposta Streaming (/api/chatbot/chat)

```
Olá! Sou o assistente virtual da Clínica Saraiva Vision...
```

## 🔄 Sistema de Fallback

O chatbot possui um sistema inteligente de fallback:

1. **Primeira tentativa**: xAI (Grok)
2. **Fallback**: Lógica simples baseada em palavras-chave
3. **Garantia**: Sempre retorna uma resposta útil

## 🎯 Casos de Uso

### Exemplos de Mensagens

```javascript
// Saudação
"Olá, como você pode me ajudar?"

// Agendamento
"Quero agendar uma consulta"

// Serviços
"Quais serviços vocês oferecem?"

// Localização
"Onde fica a clínica?"

// Emergência
"Estou com dor no olho"
```

### Respostas Esperadas

- **Saudações**: Apresentação da clínica e serviços
- **Agendamentos**: Direcionamento para telefone/WhatsApp
- **Emergências**: Recomendação de atendimento imediato
- **Informações**: Dados precisos sobre a clínica

## 🛡️ Segurança e Compliance

### Diretrizes Médicas
- ❌ Não fornece diagnósticos
- ❌ Não prescreve medicamentos
- ✅ Orienta para consulta presencial
- ✅ Detecta emergências
- ✅ Direciona para profissionais

### Palavras-chave de Emergência
- emergência, socorro, dor intensa
- perda de visão, sangramento
- acidente, trauma, não consigo ver
- visão turva súbita, flashes

## 🎨 Componente Frontend

### Uso Básico

```jsx
import XAIChatbotDemo from './components/chatbot/XAIChatbotDemo';

function App() {
  return (
    <div>
      <XAIChatbotDemo />
    </div>
  );
}
```

### Integração com Chatbot Existente

```jsx
// Atualizar endpoint no componente existente
const response = await fetch('/api/chatbot', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message, sessionId })
});
```

## 📈 Monitoramento

### Métricas Disponíveis
- `aiPowered`: Se a resposta foi gerada por IA
- `model`: Modelo usado (grok-2-1212 ou fallback)
- `tokensUsed`: Tokens consumidos
- `suggestsBooking`: Se sugere agendamento

### Logs
```javascript
console.log('Chatbot response:', {
  aiPowered: data.aiPowered,
  model: data.model,
  tokensUsed: data.tokensUsed
});
```

## 🔧 Troubleshooting

### Problemas Comuns

1. **API Key não configurada**
   ```
   Error: XAI_API_KEY not configured
   ```
   **Solução**: Adicionar XAI_API_KEY no .env

2. **Modelo não encontrado**
   ```
   Error: Model not found
   ```
   **Solução**: Verificar XAI_MODEL no .env

3. **Rate limiting**
   ```
   Error: Too many requests
   ```
   **Solução**: Implementar delay entre requests

### Debug Mode

```bash
# Ativar logs detalhados
DEBUG=chatbot:* node test-xai-chatbot.js
```

## 🚀 Deploy

### Vercel
1. Adicionar variáveis de ambiente no dashboard
2. Deploy normalmente: `npm run deploy`

### VPS
1. Configurar .env no servidor
2. Reiniciar serviços: `pm2 restart all`

## 📚 Recursos Adicionais

- [xAI Documentation](https://docs.x.ai)
- [AI SDK Documentation](https://sdk.vercel.ai)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

## 🤝 Suporte

Para dúvidas ou problemas:
1. Verificar logs do servidor
2. Testar com script de teste
3. Consultar documentação da xAI
4. Contatar suporte técnico

---

**Nota**: Este chatbot foi desenvolvido especificamente para a Clínica Saraiva Vision e segue todas as diretrizes médicas e de segurança necessárias.