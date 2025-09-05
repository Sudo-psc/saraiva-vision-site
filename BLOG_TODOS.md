## TODOs - Implementação do Blog

Esta é uma checklist de tarefas baseada no plano de implementação do blog.

### Fase 1: Configuração do Backend (WordPress)

- [ ] Configurar ambiente de hospedagem PHP/MySQL.
- [ ] Instalar o WordPress em um subdomínio ou subdiretório.
- [ ] Decidir e configurar a API (REST padrão ou WPGraphQL).
- [ ] Instalar e configurar plugin de SEO (Yoast/Rank Math).
- [ ] Instalar e configurar ACF (se necessário).
- [ ] Criar posts, categorias e tags de exemplo.
- [ ] Implementar medidas de segurança no `wp-admin` e API.

### Fase 2: Desenvolvimento do Frontend (React)

- [ ] Adicionar `VITE_WORDPRESS_API_URL` ao arquivo `.env`.
- [ ] Criar rotas do blog (`/blog`, `/blog/:slug`, `/categoria/:slug`).
- [ ] Criar o componente `src/pages/BlogPage.jsx`.
- [ ] Criar o componente `src/pages/PostDetailPage.jsx`.
- [ ] Criar o componente `src/pages/CategoryPage.jsx`.
- [ ] Criar o componente `src/components/PostCard.jsx`.
- [ ] Desenvolver a lógica de busca de dados (Data Fetching).
- [ ] **Decisão Crítica:** Avaliar e escolher a estratégia de renderização (manter Vite, migrar para Next.js, ou usar Vite SSR).
- [ ] Implementar a estratégia de renderização escolhida.
- [ ] Adicionar `react-helmet-async` para gerenciar meta tags.
- [ ] Implementar um parser seguro para o conteúdo HTML do WordPress.

### Fase 3: Deploy e Testes

- [ ] Realizar o deploy da instância do WordPress.
- [ ] Atualizar o script `deploy.sh` para o novo build do frontend.
- [ ] Ajustar a configuração do Nginx para as novas rotas.
- [ ] Executar testes funcionais completos.
- [ ] Executar testes de SEO e performance (Lighthouse, PageSpeed).
- [ ] Validar dados estruturados.
- [ ] Executar testes de responsividade.
- [ ] (Opcional) Realizar teste de carga na API.
