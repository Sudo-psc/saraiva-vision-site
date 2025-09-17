## **Plano de Implementação: Blog com Headless CMS**

Este documento detalha o plano de implementação técnica para o projeto de blog com Headless CMS (WordPress + React).

### Fase 1: Configuração do Backend (WordPress Headless)

1.  **Instalação do WordPress:**
    *   Configurar um ambiente de hospedagem PHP/MySQL.
    *   Instalar o WordPress em um subdomínio (ex: `cms.saraivavision.com.br`) ou um subdiretório (ex: `saraivavision.com.br/cms`). Um subdomínio é recomendado para isolar os ambientes.
2.  **Configuração da API:**
    *   Verificar a REST API padrão do WordPress para garantir que atende a todas as necessidades de dados.
    *   Alternativa recomendada: Instalar e configurar o plugin **WPGraphQL** para uma comunicação mais eficiente e flexível com o frontend.
3.  **Plugins Essenciais:**
    *   Instalar um plugin de SEO como **Yoast SEO** ou **Rank Math**, que se integram com a REST API/GraphQL para expor os campos de meta tags.
    *   Instalar o plugin **Advanced Custom Fields (ACF)** se for necessário adicionar campos personalizados aos posts.
4.  **Criação do Conteúdo:**
    *   Configurar a estrutura de posts, categorias e tags.
    *   Criar de 3 a 5 posts de exemplo para testar a API e o frontend.
5.  **Segurança:**
    *   Configurar regras de segurança no servidor para proteger o diretório `wp-admin` e o arquivo `wp-login.php` (ex: restrição de acesso por IP).
    *   Garantir que a API pública seja somente leitura.

### Fase 2: Desenvolvimento do Frontend (React)

1.  **Configuração do Ambiente:**
    *   Adicionar a variável de ambiente `VITE_WORDPRESS_API_URL` no arquivo `.env` para apontar para a API do WordPress.
2.  **Criação de Rotas:**
    *   Utilizar o `react-router-dom` para adicionar as novas rotas:
        *   `/blog`: Para a listagem de posts.
        *   `/blog/:slug`: Para a página de detalhe do post.
        *   `/categoria/:slug`: Para a página de listagem de posts por categoria.
3.  **Desenvolvimento dos Componentes:**
    *   `src/pages/BlogPage.jsx`: Página principal que busca e exibe a lista de posts.
    *   `src/pages/PostDetailPage.jsx`: Página que busca e exibe o conteúdo completo de um post.
    *   `src/pages/CategoryPage.jsx`: Página que exibe posts de uma categoria específica.
    *   `src/components/PostCard.jsx`: Componente para exibir a prévia de um post na listagem.
    *   Utilizar os componentes e estilos do Tailwind CSS existentes para manter a consistência visual.
4.  **Busca de Dados (Data Fetching):**
    *   Criar um hook customizado (ex: `useFetchWordPress.js`) ou um serviço em `src/lib/wordpress.js` para encapsular a lógica de busca de dados da API do WordPress.
    *   Se usar GraphQL, configurar um cliente como **Apollo Client** ou **urql**.
5.  **Renderização e SEO:**
    *   **Decisão Crítica:** Avaliar a necessidade de migrar o projeto de Vite para um framework com SSR/SSG nativo, como **Next.js**, para garantir a máxima performance de SEO. Se a migração não for viável, implementar a solução de **Vite SSR**.
    *   Utilizar a biblioteca `react-helmet-async` para gerenciar dinamicamente as `<title>` e `<meta>` tags em cada página.
    *   Renderizar o conteúdo HTML dos posts de forma segura, utilizando um parser como `html-react-parser` para converter o HTML do WordPress em componentes React e evitar ataques XSS.

### Fase 3: Deploy e Testes

1.  **Deploy:**
    *   Realizar o deploy da instância do WordPress no ambiente de produção.
    *   Atualizar o script de deploy do frontend (`deploy.sh`) para incluir as novas rotas e a lógica de build (SSR/SSG).
    *   Configurar o Nginx para rotear corretamente as chamadas para as novas páginas do blog.
2.  **Testes:**
    *   Testar todas as funcionalidades descritas nos requisitos funcionais.
    *   Validar o SEO técnico usando ferramentas como Google Lighthouse, PageSpeed Insights e o validador de dados estruturados do Google.
    *   Verificar a performance e a responsividade em múltiplos navegadores e dispositivos.
    *   Realizar um teste de carga na API do WordPress para garantir que ela suporta o tráfego esperado.
