# Guia de Implementação On-Premises - HashiCorp Vault

## Resumo para Ação Imediata

Baseado na confirmação de infraestrutura **on-premises**, aqui está um plano prático para implementar configuração centralizada com **HashiCorp Vault** - solução open source, gratuita e ideal para controle total.

## Por que HashiCorp Vault?

- ✅ **Totalmente gratuito** (open source)
- ✅ **Controle completo** sobre dados e segurança
- ✅ **Compliance LGPD** (dados nunca saem do Brasil)
- ✅ **Integração LDAP/AD** para autenticação
- ✅ **Performance máxima** em rede local

## Implementação em 4 Fases

### Fase 1: Setup do Servidor (1 dia)

```bash
# 1. Criar diretório de trabalho
sudo mkdir -p /opt/vault
cd /opt/vault

# 2. Instalar Docker (se não tiver)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 3. Criar docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  vault:
    image: vault:1.15.0
    container_name: vault
    ports:
      - "8200:8200"
    environment:
      - VAULT_ADDR=http://0.0.0.0:8200
      - VAULT_API_ADDR=http://0.0.0.0:8200
      - VAULT_DEV_ROOT_TOKEN_ID=root
    volumes:
      - ./data:/vault/data
      - ./config:/vault/config
    cap_add:
      - IPC_LOCK
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: vault-redis
    ports:
      - "6379:6379"
    volumes:
      - ./redis-data:/data
    restart: unless-stopped

  prometheus:
    image: prom/prometheus:latest
    container_name: vault-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    restart: unless-stopped
EOF

# 4. Criar estrutura de diretórios
mkdir -p data config redis-data

# 5. Iniciar serviços
docker-compose up -d
```

### Fase 2: Configuração Básica (1 dia)

```bash
# 1. Verificar status
docker exec vault vault status

# 2. Exportar token root
export VAULT_TOKEN=root
export VAULT_ADDR=http://localhost:8200

# 3. Habilitar secrets engine
docker exec vault vault secrets enable -path=secret kv-v2

# 4. Criar política para Saraiva Vision
docker exec vault vault policy write saraiva-vision - <<EOF
path "secret/saraiva-vision/*" {
  capabilities = ["read", "list"]
}

path "secret/saraiva-vision/data/*" {
  capabilities = ["read", "list", "create", "update"]
}
EOF

# 5. Criar token para aplicação
docker exec vault vault token create -policy=saraiva-vision -ttl=24h
```

### Fase 3: Migração de Configurações (2-3 dias)

```bash
# Script para migrar .env para Vault
#!/bin/bash
# migrate-to-vault.sh

export VAULT_TOKEN=root
export VAULT_ADDR=http://localhost:8200

# Ler do .env e migrar
while IFS='=' read -r key value; do
  if [[ ! $key =~ ^# ]] && [[ -n $key ]]; then
    echo "Migrando $key..."
    docker exec vault vault kv put secret/saraiva-vision/$key value="$value"
  fi
done < .env.production

echo "Migração concluída!"
```

### Fase 4: Integração com Next.js (2-3 dias)

```javascript
// lib/vault-config.js
class VaultConfigLoader {
  constructor() {
    this.vaultUrl = process.env.VAULT_URL || 'http://localhost:8200'
    this.vaultToken = process.env.VAULT_TOKEN
    this.cache = new Map()
    this.cacheTimeout = 5 * 60 * 1000 // 5 minutos
  }

  async getConfig(key, useCache = true) {
    // Verificar cache
    if (useCache && this.cache.has(key)) {
      const cached = this.cache.get(key)
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.value
      }
    }

    try {
      const response = await fetch(
        `${this.vaultUrl}/v1/secret/data/saraiva-vision/${key}`,
        {
          headers: {
            'X-Vault-Token': this.vaultToken,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Vault request failed: ${response.status}`)
      }

      const data = await response.json()
      const value = data.data.data.value

      // Atualizar cache
      this.cache.set(key, {
        value,
        timestamp: Date.now()
      })

      return value
    } catch (error) {
      console.error(`Failed to get config ${key} from Vault:`, error)

      // Fallback para variáveis de ambiente
      return process.env[key] || null
    }
  }

  async getAllConfigs() {
    const configs = {}
    const keys = [
      'GOOGLE_MAPS_API_KEY',
      'GOOGLE_PLACES_API_KEY',
      'POSTHOG_API_KEY',
      'RESEND_API_KEY',
      'DATABASE_URL',
      'REDIS_URL'
    ]

    for (const key of keys) {
      configs[key] = await this.getConfig(key)
    }

    return configs
  }
}

