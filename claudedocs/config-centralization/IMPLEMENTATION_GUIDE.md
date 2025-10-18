# Guia de Implementação Rápida

## Resumo para Ação Imediata

Baseado na análise do seu projeto, aqui está um plano prático para começar imediatamente com configuração centralizada, mesmo sem todas as informações específicas.

## Opção Recomendada: AWS Parameter Store + Secrets Manager

### Por quê?

- ✅ Já usa múltiplos serviços (Google Maps, PostHog, etc.)
- ✅ Sem complexidade operacional inicial
- ✅ Custos baixos para começar (~$10-50/mês)
- ✅ Escala conforme necessário

## Implementação em 3 Fases

### Fase 1: Setup Básico (1-2 dias)

```bash
# 1. Instalar AWS CLI e configurar
aws configure

# 2. Criar estrutura de parâmetros
aws ssm put-parameter \
  --name "/saraiva-vision/dev/database/host" \
  --value "localhost" \
  --type "String"

aws ssm put-parameter \
  --name "/saraiva-vision/dev/google-maps/api-key" \
  --value "your-api-key" \
  --type "SecureString"
```

### Fase 2: Integração com Código (2-3 dias)

```javascript
// lib/aws-config.js
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'

const ssmClient = new SSMClient({ region: 'us-east-1' })

export async function getConfig(parameterName, withDecryption = false) {
  try {
    const command = new GetParameterCommand({
      Name: parameterName,
      WithDecryption: withDecryption
    })

    const response = await ssmClient.send(command)
    return response.Parameter.Value
  } catch (error) {
    console.error(`Failed to get config ${parameterName}:`, error)
    throw error
  }
}

// Uso no seu código
const dbHost = await getConfig('/saraiva-vision/prod/database/host')
const mapsApiKey = await getConfig(
  '/saraiva-vision/prod/google-maps/api-key',
  true
)
```

### Fase 3: Migração Gradual (1 semana)

```bash
# Script de migração
#!/bin/bash
# migrate-to-aws-config.sh

# Ler do .env e migrar para AWS
while IFS='=' read -r key value; do
  if [[ ! $key =~ ^# ]]; then
    aws ssm put-parameter \
      --name "/saraiva-vision/prod/$key" \
      --value "$value" \
      --type "SecureString" \
      --overwrite
  fi
done < .env.production
```

## Configuração do Next.js

```javascript
// next.config.js
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/config/:path*',
        destination: '/api/config-handler?path=:path*'
      }
    ]
  }
}

// api/config-handler.js
import { getConfig } from '../../lib/aws-config.js'

export default async function handler(req, res) {
  const { path } = req.query

  try {
    const config = await getConfig(
      `/saraiva-vision/${process.env.NODE_ENV}/${path}`,
      true
    )
    res.status(200).json({ [path]: config })
  } catch (error) {
    res.status(500).json({ error: 'Config not found' })
  }
}
```

## Monitoramento Básico

```yaml
# .github/workflows/config-monitor.yml
name: Config Health Check

on:
  schedule:
    - cron: '*/5 * * * *' # A cada 5 minutos

jobs:
  check-config:
    runs-on: ubuntu-latest
    steps:
      - name: Check AWS Config
        run: |
          aws ssm get-parameter \
            --name "/saraiva-vision/prod/health-check" \
            --with-decryption || echo "Config service down"
```

## Custos Estimados

- **Parameter Store:** ~$0.05 por 10,000 requests
- **Secrets Manager:** ~$0.40 por secret/mês + $0.05 por 10,000 API calls
- **Total inicial:** ~$10-30/mês

## Próximos Passos Imediatos

1. **Hoje:** Criar conta AWS (se não tiver)
2. **Amanhã:** Setup básico com 2-3 parâmetros
3. **Esta semana:** Integrar com 1 serviço crítico
4. **Próxima semana:** Migrar configurações principais

## Rollback Simples

```javascript
// Fallback para .env local
const config =
  (await getConfig('/saraiva-vision/prod/api-key')) ||
  process.env.API_KEY ||
  'default-value'
```

---

**Este guia permite começar imediatamente com risco mínimo e investimento baixo.**
