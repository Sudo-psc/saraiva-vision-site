# Saraiva Vision

Plataforma médica oftalmológica com compliance CFM/LGPD.

## 🚀 Quick Deploy

### No VPS (já logado):

```bash
sudo bash /home/saraiva-vision-site/DEPLOY_NOW.sh
```

**Pronto!** O script faz tudo automaticamente:
- ✅ Corrige cache headers do Nginx
- ✅ Backup automático da produção
- ✅ Deploy do novo build
- ✅ Validação completa

## 📚 Documentação Completa

- **Deploy Guide**: [`docs/deployment/DEPLOYMENT_GUIDE.md`](./docs/deployment/DEPLOYMENT_GUIDE.md) - Guia completo de deployment
- **Projeto**: [`CLAUDE.md`](./CLAUDE.md) - Documentação principal do projeto
- **Troubleshooting**: [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md) - Resolução de problemas
- **Security**: [`SECURITY.md`](./SECURITY.md) - Práticas de segurança

## 🛠️ Development

```bash
npm run dev              # Desenvolvimento (porta 3002)
npm run build:vite       # Build para produção (Vite)
npm test                 # Testes
```

## 📝 Conventional Commits

Este projeto utiliza [Conventional Commits](https://www.conventionalcommits.org/) para geração automática de changelog.

```bash
# Exemplos de commits
git commit -m "feat: adiciona agendamento online"
git commit -m "fix(blog): corrige carregamento de imagens"
git commit -m "docs: atualiza guia de contribuição"

# Gerar release
npm run release          # Gera changelog e nova versão automaticamente
npm run release:dry-run  # Simula release sem fazer mudanças
```

📚 **Guias**:
- [Guia de Conventional Commits](docs/CONVENTIONAL_COMMITS_GUIDE.md)
- [Sistema de Changelog](docs/CHANGELOG_AUTOMATION.md)
- [Como Contribuir](CONTRIBUTING.md)

## ✅ Checkup de Sistema

Execute o checkup completo e gere relatórios de saúde:

```bash
npm run check:system
```

Instale a rotina automática com cron para monitoramento recorrente:

```bash
CRON_SCHEDULE="0 */6 * * *" npm run install:checkup-cron
```

Os relatórios são armazenados em `reports/system-checkup/`.

## 📦 Tech Stack

- **Frontend**: React 18 + Vite + TypeScript + Tailwind
- **Backend**: Node.js + Express
- **Blog**: Static data (src/data/blogPosts.js)
- **Deploy**: VPS nativo (sem Docker)
- **Server**: Nginx + MySQL + Redis

---

**Status**: ✅ Produção
**URL**: https://saraivavision.com.br
**Compliance**: CFM + LGPD
