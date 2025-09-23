# Sistema de Dados Reais do Instagram

Sistema completo para buscar e exibir dados reais do Instagram @saraiva_vision com cache persistente e cron job automático.

## 🎯 Características

- **✅ Dados Reais**: Busca posts reais do Instagram via API
- **✅ Cache Persistente**: Cache de 24h no banco Supabase
- **✅ Cron Job Automático**: Atualização diária às 6h
- **✅ Fallback Inteligente**: Dados realistas quando API indisponível
- **✅ Sistema Resiliente**: Múltiplos métodos de fetch
- **✅ Zero Dependência**: Funciona sem configuração adicional

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Endpoints  │    │   Supabase DB   │
│                 │    │                  │    │                 │
│ InstagramWidget │◄──►│ /api/instagram/  │◄──►│ instagram_cache │
│                 │    │ posts            │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              ▲
                              │
                    ┌──────────────────┐
                    │   Cron Job       │
                    │                  │
                    │ /api/instagram/  │
                    │ fetch            │
                    │ (6h diariamente) │
                    └──────────────────┘
```

## 📁 Estrutura de Arquivos

```
src/services/
├── instagramEmbedService.js    # Serviço frontend (atualizado)
└── instagramRealService.js     # Serviço de fetch real (novo)

api/instagram/
├── posts.js                    # API para servir posts (atualizado)
└── fetch.js                    # API para cron job (novo)

database/migrations/
└── 002_instagram_cache.sql     # Migração da tabela cache (novo)

scripts/
└── test-instagram-system.js    # Script de testes (novo)
```

## 🔧 Configuração

### 1. Variáveis de Ambiente

```bash
# Obrigatórias (já configuradas)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Opcionais (para dados reais do Instagram)
INSTAGRAM_ACCESS_TOKEN=your-instagram-access-token
CRON_SECRET=your-secure-secret

# Se não configuradas, o sistema usa dados de fallback realistas
```

### 2. Banco de Dados

Execute a migração para criar a tabela de cache:

```sql
-- A migração está em database/migrations/002_instagram_cache.sql
-- Criar tabela instagram_cache com campos adequados
```

### 3. Cron Job

O cron job está configurado no `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/instagram/fetch",
      "schedule": "0 6 * * *"
    }
  ]
}
```

## 🔄 Fluxo de Operação

### 1. Busca de Posts (`/api/instagram/posts`)

```
1. Verificar cache no banco (válido por 24h)
2. Se cache válido → retornar dados cached
3. Se cache inválido → tentar buscar do Instagram API
4. Se API disponível → salvar no cache e retornar
5. Se API indisponível → usar dados de fallback realistas
```

### 2. Atualização Automática (`/api/instagram/fetch`)

```
1. Cron job executa diariamente às 6h
2. Tenta buscar dados reais do Instagram
3. Se sucesso → salva no cache do banco
4. Se falha → mantém cache existente
5. Log de resultados para monitoring
```

### 3. Métodos de Fetch

O sistema tenta múltiplos métodos em ordem:

1. **Instagram Basic Display API** (se token configurado)
2. **RSS Feeds Alternativos** (rsshub.app, etc.)
3. **oEmbed Batch** (posts conhecidos)
4. **Web Scraping** (último recurso)

## 📊 Dados Retornados

### Formato de Post

```json
{
  "id": "post_id",
  "username": "saraiva_vision",
  "caption": "Caption do post...",
  "imageUrl": "/path/to/image.jpg",
  "timestamp": "2024-09-23T10:00:00.000Z",
  "likes": 150,
  "comments": 25,
  "timeAgo": "2 dias atrás",
  "engagementRate": "9.5",
  "postUrl": "https://www.instagram.com/p/...",
  "profilePicture": "/images/drphilipe_perfil.webp",
  "isVerified": true,
  "source": "instagram_api"
}
```

### Resposta da API

```json
{
  "success": true,
  "posts": [...],
  "profileStats": {
    "followers": "1.8K",
    "following": "89",
    "posts": 127,
    "averageLikes": 165,
    "averageComments": 23,
    "engagementRate": "10.2"
  },
  "source": "cached_real",
  "fromCache": true,
  "timestamp": "2024-09-23T06:00:00.000Z",
  "total": 6
}
```

## 🧪 Testes

Execute o script de testes:

```bash
node scripts/test-instagram-system.js
```

O script testa:
- ✅ Conexão com banco de dados
- ✅ Funcionamento do cache
- ✅ API de posts
- ✅ Cron job de fetch
- ✅ Sistema de fallback

## 🔒 Segurança

### 1. Autenticação do Cron Job

```javascript
const authHeader = req.headers.authorization;
const cronSecret = process.env.CRON_SECRET;

