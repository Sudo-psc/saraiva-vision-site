# ⚡ Quick Start - Saraiva Vision Deploy

## 🚀 Deploy em 3 Comandos

### 1. Deploy Completo (Produção)
```bash
cd /home/saraiva-vision-site
sudo npm run deploy:production
```

### 2. Rollback (se necessário)
```bash
sudo npm run deploy:rollback
```

### 3. Health Check
```bash
npm run deploy:health
```

---

## 📋 Checklist Pré-Deploy

- [ ] Código commitado no Git
- [ ] Testes passando: `npm run test:run`
- [ ] Build local OK: `npm run preview`
- [ ] Sem erros de lint: `npm run lint`

---

## 🔄 Workflow Típico

```bash
# 1. Fazer mudanças no código
vim src/components/MyComponent.jsx

# 2. Testar localmente
npm run dev:vite

# 3. Build e preview
npm run build:vite
npm run preview

# 4. Deploy para produção
sudo npm run deploy:production

# 5. Verificar
curl -I https://saraivavision.com.br
```

---

## 🆘 Problemas Comuns

### Site não carrega após deploy
```bash
# Fazer rollback imediato
sudo npm run deploy:rollback
```

### Ver logs de deploy
```bash
ls -lt /home/saraiva-vision-site/claudelogs/deploy/ | head -5
tail -100 /home/saraiva-vision-site/claudelogs/deploy/deploy_*.log
```

### Ver logs Nginx
```bash
sudo tail -50 /var/log/nginx/saraivavision_error.log
```

### Verificar release ativa
```bash
readlink -f /var/www/saraivavision/current
```

---

## 📚 Documentação Completa

- **Deploy Guide**: [DEPLOY.md](DEPLOY.md)
- **Melhorias**: [IMPROVEMENTS_2025-10-05.md](IMPROVEMENTS_2025-10-05.md)
- **Configurações**: [vite.config.js](vite.config.js)
- **Nginx**: [docs/nginx-examples/nginx-optimized.conf](docs/nginx-examples/nginx-optimized.conf)

---

## 🔧 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run deploy:production` | Deploy completo com validações |
| `npm run deploy:quick` | Deploy rápido (sem health check) |
| `npm run deploy:rollback` | Rollback para release anterior |
| `npm run deploy:health` | Verificar saúde do site |
| `npm run deploy:verify` | Validar deploy |
| `npm run build:vite` | Build apenas |
| `npm run preview` | Preview do build local |

---

## 💡 Dicas Rápidas

1. **Deploy sempre usa Vite**: `npm run deploy:production` executa `build:vite`
2. **Rollback é instantâneo**: Apenas troca o symlink (~10s)
3. **Mantém 5 releases**: Limpeza automática de versões antigas
4. **Zero downtime**: Nginx não para durante deploy
5. **Rollback automático**: Se health check falhar, reverte automaticamente

---

## 📞 Suporte

- **Logs**: `/home/saraiva-vision-site/claudelogs/`
- **Nginx Logs**: `/var/log/nginx/saraivavision_*.log`
- **Issues**: https://github.com/Sudo-psc/saraivavision-site-v2/issues

---

**Versão**: 2.0.1 | **Última atualização**: 05 Out 2025
