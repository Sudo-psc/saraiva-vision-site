# Análise de Configuração Centralizada - Saraiva Vision (On-Premises)

**Para:** Philipe Saraiva Cruz  
**Data:** 18 de outubro de 2025  
**Status:** Análise Específica para Infraestrutura On-Premises

---

## 1. Resumo Executivo

Com base na análise do projeto Saraiva Vision e confirmação de infraestrutura **on-premises**, identifiquei que a implementação de configuração centralizada utilizando **HashiCorp Vault** como solução principal oferece o melhor equilíbrio entre controle, segurança e custos para ambientes locais. A arquitetura híbrida atual (Next.js + Express.js) com 30+ variáveis de ambiente beneficiar-se-á significativamente da centralização, especialmente considerando as múltiplas integrações de terceiros.

---

## 2. Situação Atual e Premissas

### Arquitetura Identificada:

- **Frontend:** Next.js 15.5.4 com React 18.3.1
- **Backend:** Express.js com API separada
- **Banco de Dados:** MySQL2 + Redis
- **Deploy:** Standalone build com scripts customizados
- **Infraestrutura:** **On-premises** (confirmado)
- **Integrações:** 15+ serviços terceirizados

### Configurações Atuais:

- 30+ variáveis de ambiente no `.env.example`
- Configurações distribuídas entre frontend e backend
- Endpoint `/api/config` para configurações públicas
- Múltiplas chaves de API expostas no ambiente

### Premissas On-Premises:

✅ **Controle total** sobre infraestrutura e dados  
✅ **Sem custos recorrentes** de serviços cloud  
✅ **Compliance local** completo (LGPD, dados no Brasil)  
⚠️ **Responsabilidade total** por manutenção e segurança  
⚠️ **Necessidade de alta disponibilidade** própria

---

## 3. Benefícios e Riscos da Configuração Centralizada (On-Premises)

### Benefícios:

✅ **Segurança máxima:** Controle completo de chaves e criptografia  
✅ **Compliance LGPD:** Dados nunca saem da infraestrutura local  
✅ **Custo zero:** Sem mensalidades de serviços cloud  
✅ **Performance:** Latência mínima em rede local  
✅ **Integração total:** Com sistemas existentes (LDAP, AD)  
✅ **Auditabilidade completa:** Logs centralizados locais

### Riscos:

⚠️ **Complexidade operacional:** Setup e manutenção do Vault  
⚠️ **Backup manual:** Responsabilidade total de backup  
⚠️ **Atualizações:** Gerenciamento de patches e segurança  
⚠️ **Escalabilidade:** Planejamento de capacidade necessário

---

## 4. Arquitetura Recomendada (On-Premises)

### Diagrama Conceitual:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Applications  │───▶│ Config Gateway   │───▶│ HashiCorp Vault │
│                 │    │                  │    │                 │
│ • Frontend      │    │ • Cache Redis    │    │ • Key/Value     │
│ • Backend API   │    │ • Validation     │    │ • Secrets       │
│ • Services      │    │ • Auth LDAP      │    │ • Policies      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │ Monitoring       │    │ Backup Storage  │
                       │ • Prometheus     │    │ • Local NAS     │
                       │ • Grafana        │    │ • Off-site      │
                       │ • Alerts         │    │ • Encryption    │
                       └──────────────────┘    └─────────────────┘
