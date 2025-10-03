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
- **Next.js Migration**: [`docs/NEXTJS_MIGRATION_GUIDE.md`](./docs/NEXTJS_MIGRATION_GUIDE.md) - 🚧 Migração para Next.js 15

## 🛠️ Development

```bash
npm run dev              # Desenvolvimento (porta 3002)
npm run build            # Build para produção
npm test                 # Testes
```

## 📦 Tech Stack

- **Frontend**: React 18 + Vite + TypeScript + Tailwind
- **Backend**: Node.js + Express + Supabase
- **Deploy**: VPS nativo (sem Docker)
- **Server**: Nginx + PHP-FPM + MySQL + Redis

---

**Status**: ✅ Produção
**URL**: https://saraivavision.com.br
**Compliance**: CFM + LGPD
