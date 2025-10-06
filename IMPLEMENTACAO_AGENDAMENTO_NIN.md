# Implementação do Sistema de Agendamento Online Nin Saúde

## Data de Implementação
2025-01-XX

## Branch
`agendamento-nin-iframe`

## Objetivo
Integrar o sistema de agendamento online da Nin Saúde ao website institucional da Saraiva Vision através de uma página dedicada com iframe, mantendo a experiência de usuário consistente com navbar e footer do site.

## Arquivos Criados

### 1. src/pages/AgendamentoPage.jsx
Página dedicada ao agendamento online que:
- Exibe o sistema Nin Saúde através de iframe responsivo
- Mantém Navbar e Footer do site para navegação consistente
- Implementa SEO com meta tags adequadas
- Oferece dicas e instruções para o usuário
- Altura mínima de 800px para garantir boa visualização do conteúdo

**Características Técnicas:**
- URL do iframe: `https://apolo.ninsaude.com/a/saraivavision/`
- Sandbox attributes para segurança
- Loading eager para carregamento prioritário
- Altura responsiva (100vh, min 800px, max 1200px)
- Background gradient azul suave
- Shadow-xl para destacar o container do iframe

## Arquivos Modificados

### 1. src/App.jsx
- **Linha 21**: Adicionado lazy loading do componente `AgendamentoPage`
- **Linha 83**: Adicionada rota `/agendamento` apontando para `<AgendamentoPage />`

### 2. src/components/Navbar.jsx
- **Linha 84**: Botão "Agendar" (desktop) agora navega para `/agendamento`
- **Linha 141**: Botão "Agendar Consulta" (mobile) agora navega para `/agendamento`

### 3. src/components/CTAModal.jsx
- **Linha 4**: Importado `useNavigate` do react-router-dom
- **Linha 13**: Adicionado hook `navigate`
- **Linhas 95-111**: Botão de "Agendamento Online" agora fecha o modal e navega para `/agendamento` ao invés de abrir link externo

## Rotas Implementadas

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/agendamento` | `AgendamentoPage` | Página de agendamento online com iframe Nin Saúde |

## Funcionalidades

### Experiência do Usuário
1. **Navegação Integrada**: Usuário pode acessar agendamento e voltar para outras seções do site facilmente
2. **Responsividade**: Iframe se adapta a diferentes tamanhos de tela
3. **SEO**: Página otimizada para motores de busca
4. **Acessibilidade**: Título apropriado no iframe, meta tags descritivas

### Pontos de Entrada
O sistema de agendamento pode ser acessado através de:
1. Botão "Agendar" na Navbar (desktop e mobile)
2. Opção "Agendamento Online" no CTAModal (modal de contato)
3. URL direta: `/agendamento`
4. Links internos de outras páginas (quando implementados)

### Segurança
- Sandbox attributes configurados adequadamente:
  - `allow-same-origin`: Necessário para funcionamento do iframe
  - `allow-scripts`: Permite execução de JavaScript
  - `allow-forms`: Permite submissão de formulários
  - `allow-popups`: Para abrir janelas quando necessário
  - `allow-popups-to-escape-sandbox`: Para popups externos

## Testes Recomendados

### Testes Funcionais
- [ ] Verificar carregamento correto do iframe da Nin Saúde
- [ ] Testar navegação de/para página de agendamento
- [ ] Validar funcionamento em diferentes navegadores (Chrome, Firefox, Safari, Edge)
- [ ] Testar responsividade em mobile, tablet e desktop
- [ ] Verificar que Navbar e Footer são exibidos corretamente
- [ ] Confirmar que botões de CTA direcionam para página correta

### Testes de Performance
- [ ] Verificar tempo de carregamento do iframe
- [ ] Validar que lazy loading funciona corretamente
- [ ] Conferir que não há impacto negativo no LCP/FCP

### Testes de SEO
- [ ] Validar meta tags na página
- [ ] Verificar canonical URL
- [ ] Testar Google Search Console após deploy

## Próximos Passos (Opcional)

1. **Analytics**: Adicionar tracking de eventos para página de agendamento
2. **A/B Testing**: Testar diferentes textos/layouts para CTAs
3. **Fallback**: Implementar mensagem de erro caso iframe não carregue
4. **Loading State**: Adicionar skeleton/spinner enquanto iframe carrega
5. **Deep Linking**: Permitir parâmetros URL para pre-preencher dados no sistema Nin

## Rollback

Caso necessário reverter a implementação:

```bash
git checkout main
git branch -D agendamento-nin-iframe
```

Ou, se já foi feito merge:
```bash
git revert <commit-hash>
```

## Notas Importantes

1. O iframe aponta diretamente para o sistema da Nin Saúde hospedado externamente
2. Qualquer atualização no sistema da Nin Saúde será refletida automaticamente
3. Não é necessário manutenção de backend adicional
4. A página mantém total compatibilidade com estrutura existente do site
5. Implementação segue padrões do projeto (Tailwind CSS, React Router, lazy loading)

## Compliance

- ✅ **LGPD**: Sistema Nin Saúde já é compliant, não coletamos dados adicionais
- ✅ **CFM**: Agendamento médico através de sistema certificado
- ✅ **Acessibilidade**: Página implementa tags ARIA e semântica HTML adequada
- ✅ **Segurança**: Sandbox attributes, HTTPS, CSP headers (via Nginx)

## Contatos

- **Sistema Nin Saúde**: https://ninsaude.com
- **Suporte Técnico**: Verificar documentação da Nin Saúde
- **URL do Agendamento**: https://apolo.ninsaude.com/a/saraivavision/
