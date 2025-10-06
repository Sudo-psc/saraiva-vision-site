# Instruções de Merge - Branch agendamento-nin-iframe

## 🚀 Guia Rápido para Merge em Produção

### Pré-requisitos
- [ ] Código testado localmente com sucesso
- [ ] Build executado sem erros
- [ ] Documentação revisada
- [ ] Aprovação da equipe obtida

---

## 📋 Passo a Passo

### 1. Atualizar Branch Main
```bash
# Garantir que main está atualizado
git checkout main
git pull origin main
```

### 2. Testar Merge Localmente
```bash
# Fazer merge local para testar
git merge agendamento-nin-iframe --no-ff

# Verificar se há conflitos
git status
```

### 3. Resolver Conflitos (se houver)
```bash
# Se houver conflitos, resolva manualmente
# Depois marque como resolvido:
git add <arquivo-resolvido>
git commit -m "resolve: merge conflicts from agendamento-nin-iframe"
```

### 4. Testar Build
```bash
# Executar build para garantir que está tudo OK
npm run build

# Se build falhar, corrigir erros antes de continuar
# Se build passar, prosseguir
```

### 5. Testar Localmente
```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Abrir navegador em http://localhost:3002
# Testar:
# - Página /agendamento carrega corretamente
# - Navbar funciona
# - Footer aparece
# - Iframe do Nin Saúde carrega
# - Navegação entre páginas funciona
```

### 6. Push para Main
```bash
# Se tudo estiver OK, fazer push
git push origin main
```

### 7. Deploy em Produção
```bash
# Executar script de deploy
sudo bash DEPLOY_NOW.sh

# Ou, se preferir deploy manual:
# npm run build
# sudo systemctl restart nginx
```

### 8. Validação Pós-Deploy
```bash
# Aguardar 1-2 minutos para deploy completar

# Testar URL em produção
curl -I https://saraivavision.com.br/agendamento

# Deve retornar: HTTP/2 200
```

### 9. Teste Visual em Produção
- [ ] Acessar: https://saraivavision.com.br/agendamento
- [ ] Verificar que página carrega corretamente
- [ ] Testar navegação via Navbar
- [ ] Testar modal CTA
- [ ] Verificar responsividade (mobile/desktop)
- [ ] Confirmar que iframe Nin Saúde está funcional

### 10. Monitoramento (Primeiras 24h)
```bash
# Monitorar logs do Nginx
sudo tail -f /var/log/nginx/access.log | grep agendamento
sudo tail -f /var/log/nginx/error.log

# Verificar erros JavaScript (via Google Analytics ou console)
```

---

## 🔄 Se Algo Der Errado (Rollback)

### Opção 1: Reverter Commit
```bash
# Identificar o commit do merge
git log --oneline -5

# Reverter para estado anterior
git revert <commit-hash-do-merge>
git push origin main

# Rebuild e redeploy
npm run build
sudo bash DEPLOY_NOW.sh
```

### Opção 2: Reset Hard (Use com cuidado!)
```bash
# ATENÇÃO: Isso apaga mudanças não commitadas!
git reset --hard HEAD~1
git push origin main --force

# Rebuild e redeploy
npm run build
sudo bash DEPLOY_NOW.sh
```

### Opção 3: Checkout Branch Anterior
```bash
# Criar branch de emergência com código atual
git checkout -b emergency-rollback

# Voltar para main e resetar
git checkout main
git reset --hard <commit-hash-anterior-ao-merge>
git push origin main --force
```

---

## 🧪 Comandos de Teste Úteis

### Teste Local Completo
```bash
# Limpar tudo e testar do zero
rm -rf .next dist node_modules/.cache
npm install
npm run build
npm run dev
```

### Teste de Performance
```bash
# Instalar lighthouse (se não tiver)
npm install -g lighthouse

# Rodar audit (após deploy)
lighthouse https://saraivavision.com.br/agendamento --view
```

### Teste de SEO
```bash
# Verificar meta tags
curl -s https://saraivavision.com.br/agendamento | grep -i "meta"

# Verificar título
curl -s https://saraivavision.com.br/agendamento | grep -i "<title>"
```

