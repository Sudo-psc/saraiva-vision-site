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
- **Backend**: Node.js + Express + Supabase
- **Deploy**: VPS nativo (sem Docker)
- **Server**: Nginx + PHP-FPM + MySQL + Redis

---

**Status**: ✅ Produção
**URL**: https://saraivavision.com.br
**Compliance**: CFM + LGPD
