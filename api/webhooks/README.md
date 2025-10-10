# Webhooks API

Sistema modular de webhooks com validação de assinatura, logging e error handling.

## 📁 Estrutura

```
api/
├── src/
│   ├── middleware/
│   │   ├── webhook-validator.js    # Validação de assinaturas HMAC/Stripe
│   │   └── webhook-logger.js       # Sistema de logging
│   └── webhooks/
│       ├── base-webhook.js         # Classe base reutilizável
│       ├── payment-webhook.js      # Exemplo: webhooks de pagamento
│       ├── github-webhook.js       # Exemplo: webhooks do GitHub
│       └── form-webhook.js         # Exemplo: submissões de formulário
└── webhooks/
    └── payment.js                  # API route Next.js
```

## 🚀 Uso Rápido

### 1. Criar Novo Webhook

```javascript
// api/src/webhooks/meu-webhook.js
import { BaseWebhook } from './base-webhook.js';

export class MeuWebhook extends BaseWebhook {
  constructor() {
    super({
      name: 'meu-webhook',
      secret: process.env.MEU_WEBHOOK_SECRET,
      validationType: 'hmac', // 'hmac', 'stripe', 'none'
      allowedIPs: [] // Opcional
    });
  }

  async process(payload) {
    // Sua lógica aqui
    console.log('Processando:', payload);

    return {
      processed: true,
      data: 'resultado'
    };
  }
}
```

### 2. Criar API Route

```javascript
// api/webhooks/meu-endpoint.js
import { MeuWebhook } from '../src/webhooks/meu-webhook.js';

export const config = {
  api: { bodyParser: false }
};

const webhook = new MeuWebhook();

export default async function handler(req, res) {
  return await webhook.handle(req);
}
```

### 3. Configurar Variáveis de Ambiente

```bash
# .env ou .env.production
MEU_WEBHOOK_SECRET=seu_segredo_aqui
PAYMENT_WEBHOOK_SECRET=stripe_whsec_xxx
GITHUB_WEBHOOK_SECRET=github_secret_xxx
```

## 🔒 Tipos de Validação

### HMAC SHA256 (Padrão)
```javascript
validationType: 'hmac'
```
- Usado pela maioria dos serviços
- Header esperado: `X-Webhook-Signature`
- Compara HMAC SHA256 do payload

### Stripe
```javascript
validationType: 'stripe'
```
- Específico para Stripe
- Header esperado: `Stripe-Signature`
- Valida timestamp + assinatura

### Sem Validação
```javascript
validationType: 'none'
```
- Use apenas em ambientes controlados
- Não requer assinatura
- Considere usar `allowedIPs`

## 📝 Logging

Todos os webhooks são automaticamente registrados em:

```
api/logs/webhooks/webhook-YYYY-MM-DD.log
```

Formato do log:
```json
{
  "timestamp": "2025-10-08T12:00:00.000Z",
  "webhook": "payment-webhook",
  "method": "POST",
  "ip": "192.168.1.1",
  "userAgent": "Stripe/1.0",
  "success": true,
  "payloadSize": 1234,
  "responseTime": 45
}
```

### Ler Logs

```javascript
import { readWebhookLogs } from '../src/middleware/webhook-logger.js';

const logs = await readWebhookLogs('2025-10-08');
console.log(logs);
```

## 🛡️ Segurança

### 1. Validação de Assinatura

Sempre use validação de assinatura em produção:

```javascript
super({
  validationType: 'hmac', // ou 'stripe'
  secret: process.env.WEBHOOK_SECRET
});
```

### 2. IP Whitelist (Opcional)

```javascript
super({
  allowedIPs: [
    '192.168.1.100',
    '10.0.0.50'
  ]
});
```

### 3. Variáveis de Ambiente

Nunca commite secrets no código:

```javascript
// ✅ Correto
secret: process.env.WEBHOOK_SECRET

// ❌ Errado
secret: 'meu_segredo_123'
```

## 🎯 Exemplos de Uso

### Payment Webhook (Stripe/Mercado Pago)

```bash
# Endpoint
POST https://saraivavision.com.br/api/webhooks/payment

# Headers
Content-Type: application/json
Stripe-Signature: t=1234567890,v1=abc123...

# Body
{
  "type": "payment.succeeded",
  "data": {
    "id": "pay_123",
    "amount": 5000,
    "currency": "brl",
    "customer": "cus_abc"
  }
}
```

### GitHub Webhook

