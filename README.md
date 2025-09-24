# Saraiva Vision - Deployment Package

Este é o branch limpo de deployment do site Saraiva Vision, contendo apenas os arquivos necessários para produção.

## Estrutura do Projeto

```
saraiva-vision/
├── public/          # Assets estáticos (imagens, ícones, etc.)
├── index.html       # Página principal da aplicação
├── nginx.conf       # Configuração do Nginx
├── Dockerfile.frontend  # Container Docker para o frontend
└── README.md        # Esta documentação
```

## Deploy com Docker

### 1. Build da Imagem
```bash
docker build -f Dockerfile.frontend -t saraiva-vision .
```

### 2. Executar Container
```bash
docker run -d -p 80:80 --name saraiva-vision saraiva-vision
```

### 3. Verificar Status
```bash
# Health check
curl http://localhost/health

# Status do container
docker ps
```

## Deploy Manual com Nginx

### 1. Instalar Nginx
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

### 2. Configurar Nginx
```bash
# Copiar arquivos estáticos
sudo cp -r public/* /var/www/html/
sudo cp index.html /var/www/html/

# Configurar Nginx
sudo cp nginx.conf /etc/nginx/nginx.conf

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 3. Verificar Funcionamento
```bash
# Health check
curl http://seu-servidor/health

# Verificar logs
sudo tail -f /var/log/nginx/access.log
```

## Deploy em VPS

### 1. Clonar Repositório
```bash
git clone https://github.com/seu-usuario/saraiva-vision.git -b deploy-nginx-clean
cd saraiva-vision
```

### 2. Configurar Nginx
```bash
# Copiar arquivos
sudo cp -r public/* /var/www/html/
sudo cp index.html /var/www/html/
sudo cp nginx.conf /etc/nginx/sites-available/saraiva-vision

# Ativar site
sudo ln -sf /etc/nginx/sites-available/saraiva-vision /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Testar e reiniciar
sudo nginx -t
sudo systemctl restart nginx
```

### 3. SSL/HTTPS (Opcional)
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d seu-dominio.com
```

## Estrutura dos Assets

O diretório `public/` contém:
- **img/** - Imagens do site (logos, fotos, avatares)
- **icons_social/** - Ícones das redes sociais
- **sounds/** - Arquivos de áudio
- **favicon.ico** - Favicon do site
- **manifest.json** - Manifest da aplicação

## Configurações do Nginx

O arquivo `nginx.conf` inclui:
- ✅ Compressão Gzip otimizada
- ✅ Cache de assets estáticos (1 ano)
- ✅ Headers de segurança
- ✅ Health check endpoint
- ✅ Fallback para SPA (Single Page Application)
- ✅ Cache control para arquivos HTML

## Verificação de Saúde

O endpoint `/health` retorna status do servidor:
```bash
curl http://localhost/health
# Resposta: healthy
```

## Logs e Monitoramento

```bash
# Logs de acesso
sudo tail -f /var/log/nginx/access.log

# Logs de erro
sudo tail -f /var/log/nginx/error.log

# Status do Nginx
sudo systemctl status nginx
```

## Solução de Problemas

### Erro 404
- Verificar se os arquivos estão em `/var/www/html/`
- Verificar permissões dos arquivos

### Erro 403
- Verificar propriedade dos arquivos: `sudo chown -R www-data:www-data /var/www/html/`
- Verificar permissões: `sudo chmod -R 755 /var/www/html/`

### Assets não carregam
- Verificar configuração de mime types no nginx.conf
- Verificar se os arquivos existem no diretório `public/`

---

## Contato e Suporte

Para questões técnicas relacionadas ao deployment, consulte a documentação principal do projeto ou entre em contato com a equipe de desenvolvimento.

**Versão**: Deploy Clean Branch
**Data**: Setembro 2024