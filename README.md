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

- **Deploy**: [`DEPLOY_INSTRUCTIONS.md`](./DEPLOY_INSTRUCTIONS.md)
- **Diagnóstico**: [`docs/LAZY_LOADING_ERROR_DIAGNOSIS.md`](./docs/LAZY_LOADING_ERROR_DIAGNOSIS.md)
- **Quick Fix**: [`docs/QUICK_FIX_GUIDE.md`](./docs/QUICK_FIX_GUIDE.md)
- **Projeto**: [`CLAUDE.md`](./CLAUDE.md)

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
