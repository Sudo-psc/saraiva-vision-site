# Guia Compreensivo de Container (Docker)

Este documento fornece um guia detalhado sobre a configuração e o gerenciamento do ambiente de contêiner para o projeto Saraiva Vision.

## Arquitetura de Contêiner

A aplicação é dividida em quatro serviços principais, cada um executando em seu próprio contêiner:

*   **frontend:** Um contêiner Nginx que serve a aplicação React/Vite construída estaticamente.
*   **api:** Um contêiner Node.js que executa o servidor da API.
*   **wordpress:** Um contêiner PHP-FPM que executa o CMS WordPress.
*   **nginx:** Um contêiner Nginx que atua como um proxy reverso, roteando o tráfego para os outros serviços.

## Volumes

Os seguintes volumes são usados para persistir dados:

*   **wordpress_data:** Armazena os uploads do WordPress.
*   **wordpress_db:** Armazena o banco de dados SQLite do WordPress.
*   **nginx_logs:** Armazena os logs de acesso e erro do Nginx.

## Redes

Duas redes são usadas para isolar os serviços:

*   **internal:** Uma rede interna para comunicação entre os contêineres de backend (api, wordpress).
*   **external:** Uma rede externa para o contêiner Nginx, permitindo que ele receba tráfego externo.

## Desenvolvimento

Para iniciar o ambiente de desenvolvimento, execute:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

Isso irá construir as imagens do Docker (se ainda não estiverem construídas) e iniciar todos os serviços. O frontend estará acessível em `http://localhost:3002`.

### Hot Reloading

O serviço de frontend é configurado com hot-reloading. Quaisquer alterações feitas no código-fonte no diretório `src` serão refletidas automaticamente em seu navegador.

### Logs

Para visualizar os logs de todos os serviços, execute:

```bash
docker-compose -f docker-compose.dev.yml logs -f
```

Para visualizar os logs de um serviço específico, execute:

```bash
docker-compose -f docker-compose.dev.yml logs -f <nome_do_serviço>
```

## Produção

O ambiente de produção é gerenciado pelo script `deploy.sh`.

Para implantar a aplicação em produção, execute:

```bash
sudo ./deploy.sh --docker
```

Isso irá acionar uma implantação blue-green dos contêineres Docker.

## Solução de problemas

*   **Conflitos de porta:** Certifique-se de que as portas usadas pelos contêineres não estejam já em uso em sua máquina host.
*   **Falhas na verificação de saúde:** Verifique os logs de verificação de saúde do serviço com falha para obter mais informações.
*   **Problemas de permissão de volume:** Certifique-se de que os diretórios em sua máquina host que estão sendo montados como volumes tenham as permissões corretas.