```bash
# Endpoint
POST https://saraivavision.com.br/api/webhooks/github

# Headers
Content-Type: application/json
X-GitHub-Event: push
X-Hub-Signature-256: sha256=abc123...

# Body
{
  "ref": "refs/heads/main",
  "commits": [...],
  "repository": {...}
}
```

### Form Webhook

```bash
# Endpoint
POST https://saraivavision.com.br/api/webhooks/form

# Body
{
  "name": "João Silva",
  "email": "joao@example.com",
  "message": "Gostaria de agendar uma consulta",
  "phone": "+5511999999999"
}
```

## 🧪 Testes

### Teste Local com cURL

```bash
# Gerar assinatura HMAC
echo -n '{"test":"data"}' | openssl dgst -sha256 -hmac "seu_secret" | cut -d' ' -f2

# Enviar requisição
curl -X POST http://localhost:3000/api/webhooks/payment \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: ASSINATURA_GERADA" \
  -d '{"test":"data"}'
```

### Teste com Postman

1. Criar nova requisição POST
2. URL: `http://localhost:3000/api/webhooks/payment`
3. Headers:
   - `Content-Type: application/json`
   - `X-Webhook-Signature: sua_assinatura`
4. Body (raw JSON):
   ```json
   {
     "type": "payment.succeeded",
     "data": {...}
   }
   ```

### Teste Automatizado

```javascript
// __tests__/webhooks/payment.test.js
import { PaymentWebhook } from '../../src/webhooks/payment-webhook.js';

describe('PaymentWebhook', () => {
  it('deve processar pagamento com sucesso', async () => {
    const webhook = new PaymentWebhook();
    const result = await webhook.process({
      type: 'payment.succeeded',
      data: { id: 'pay_123', amount: 5000 }
    });

    expect(result.processed).toBe(true);
  });
});
```

## 🔧 Configuração de Provedores

### Stripe

1. Dashboard → Developers → Webhooks
2. Adicionar endpoint: `https://saraivavision.com.br/api/webhooks/payment`
3. Copiar Webhook Signing Secret
4. Adicionar em `.env.production`:
   ```
   PAYMENT_WEBHOOK_SECRET=whsec_xxxxx
   ```

### GitHub

1. Repository Settings → Webhooks → Add webhook
2. Payload URL: `https://saraivavision.com.br/api/webhooks/github`
3. Content type: `application/json`
4. Secret: Gerar string aleatória
5. Adicionar em `.env.production`:
   ```
   GITHUB_WEBHOOK_SECRET=seu_secret_aqui
   ```

## 📊 Monitoramento

### Verificar Logs

```bash
# Ver logs do dia
tail -f api/logs/webhooks/webhook-$(date +%Y-%m-%d).log

# Filtrar por webhook específico
grep "payment-webhook" api/logs/webhooks/webhook-*.log

# Contar sucessos/erros
grep '"success":true' api/logs/webhooks/webhook-*.log | wc -l
grep '"success":false' api/logs/webhooks/webhook-*.log | wc -l
```

### Health Check

```javascript
// api/webhooks/health.js
export default async function handler(req, res) {
  return res.status(200).json({
    status: 'ok',
    webhooks: ['payment', 'github', 'form'],
    timestamp: new Date().toISOString()
  });
}
```

## ⚠️ Troubleshooting

### Erro: "Assinatura inválida"

1. Verificar se `WEBHOOK_SECRET` está correto
2. Confirmar que `bodyParser: false` está configurado
3. Verificar encoding do payload (deve ser UTF-8)
4. Checar se headers estão corretos

### Erro: "IP não autorizado"

1. Verificar IP do provedor de webhook
2. Adicionar IP na lista `allowedIPs`
3. Ou remover validação de IP se não necessário

### Webhook não está sendo recebido

1. Verificar URL do endpoint
2. Confirmar que servidor está acessível
3. Verificar logs do provedor
4. Testar com cURL localmente

## 📚 Recursos

- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [GitHub Webhooks](https://docs.github.com/en/webhooks)
- [HMAC Authentication](https://www.okta.com/identity-101/hmac/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

## 🤝 Contribuindo

Para adicionar novo webhook:

1. Criar classe em `api/src/webhooks/`
2. Estender `BaseWebhook`
3. Implementar método `process()`
4. Criar API route em `api/webhooks/`
5. Adicionar documentação
6. Adicionar testes

---

**Atualizado:** 2025-10-08
**Versão:** 1.0.0
