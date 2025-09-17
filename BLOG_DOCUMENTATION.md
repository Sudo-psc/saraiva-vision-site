## **Documentação do Projeto: Blog com Headless CMS (WordPress + React)**

### 1. Visão Geral

Este documento detalha os requisitos funcionais para adicionar uma seção de blog ao site Saraiva Vision. A solução utilizará o WordPress como um Headless CMS para gerenciamento de conteúdo e o frontend existente (React/Vite) para a exibição das páginas do blog, garantindo consistência visual, alta performance e otimização avançada para SEO.

### 2. Análise do Projeto Existente

*   **Frontend:** Aplicação JavaScript moderna utilizando React, Vite como build tool e Tailwind CSS para estilização.
*   **UI/UX:** O design é limpo e profissional. O blog deve seguir a mesma identidade visual (cores, fontes, componentes).
*   **Infraestrutura:** O deploy é feito em um ambiente que suporta Node.js, com Nginx como servidor web/proxy reverso.

### 3. Requisitos Funcionais

#### 3.1. Para o Gerenciador de Conteúdo (Painel do WordPress)

*   **RF-01:** Deve ser capaz de criar, editar, publicar, despublicar e excluir posts de blog.
*   **RF-02:** O editor de posts deve ser o editor de blocos do WordPress (Gutenberg) para permitir a criação de conteúdo rico (texto, imagens, vídeos, listas, etc.).
*   **RF-03:** Deve ser capaz de atribuir categorias e tags a cada post.
*   **RF-04:** Deve ser capaz de definir uma imagem de destaque para cada post.
*   **RF-05:** Deve ser capaz de agendar a publicação de posts para uma data/hora futura.
*   **RF-06 (SEO):** Para cada post, deve ser possível definir um meta-título, uma meta-descrição e uma palavra-chave em foco.
*   **RF-07 (SEO):** O sistema deve gerar automaticamente URLs amigáveis (slugs) a partir do título do post, com a possibilidade de edição manual.
*   **RF-08:** Deve haver um sistema de gerenciamento de mídia para upload de imagens e outros arquivos.

#### 3.2. Para o Visitante do Site (Frontend React)

*   **RF-09:** Deve haver uma página principal do blog (ex: `/blog`) que lista todos os posts publicados, em ordem cronológica decrescente, com paginação.
*   **RF-10:** Cada post na listagem deve exibir a imagem de destaque, título, um resumo, autor e data de publicação.
*   **RF-11:** Ao clicar em um post, o usuário deve ser levado a uma página de detalhe do post com uma URL única e amigável para SEO (ex: `/blog/meu-primeiro-post`).
*   **RF-12:** A página de detalhe do post deve exibir o conteúdo completo, incluindo imagens e outros formatos de mídia.
*   **RF-13:** O visitante deve poder filtrar os posts por categoria ou tag.
*   **RF-14 (SEO):** Todas as páginas do blog (listagem e detalhe) devem ser renderizadas no servidor (SSR) ou geradas estaticamente (SSG) para garantir a indexação ideal pelos motores de busca.
*   **RF-15 (SEO):** As páginas de detalhe do post devem conter as meta tags (título, descrição) e dados estruturados (Schema.org para `BlogPosting`) preenchidos dinamicamente.
*   **RF-16 (SEO):** Um sitemap XML (`sitemap.xml`) deve ser gerado ou atualizado automaticamente para incluir as URLs de todos os posts do blog.

### 4. Requisitos Não-Funcionais

*   **RNF-01 (Performance):** As páginas do blog devem ter um tempo de carregamento rápido, com métricas de Core Web Vitals (LCP, FID, CLS) otimizadas.
*   **RNF-02 (Segurança):** O painel de administração do WordPress deve ser protegido contra acesso não autorizado (ex: `wp-admin` com acesso restrito por IP, senhas fortes). A API deve ser somente leitura para o público.
*   **RNF-03 (Usabilidade):** A navegação no blog deve ser intuitiva e o design totalmente responsivo, adaptando-se a desktops, tablets e smartphones.
*   **RNF-04 (Manutenibilidade):** O código no frontend React deve ser componentizado e seguir as melhores práticas para facilitar futuras manutenções.