if (authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
}
```

### 2. Validação de Dados

- Sanitização de captions
- Validação de URLs
- Timeout em requests externos
- Rate limiting implícito (24h cache)

### 3. Fallback Seguro

- Dados de fallback não contêm informações sensíveis
- Cache com expiração automática
- Graceful degradation

## 📈 Monitoramento

### 1. Logs Importantes

```javascript
// Sucesso do cron job
console.log('Instagram data fetched successfully', {
    source: 'instagram_api',
    posts: 10,
    timestamp: '2024-09-23T06:00:00.000Z'
});

// Fallback ativado
console.warn('Instagram API failed, using fallback data');

// Cache hit
console.info('Serving cached Instagram data', { age: '2h' });
```

### 2. Métricas de Performance

- Cache hit ratio
- API response time
- Fallback usage rate
- Data freshness

## 🚀 Deploy

### 1. Vercel

O sistema está totalmente configurado para Vercel:

- Cron jobs automáticos
- Funções serverless
- Variáveis de ambiente
- Cache persistente

### 2. Variáveis de Produção

Configure no painel da Vercel:

```
INSTAGRAM_ACCESS_TOKEN=your_real_token
CRON_SECRET=secure_random_string
VITE_SUPABASE_URL=your_production_url
VITE_SUPABASE_SERVICE_ROLE_KEY=your_production_key
```

## 🎛️ Operação

### 1. Modo Fallback (Padrão)

- **Configuração**: Não configure `INSTAGRAM_ACCESS_TOKEN`
- **Comportamento**: Usa dados realistas da Saraiva Vision
- **Vantagem**: Zero configuração, sempre funciona
- **Desvantagem**: Dados não atualizados automaticamente

### 2. Modo Real Data

- **Configuração**: Configure `INSTAGRAM_ACCESS_TOKEN`
- **Comportamento**: Busca dados reais do Instagram
- **Vantagem**: Dados sempre atualizados
- **Desvantagem**: Depende da API do Instagram

### 3. Modo Híbrido (Recomendado)

- **Configuração**: Configure token + fallback realista
- **Comportamento**: Dados reais quando possível, fallback quando necessário
- **Vantagem**: Melhor experiência do usuário
- **Desvantagem**: Configuração um pouco mais complexa

## 📚 Troubleshooting

### Problema: Nenhum post aparece

**Solução**:
1. Verificar logs do browser console
2. Testar API: `curl http://localhost:3000/api/instagram/posts`
3. Executar script de teste
4. Verificar configuração do Supabase

### Problema: Dados não atualizam

**Solução**:
1. Verificar se cron job está executando
2. Verificar logs do `/api/instagram/fetch`
3. Testar manualmente o endpoint de fetch
4. Verificar token do Instagram

### Problema: Cache não funciona

**Solução**:
1. Verificar migração do banco
2. Verificar permissões do Supabase
3. Verificar logs de erro da API
4. Limpar cache: `DELETE FROM instagram_cache WHERE id = 'saraiva_vision_cache'`

## 🔮 Futuras Melhorias

- [ ] Stories do Instagram
- [ ] Múltiplas contas
- [ ] Analytics de engajamento
- [ ] Moderação de conteúdo
- [ ] Integração com outros social media
- [ ] Dashboard de métricas

---

**Sistema desenvolvido para a Saraiva Vision** - Dados reais do Instagram com máxima confiabilidade e performance.