---

## 📊 Checklist de Validação Completa

### Funcionalidade
- [ ] Página /agendamento carrega sem erros
- [ ] Iframe Nin Saúde renderiza corretamente
- [ ] Sistema de agendamento é interativo
- [ ] Navbar permanece visível e funcional
- [ ] Footer aparece na parte inferior
- [ ] Todos os links de navegação funcionam

### Performance
- [ ] Tempo de carregamento < 3 segundos
- [ ] Lighthouse Performance > 85
- [ ] No console errors no navegador
- [ ] Imagens/CSS carregam corretamente

### SEO
- [ ] Meta tags presentes e corretas
- [ ] Canonical URL configurado
- [ ] Título da página apropriado
- [ ] Descrição meta relevante

### Acessibilidade
- [ ] Título do iframe descritivo
- [ ] Navegação por teclado funciona
- [ ] Cores com contraste adequado
- [ ] Textos legíveis

### Segurança
- [ ] HTTPS funcionando
- [ ] Certificado SSL válido
- [ ] CSP headers configurados
- [ ] Sandbox attributes do iframe OK

### Responsividade
- [ ] Mobile (375px): Layout adequado
- [ ] Tablet (768px): Layout adequado
- [ ] Desktop (1920px): Layout adequado

### Navegação
- [ ] Home → Agendamento: OK
- [ ] Agendamento → Home: OK
- [ ] Modal CTA → Agendamento: OK
- [ ] URL direta /agendamento: OK

---

## 📞 Contatos em Caso de Problemas

### Durante o Merge
- **Git Conflicts:** Consultar documentação Git ou equipe
- **Build Errors:** Verificar logs em `npm run build`
- **Test Failures:** Executar `npm test` para detalhes

### Após o Deploy
- **Site Offline:** Verificar logs Nginx, reiniciar serviços
- **Erros 404:** Verificar configuração de rotas no Nginx
- **Performance Ruim:** Verificar cache, CDN, otimizações

### Suporte
- **Documentação Técnica:** `IMPLEMENTACAO_AGENDAMENTO_NIN.md`
- **Guia de Testes:** `GUIA_TESTE_AGENDAMENTO.md`
- **Resumo Executivo:** `RESUMO_IMPLEMENTACAO.md`

---

## 🎯 Expectativas Pós-Merge

### Resultado Esperado
✅ Nova página `/agendamento` funcional em produção  
✅ Usuários podem agendar consultas via sistema Nin Saúde  
✅ Navegação integrada e experiência consistente  
✅ Performance mantida ou melhorada  
✅ SEO adequado para nova página  

### Monitoramento Inicial (7 dias)
- Acompanhar taxa de conversão
- Monitorar erros e exceções
- Coletar feedback de usuários
- Ajustar conforme necessário

---

## 📝 Notas Finais

### Informações do Branch
- **Nome:** `agendamento-nin-iframe`
- **Commits:** 3 commits
- **Arquivos Novos:** 4
- **Arquivos Modificados:** 3
- **Linhas Adicionadas:** ~730 linhas (incluindo docs)

### Após Merge Bem-Sucedido
```bash
# Opcional: Limpar branch local e remoto (após confirmar que está tudo OK)
git branch -d agendamento-nin-iframe
git push origin --delete agendamento-nin-iframe
```

### Backup Recomendado
Antes de fazer merge em produção, considere:
```bash
# Fazer backup do estado atual
git tag -a pre-agendamento-merge -m "Backup antes do merge de agendamento"
git push origin pre-agendamento-merge
```

Assim, se necessário, pode-se facilmente voltar ao estado anterior:
```bash
git checkout pre-agendamento-merge
```

---

## ✅ Pronto para Merge!

Se você chegou até aqui e todos os testes passaram, o código está pronto para produção!

**Boa sorte com o deploy! 🚀**

---

**Documento criado em:** 2025-01-XX  
**Versão:** 1.0  
**Branch:** agendamento-nin-iframe  
**Status:** ✅ Pronto para Merge