export default new VaultConfigLoader()
```

## Configuração do Next.js

```javascript
// next.config.js
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/config/:path*',
        destination: '/api/vault-config?path=:path*'
      }
    ]
  }
}

// api/vault-config.js
import vaultConfig from '../../lib/vault-config.js'

export default async function handler(req, res) {
  const { path } = req.query

  try {
    if (path === 'all') {
      const configs = await vaultConfig.getAllConfigs()
      return res.status(200).json(configs)
    }

    const config = await vaultConfig.getConfig(path)
    if (config) {
      return res.status(200).json({ [path]: config })
    } else {
      return res.status(404).json({ error: 'Config not found' })
    }
  } catch (error) {
    console.error('Vault config error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
```

## Setup de Monitoring

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'vault'
    static_configs:
      - targets: ['vault:8200']
    metrics_path: '/v1/sys/metrics'
    params:
      format: ['prometheus']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
```

## Backup Automático

```bash
#!/bin/bash
# backup-vault.sh

BACKUP_DIR="/opt/vault/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup do Vault
docker exec vault vault operator raft snapshot save /tmp/snapshot_$DATE
docker cp vault:/tmp/snapshot_$DATE $BACKUP_DIR/

# Backup do Redis
docker exec vault-redis redis-cli BGSAVE
docker cp vault-redis:/data/dump.rdb $BACKUP_DIR/redis_$DATE.rdb

# Limpar backups antigos (manter 7 dias)
find $BACKUP_DIR -name "*" -type f -mtime +7 -delete

echo "Backup concluído: $DATE"
```

## Configuração do Sistema

```bash
# Adicionar ao crontab
crontab -e

# Backup diário às 2h
0 2 * * * /opt/vault/backup-vault.sh

# Restart automático se cair
*/5 * * * * docker ps | grep vault || docker-compose -f /opt/vault/docker-compose.yml up -d
```

## Estimativa de Recursos

### Servidor Mínimo:

- **CPU:** 2 cores
- **RAM:** 4GB
- **Storage:** 50GB SSD
- **Rede:** 1Gbps

### Custo Estimado:

- **Servidor:** R$ 200-400/mês (se alugado)
- **Hardware:** R$ 2.000-4.000 (se comprado)
- **Mão de obra:** 40-60 horas setup inicial

## Segurança Adicional

```bash
# Configurar firewall
sudo ufw allow 22/tcp
sudo ufw allow 8200/tcp
sudo ufw allow from 192.168.1.0/24 to any port 8200
sudo ufw enable

# Configurar log rotation
sudo tee /etc/logrotate.d/vault << EOF
/opt/vault/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
}
EOF
```

## Teste de Funcionamento

```bash
# Script de teste
#!/bin/bash
# test-vault.sh

echo "Testando Vault..."

# 1. Verificar se Vault está respondendo
curl -s http://localhost:8200/v1/sys/health > /dev/null
if [ $? -eq 0 ]; then
  echo "✅ Vault está online"
else
  echo "❌ Vault está offline"
  exit 1
fi

# 2. Testar leitura de configuração
curl -s -H "X-Vault-Token: root" \
  http://localhost:8200/v1/secret/data/saraiva-vision/GOOGLE_MAPS_API_KEY \
  > /dev/null

if [ $? -eq 0 ]; then
  echo "✅ Configurações acessíveis"
else
  echo "❌ Erro ao acessar configurações"
fi

# 3. Testar Redis
redis-cli -h localhost ping > /dev/null
if [ $? -eq 0 ]; then
  echo "✅ Redis está online"
else
  echo "❌ Redis está offline"
fi

echo "Teste concluído!"
```

## Próximos Passos Imediatos

1. **Hoje:** Provisionar servidor e instalar Docker
2. **Amanhã:** Deploy do Vault e configuração inicial
3. **Esta semana:** Migrar configurações críticas
4. **Próxima semana:** Integração completa com Next.js

## Suporte e Troubleshooting

### Logs Úteis:

```bash
# Logs do Vault
docker logs vault -f

# Logs do Redis
docker logs vault-redis -f

# Status completo
docker-compose ps
```

### Comandos de Emergência:

```bash
# Restart completo
docker-compose restart

# Recriar containers
docker-compose down && docker-compose up -d

# Verificar saúde do Vault
docker exec vault vault operator init -recovery-shares=1 -recovery-threshold=1
```

---

**Este guia permite implementar Vault on-premises com controle total e zero custos de licença.**
