# Guia Rápido de Teste - Sistema de Agendamento Online

## Como Testar Localmente

### 1. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

O servidor iniciará em `http://localhost:3002`

### 2. Acessar a Página de Agendamento

Existem 3 formas de acessar:

#### Opção A: URL Direta
Navegue para: `http://localhost:3002/agendamento`

#### Opção B: Via Navbar
1. Acesse qualquer página do site
2. Clique no botão "Agendar" no canto superior direito (desktop)
3. Ou abra o menu mobile e clique em "Agendar Consulta"

#### Opção C: Via Modal de Contato
1. Navegue pelo site até aparecer o modal de CTA (após rolar a página)
2. Clique na primeira opção "Agendamento Online" (com badge RECOMENDADO)

### 3. Verificações Importantes

#### ✅ Checklist Visual
- [ ] Navbar aparece normalmente no topo da página
- [ ] Título "Agendamento Online" está visível
- [ ] Subtítulo com nome do Dr. Philipe Saraiva
- [ ] Iframe carrega o sistema da Nin Saúde
- [ ] Footer aparece na parte inferior
- [ ] Dicas aparecem abaixo do iframe

#### ✅ Checklist Funcional
- [ ] Iframe é totalmente interativo (pode preencher formulários)
- [ ] Scroll funciona dentro do iframe
- [ ] Navbar permanece fixa ao rolar a página
- [ ] Botões de navegação funcionam corretamente
- [ ] Modal de contato fecha ao clicar em "Agendamento Online"

#### ✅ Checklist Responsivo
- [ ] **Desktop** (1920x1080): Iframe ocupa largura adequada, centralizado
- [ ] **Tablet** (768x1024): Layout se adapta, iframe redimensiona
- [ ] **Mobile** (375x667): Iframe responsivo, navegação mobile funcional

### 4. Teste de Integração com Sistema Nin

1. Dentro do iframe, tente:
   - Visualizar calendário de horários disponíveis
   - Selecionar uma data
   - Preencher dados pessoais
   - Verificar se todas as interações funcionam

**Nota**: Se o sistema Nin solicitar login ou mostrar erro, verifique se a URL está correta e se o sistema está online.

### 5. Teste de Navegação

```
Home → Clique "Agendar" → Deve ir para /agendamento
/agendamento → Clique logo → Deve voltar para Home
/agendamento → Clique "Serviços" → Deve ir para /servicos
/servicos → Clique "Agendar" → Deve voltar para /agendamento
```

## Teste em Produção (Após Deploy)

### URLs de Teste
- Produção: `https://saraivavision.com.br/agendamento`
- Staging: `https://staging.saraivavision.com.br/agendamento` (se disponível)

### Ferramentas de Teste

#### Google Lighthouse
```bash
# Instalar Lighthouse CLI (se não tiver)
npm install -g lighthouse

# Rodar teste
lighthouse https://saraivavision.com.br/agendamento --view
```

**Métricas Esperadas:**
- Performance: > 85
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

#### PageSpeed Insights
1. Acesse: https://pagespeed.web.dev/
2. Insira: `https://saraivavision.com.br/agendamento`
3. Clique "Analyze"

#### Teste em Múltiplos Dispositivos
Use: https://www.browserstack.com/ ou https://responsivedesignchecker.com/

## Resolução de Problemas Comuns

### Problema: Iframe não carrega
**Possíveis causas:**
- Sistema Nin Saúde offline
- Bloqueio de CORS/CSP
- Bloqueador de anúncios ativo

**Solução:**
1. Verificar console do navegador (F12)
2. Desabilitar extensões temporariamente
3. Testar em modo anônimo
4. Verificar se URL do iframe está correta

### Problema: Navbar não aparece
**Possível causa:** Erro de CSS ou componente quebrado

**Solução:**
1. Verificar console para erros JavaScript
2. Limpar cache do navegador (Ctrl+Shift+R)
3. Verificar se build foi feito corretamente

### Problema: Página não encontrada (404)
**Possível causa:** Rota não registrada ou build desatualizado

**Solução:**
```bash
# Limpar build
rm -rf .next dist

# Rebuild
npm run build

# Testar novamente
npm run dev
```

## Comandos Úteis

```bash
# Verificar se build está OK
npm run build

# Rodar linter
npm run lint

# Verificar erros de tipo
npm run type-check

# Limpar cache e rebuild
npm run clean && npm run build

# Iniciar em modo produção local
npm run build && npm run preview
```

## Testes Automatizados (Futuro)

```javascript
// Exemplo de teste com Vitest + React Testing Library
describe('AgendamentoPage', () => {
  it('deve renderizar o iframe da Nin Saúde', () => {
    render(<AgendamentoPage />);
    const iframe = screen.getByTitle(/Sistema de Agendamento Online/i);
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', 'https://apolo.ninsaude.com/a/saraivavision/');
  });
});
```

## Contato para Suporte

Se encontrar problemas durante os testes:
1. Verificar documentação em `IMPLEMENTACAO_AGENDAMENTO_NIN.md`
2. Consultar logs do console (F12 → Console)
3. Verificar Network tab para requisições falhadas
4. Reportar issues com screenshots e logs

---

**Última atualização:** 2025-01-XX
**Versão:** 1.0
**Branch:** agendamento-nin-iframe
