# Webhook System - Guia Rápido

## 🎯 Começando em 5 minutos

### 1. Configuração Inicial

```bash
# Copiar exemplo de configuração
cp api/webhooks/.env.example api/.env

# Editar e adicionar seus secrets
nano api/.env
```

### 2. Testar Webhook Localmente

```bash
# Terminal 1: Iniciar servidor Next.js
cd /home/saraiva-vision-site
npm run dev

# Terminal 2: Gerar assinatura e testar
cd api/utils
node generate-webhook-signature.js hmac '{"test":"data"}' mysecret
```

Copie o comando cURL gerado e execute:

```bash
curl -X POST http://localhost:3000/api/webhooks/payment \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: <assinatura_gerada>" \
  -d '{"type":"payment.succeeded","data":{"id":"pay_test","amount":5000}}'
```

### 3. Criar Seu Primeiro Webhook Customizado

**Arquivo:** `api/src/webhooks/meu-webhook.js`

```javascript
import { BaseWebhook } from './base-webhook.js';

export class MeuWebhook extends BaseWebhook {
  constructor() {
    super({
      name: 'meu-webhook',
      secret: process.env.MEU_WEBHOOK_SECRET,
      validationType: 'hmac' // ou 'stripe', 'none'
    });
  }

  async process(payload) {
    // Sua lógica aqui
    console.log('Dados recebidos:', payload);

    return {
      processed: true,
      message: 'Webhook processado!'
    };
  }
}
```

**Arquivo:** `api/webhooks/meu-endpoint.js`

```javascript
import { MeuWebhook } from '../src/webhooks/meu-webhook.js';

export const config = {
  api: { bodyParser: false }
};

const webhook = new MeuWebhook();
export default async function handler(req) {
  return await webhook.handle(req);
}
```

### 4. Adicionar ao .env

```bash
MEU_WEBHOOK_SECRET=seu_secret_aqui
```

### 5. Testar Novo Webhook

```bash
# Gerar assinatura
node api/utils/generate-webhook-signature.js hmac \
  '{"nome":"João","email":"joao@test.com"}' \
  seu_secret_aqui

# Testar endpoint
curl -X POST http://localhost:3000/api/webhooks/meu-endpoint \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: <assinatura>" \
  -d '{"nome":"João","email":"joao@test.com"}'
```

## 📋 Webhooks Disponíveis

| Endpoint | Tipo | Uso |
|----------|------|-----|
| `/api/webhooks/payment` | Stripe | Pagamentos, assinaturas |
| `/api/webhooks/github` | HMAC | CI/CD, deploys |
| `/api/webhooks/form` | None | Formulários (sem validação) |

## 🔒 Tipos de Validação

### HMAC SHA256 (Recomendado)
```javascript
validationType: 'hmac'
// Header: X-Webhook-Signature
```

### Stripe
```javascript
validationType: 'stripe'
// Header: Stripe-Signature
```

### Sem Validação (Apenas desenvolvimento)
```javascript
validationType: 'none'
// Sem headers de segurança
```

## 🧪 Executar Testes

```bash
# Todos os testes de webhook
npm run test:api -- api/__tests__/webhooks

# Teste específico
npx vitest run api/__tests__/webhooks/payment-webhook.test.js
```

## 📊 Logs

Ver logs de webhooks:

```bash
# Logs do dia
tail -f api/logs/webhooks/webhook-$(date +%Y-%m-%d).log

# Filtrar por webhook
grep "payment-webhook" api/logs/webhooks/*.log

# Contar sucessos
grep '"success":true' api/logs/webhooks/*.log | wc -l
```

## 🚀 Deploy em Produção

1. **Configurar secrets em produção:**
   ```bash
   # Editar .env.production
   nano /home/saraiva-vision-site/api/.env.production
   ```

2. **Configurar webhook no provedor:**
   - **Stripe:** Dashboard → Developers → Webhooks
   - **GitHub:** Settings → Webhooks
   - URL: `https://saraivavision.com.br/api/webhooks/[endpoint]`

3. **Testar em produção:**
   ```bash
   # Enviar teste do dashboard do provedor
   # OU usar cURL com assinatura válida
   ```

4. **Monitorar:**
   ```bash
   # Logs em tempo real
   tail -f api/logs/webhooks/webhook-*.log

   # Ver últimos 100 eventos
   tail -100 api/logs/webhooks/webhook-$(date +%Y-%m-%d).log | jq
   ```

## 🛠️ Utilitários

### Gerar Assinatura HMAC

```bash
node api/utils/generate-webhook-signature.js hmac \
  '{"data":"example"}' \
  my_secret_key
```

### Gerar Assinatura Stripe

```bash
node api/utils/generate-webhook-signature.js stripe \
  '{"event":"test"}' \
  whsec_test_secret
```

## 🔍 Troubleshooting

### "Assinatura inválida"
- ✅ Verificar `WEBHOOK_SECRET` está correto
- ✅ Confirmar `bodyParser: false` na API route
- ✅ Verificar encoding (UTF-8)

### "IP não autorizado"
- ✅ Adicionar IP em `allowedIPs: ['192.168.1.1']`
- ✅ Ou remover validação de IP

### Webhook não recebe
- ✅ Verificar URL está acessível
- ✅ Verificar firewall/nginx
- ✅ Testar com cURL local primeiro

## 📚 Documentação Completa

Ver `api/webhooks/README.md` para documentação detalhada.

## 💡 Exemplos Práticos

### Processar Pagamento Stripe

```javascript
async handlePaymentSucceeded(data) {
  // 1. Atualizar pedido no banco
  await database.orders.update({
    where: { paymentId: data.id },
    data: { status: 'paid' }
  });

  // 2. Enviar email de confirmação
  await sendEmail({
    to: data.customer.email,
    subject: 'Pagamento aprovado!',
    template: 'payment-success'
  });

  // 3. Liberar produto
  await grantAccess(data.customer.id, data.metadata.productId);

  return { processed: true };
}
```

### Integrar com GitHub

```javascript
async handlePush(data) {
  const { ref, repository } = data;

  // Deploy automático na branch main
  if (ref === 'refs/heads/main') {
    await triggerDeploy({
      repo: repository.name,
      branch: 'main',
      commit: data.after
    });
  }

  return { deployed: ref === 'refs/heads/main' };
}
```

### Processar Formulário

```javascript
async process(payload) {
  const { name, email, message } = payload;

  // 1. Salvar no banco
  const submission = await db.submissions.create({
    data: { name, email, message }
  });

  // 2. Notificar equipe
  await sendSlackNotification({
    channel: '#contato',
    text: `Nova mensagem de ${name}: ${message}`
  });

  // 3. Email automático
  await sendEmail({
    to: email,
    subject: 'Recebemos sua mensagem',
    template: 'contact-received'
  });

  return { submissionId: submission.id };
}
```

---

**Pronto para usar!** 🎉

Para mais detalhes, consulte `README.md` ou os testes em `__tests__/webhooks/`.