```

### Componentes On-Premises:

1. **HashiCorp Vault:** Core de gerenciamento de segredos
2. **Redis Cache:** Cache local para performance
3. **Config Gateway:** API local com autenticação LDAP
4. **Monitoring:** Prometheus + Grafana local
5. **Backup:** Storage local + off-site

---

## 5. Comparação de Opções On-Premises

### Opção 1: HashiCorp Vault (RECOMENDADO)

**Prós:**

- Open source e gratuito
- Controle completo de segredos
- Integração com LDAP/Active Directory
- Alta disponibilidade com clustering
- Audit logging detalhado
- Suporte a múltiplos backends

**Contras:**

- Complexidade inicial de setup
- Requer conhecimento de DevOps
- Necessita servidor dedicado

**Caso ideal:** Saraiva Vision - controle total + zero custos recorrentes

### Opção 2: Consul + Vault

**Prós:**

- Service discovery integrado
- Health checking automático
- Multi-datacenter support
- Interface web completa

**Contras:**

- Maior complexidade operacional
- Mais servidores necessários
- Curva de aprendizado elevada

**Caso ideal:** Empresas com múltiplos microserviços

### Opção 3: Self-hosted Config Server (Node.js)

**Prós:**

- Stack JavaScript (mesmo do projeto)
- Customização total
- Simplicidade relativa
- Integração fácil com Next.js

**Contras:**

- Recurso limitado comparado ao Vault
- Segurança depende da implementação
- Menos recursos enterprise

**Caso ideal:** Times pequenos com restrição de complexidade

---

## 6. Requisitos Não Funcionais (On-Premises)

### Alta Disponibilidade:

- **SLA:** 99.9% uptime (auto-gerenciado)
- **Redundância:** 2+ servidores Vault em cluster
- **Failover:** Automático com Raft consensus
- **Backup:** Diário para NAS + semanal off-site

### Performance:

- **Latência:** < 10ms (rede local)
- **Throughput:** 500+ requests/segundo
- **Cache:** Redis com TTL configurável
- **Cold Start:** < 2 segundos (local)

### Segurança:

- **Criptografia:** AES-256 em repouso (local)
- **Autenticação:** LDAP/Active Directory
- **Autorização:** RBAC integrado com AD groups
- **Auditoria:** Logs em storage local com retenção

---

## 7. Plano de Implementação On-Premises

### Fase 1: Setup Infraestrutura (Semanas 1-2)

- [ ] Provisionar servidor dedicado (mínimo 4GB RAM, 2 CPU)
- [ ] Instalar Docker/Docker Compose
- [ ] Setup rede interna e firewall
- [ ] Configurar backups automáticos

### Fase 2: Vault Setup (Semanas 3-4)

- [ ] Deploy HashiCorp Vault em Docker
- [ ] Configurar unseal keys e recovery keys
- [ ] Setup autenticação LDAP/AD
- [ ] Criar policies iniciais

### Fase 3: Prova de Conceito (Semanas 5-6)

- [ ] Migrar 3-5 configurações críticas
- [ ] Implementar cache Redis
- [ ] Testar performance e segurança
- [ ] Configurar monitoring básico

### Fase 4: Migração Completa (Semanas 7-8)

- [ ] Migrar todas as configurações
- [ ] Implementar rotação automática
- [ ] Setup monitoring completo
- [ ] Documentação e treinamento

---

## 8. Plano de Migração e Rollback (On-Premises)

### Estratégia de Migração:

1. **Setup Paralelo:** Vault ao lado do sistema atual
2. **Shadow Mode:** Aplicações lêem de ambos os sistemas
3. **Canary:** 20% do tráfego usa Vault
4. **Gradual:** 50% → 80% → 100%
5. **Cutover:** Desativação do sistema antigo

### Rollback Plan:

- **Trigger:** Taxa de erro > 3% ou Vault indisponível > 30s
- **Action:** Switch automático para variáveis de ambiente locais
- **Timeline:** Rollback completo em < 1 minuto
- **Validation:** Health checks locais automatizados

---

## 9. Segurança e Governança On-Premises

### Gerenciamento de Segredos:

```bash
# Setup inicial do Vault
docker run -d --name vault \
  -p 8200:8200 \
  -e VAULT_ADDR=http://localhost:8200 \
  -e VAULT_DEV_ROOT_TOKEN_ID=root \
  vault:latest

# Configurar política para Saraiva Vision
vault policy write saraiva-vision - <<EOF
path "secret/saraiva-vision/*" {
  capabilities = ["read", "list"]
}
EOF

# Armazenar API keys
vault kv put secret/saraiva-vision/google-maps \
  api_key="AIza..." \
  places_api_key="AIza..."
```

### Integração LDAP/Active Directory:

```hcl
# vault/config.ld
```
