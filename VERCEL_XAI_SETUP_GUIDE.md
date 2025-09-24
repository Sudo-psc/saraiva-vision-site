# Guia de Configuração xAI no Vercel

## 🚀 Configuração Rápida

### 1. Obter API Key do xAI

1. Acesse [console.x.ai](https://console.x.ai)
2. Crie uma conta ou faça login
3. Navegue para "API Keys"
4. Clique em "Create API Key"
5. Copie a API key gerada

### 2. Configurar no Vercel (Método Automático)

```bash
# Executar script de configuração
./scripts/configure-vercel-xai.sh
```

### 3. Configurar no Vercel (Método Manual)

#### Via Vercel CLI

```bash
# Instalar Vercel CLI (se necessário)
npm install -g vercel

# Login no Vercel
vercel login

# Configurar variáveis (substitua YOUR_API_KEY pela sua chave real)
echo "xai-your-actual-api-key-here" | vercel env add XAI_API_KEY production
echo "xai-your-actual-api-key-here" | vercel env add XAI_API_KEY preview
echo "xai-your-actual-api-key-here" | vercel env add XAI_API_KEY development

echo "grok-2-1212" | vercel env add XAI_MODEL production
echo "grok-2-1212" | vercel env add XAI_MODEL preview
echo "grok-2-1212" | vercel env add XAI_MODEL development

echo "8192" | vercel env add XAI_MAX_TOKENS production
echo "8192" | vercel env add XAI_MAX_TOKENS preview
echo "8192" | vercel env add XAI_MAX_TOKENS development

echo "0.1" | vercel env add XAI_TEMPERATURE production
echo "0.1" | vercel env add XAI_TEMPERATURE preview
echo "0.1" | vercel env add XAI_TEMPERATURE development
```

#### Via Vercel Dashboard

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto
3. Vá para "Settings" → "Environment Variables"
4. Adicione as seguintes variáveis:

| Nome | Valor | Ambientes |
|------|-------|-----------|
| `XAI_API_KEY` | `sua-api-key-aqui` | Production, Preview, Development |
| `XAI_MODEL` | `grok-2-1212` | Production, Preview, Development |
| `XAI_MAX_TOKENS` | `8192` | Production, Preview, Development |
| `XAI_TEMPERATURE` | `0.1` | Production, Preview, Development |

## 🔧 Comandos Úteis

### Verificar Configuração

```bash
# Listar todas as variáveis de ambiente
vercel env ls

# Verificar variáveis específicas do xAI
vercel env ls | grep XAI
```

### Testar Configuração

```bash
# Testar localmente
node test-xai-chatbot.js

# Testar em produção
curl -X POST https://seu-dominio.vercel.app/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "Olá, teste do xAI"}'
```

### Atualizar Variáveis

```bash
# Remover variável existente
vercel env rm XAI_API_KEY production

# Adicionar nova variável
echo "nova-api-key" | vercel env add XAI_API_KEY production
```

## 📋 Variáveis de Ambiente Necessárias

### Obrigatórias

- **`XAI_API_KEY`**: Chave da API do xAI (obrigatória)

### Opcionais (com valores padrão)

- **`XAI_MODEL`**: Modelo a usar (padrão: `grok-2-1212`)
- **`XAI_MAX_TOKENS`**: Máximo de tokens (padrão: `8192`)
- **`XAI_TEMPERATURE`**: Temperatura do modelo (padrão: `0.1`)

## 🧪 Testando a Configuração

### 1. Teste Local

```bash
# Definir API key temporariamente
export XAI_API_KEY="sua-api-key-aqui"

# Executar teste
node test-xai-chatbot.js
```

### 2. Teste em Produção

```bash
# Fazer deploy
vercel --prod

# Testar endpoint
curl -X POST https://saraivavision.com.br/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Olá, como você pode me ajudar?",
    "sessionId": "test_session"
  }'
```

### 3. Verificar Logs

```bash
# Ver logs em tempo real
vercel logs --follow

# Ver logs específicos de uma função
vercel logs api/chatbot.js
```

## 🔍 Troubleshooting

### Problema: API Key não encontrada

```json
{
  "success": false,
  "error": "Configuration error",
  "message": "Chatbot service temporarily unavailable"
}
```

**Solução**: Verificar se `XAI_API_KEY` está configurada corretamente

```bash
vercel env ls | grep XAI_API_KEY
```

### Problema: Modelo não encontrado

```json
{
  "success": false,
  "error": "Model not found"
}
```

**Solução**: Verificar se o modelo está correto

```bash
# Usar modelo padrão
echo "grok-2-1212" | vercel env add XAI_MODEL production
```

### Problema: Rate limiting

```json
{
  "error": "Too many requests"
}
```

**Solução**: Implementar delay entre requests ou verificar limites da API

### Problema: Fallback sempre ativo

Se o chatbot sempre usa fallback (`"aiPowered": false`):

1. Verificar se API key está correta
2. Verificar logs do Vercel para erros
3. Testar API key diretamente

## 📊 Monitoramento

### Verificar Status do Chatbot

```javascript
// Adicionar ao seu código para debug
console.log('xAI Status:', {
  hasApiKey: !!process.env.XAI_API_KEY,
  model: process.env.XAI_MODEL,
  environment: process.env.VERCEL_ENV
});
```

### Logs Úteis

```bash
# Ver logs de erro
vercel logs --since=1h | grep ERROR

# Ver logs do chatbot
vercel logs --since=1h | grep chatbot

# Ver logs de uma função específica
vercel logs api/chatbot.js --since=30m
```

## 🚀 Deploy e Verificação

### 1. Deploy Completo

```bash
# Deploy para produção
npm run deploy

# Ou usando Vercel diretamente
vercel --prod
```

### 2. Verificação Pós-Deploy

```bash
# Verificar se variáveis estão ativas
curl -X POST https://seu-dominio.vercel.app/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "teste"}' | jq '.data.aiPowered'

# Deve retornar: true (se xAI estiver funcionando)
```

### 3. Teste de Fallback

```bash
# Temporariamente remover API key para testar fallback
vercel env rm XAI_API_KEY production

# Testar (deve usar fallback)
curl -X POST https://seu-dominio.vercel.app/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "teste"}' | jq '.data.model'

# Deve retornar: "fallback"

# Restaurar API key
echo "sua-api-key" | vercel env add XAI_API_KEY production
```

## 💡 Dicas Importantes

1. **Segurança**: Nunca commite a API key no código
2. **Ambientes**: Configure para todos os ambientes (production, preview, development)
3. **Fallback**: O sistema sempre funciona, mesmo sem xAI
4. **Logs**: Monitore os logs para detectar problemas
5. **Rate Limits**: Respeite os limites da API do xAI

## 📞 Suporte

Se encontrar problemas:

1. Verificar logs do Vercel
2. Testar API key diretamente no console do xAI
3. Verificar se todas as variáveis estão configuradas
4. Testar localmente primeiro

---

**Nota**: Este chatbot foi desenvolvido especificamente para a Clínica Saraiva Vision e inclui contexto médico especializado em oftalmologia.