# xAI Grok Chatbot Integration

Este documento descreve a integração do chatbot com xAI Grok usando o AI SDK para streaming de respostas em tempo real.

## 🚀 Configuração

### 1. Dependências

As seguintes dependências já estão instaladas no projeto:

```json
{
  "@ai-sdk/xai": "^1.0.0",
  "ai": "^4.0.0"
}
```

### 2. Variáveis de Ambiente

Configure as seguintes variáveis no arquivo `.env`:

```env
# Chatbot Configuration - xAI Grok
XAI_API_KEY=xai-your-actual-api-key-here
XAI_MODEL=grok-2-1212
XAI_MAX_TOKENS=8192
XAI_TEMPERATURE=0.1
```

### 3. Obter API Key do xAI

1. Acesse [console.x.ai](https://console.x.ai)
2. Faça login ou crie uma conta
3. Navegue para API Keys
4. Crie uma nova API key
5. Copie a key e adicione no arquivo `.env`

## 📁 Arquivos Criados

### API Endpoint
- `/api/chatbot-stream.js` - Endpoint para streaming de respostas do Grok

### Componentes
- `/src/components/ChatbotWidgetStream.jsx` - Widget de chat com streaming
- `/src/components/examples/XAIChatbotExample.jsx` - Exemplo simples
- `/src/pages/ChatbotTestPage.jsx` - Página de teste

## 🔧 Como Usar

### Código Básico

```javascript
import { xai } from "@ai-sdk/xai";
import { streamText } from "ai";

const result = await streamText({
  model: xai("grok-2-1212"),
  prompt: "Sua pergunta aqui",
});

for await (const textPart of result.textStream) {
  process.stdout.write(textPart);
}
```

### API Endpoint

```javascript
// /api/chatbot-stream.js
import { xai } from "@ai-sdk/xai";
import { streamText } from "ai";

export default async function handler(req, res) {
  const { message } = req.body;
  
  const model = xai(process.env.XAI_MODEL || "grok-2-1212");
  
  const result = await streamText({
    model: model,
    prompt: message,
    maxTokens: parseInt(process.env.XAI_MAX_TOKENS) || 1000,
    temperature: parseFloat(process.env.XAI_TEMPERATURE) || 0.1,
  });

  // Stream response
  for await (const textPart of result.textStream) {
    res.write(textPart);
  }
  
  res.end();
}
```

### Frontend Streaming

```javascript
const response = await fetch('/api/chatbot-stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Olá!' }),
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value, { stream: true });
  console.log(chunk); // Texto sendo recebido em tempo real
}
```

## 🧪 Teste

### Página de Teste

Acesse `/chatbot-test` para testar a integração:

- Exemplo simples de chat
- Widget flutuante
- Demonstração de streaming
- Instruções de configuração

### Comandos de Teste

```bash
# Testar o chatbot
npm run test:chatbot

# Executar servidor de desenvolvimento
npm run dev

# Acessar página de teste
# http://localhost:3000/chatbot-test
```

## 🎯 Características

### Streaming em Tempo Real
- Respostas aparecem conforme são geradas
- Indicador visual de streaming
- Cancelamento de requisições

### Configuração Médica
- Prompt especializado para clínica oftalmológica
- Informações da Clínica Saraiva Vision
- Diretrizes médicas e de segurança
- Redirecionamento para agendamentos

### Interface Responsiva
- Widget flutuante
- Design mobile-friendly
- Acessibilidade completa
- Ações rápidas (WhatsApp, Agendamento)

## 🔒 Segurança

### Validações
- Validação de entrada de mensagens
- Limite de caracteres (1000)
- Rate limiting (configurável)
- Sanitização de dados

### Compliance Médico
- Não fornece diagnósticos
- Direciona emergências para atendimento presencial
- Mantém disclaimers médicos
- Conformidade com CFM

## 📊 Monitoramento

### Métricas
- Tempo de resposta
- Taxa de erro
- Uso de tokens
- Satisfação do usuário

### Logs
- Todas as interações são logadas
- Erros são capturados
- Performance é monitorada

## 🚀 Deploy

### Vercel
O projeto está configurado para deploy automático no Vercel:

```bash
# Deploy simples
npm run deploy:simple

# Deploy inteligente
npm run deploy:intelligent
```

### Variáveis de Ambiente no Vercel
Configure as variáveis no dashboard do Vercel ou via CLI:

```bash
vercel env add XAI_API_KEY
vercel env add XAI_MODEL
vercel env add XAI_MAX_TOKENS
vercel env add XAI_TEMPERATURE
```

## 🔧 Troubleshooting

### Problemas Comuns

1. **API Key inválida**
   - Verifique se a key está correta no `.env`
   - Confirme que a key tem permissões adequadas

2. **Streaming não funciona**
   - Verifique se o navegador suporta ReadableStream
   - Confirme que não há proxy bloqueando streaming

3. **Respostas lentas**
   - Ajuste o `XAI_MAX_TOKENS`
   - Verifique a latência da rede
   - Considere usar cache para respostas comuns

### Debug

```bash
# Verificar configuração
npm run config:validate

# Testar API diretamente
curl -X POST http://localhost:3000/api/chatbot-stream \
  -H "Content-Type: application/json" \
  -d '{"message": "Olá!"}'
```

## 📚 Recursos Adicionais

- [Documentação xAI](https://docs.x.ai/)
- [AI SDK Documentation](https://sdk.vercel.ai/)
- [Vercel AI SDK Examples](https://github.com/vercel/ai)
- [Streaming API Guide](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API)

## 🤝 Contribuição

Para contribuir com melhorias no chatbot:

1. Teste as funcionalidades em `/chatbot-test`
2. Implemente melhorias nos componentes
3. Adicione testes unitários
4. Documente as mudanças
5. Abra um Pull Request

---

**Desenvolvido para a Clínica Saraiva Vision** 🏥👁️