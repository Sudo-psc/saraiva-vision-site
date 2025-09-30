# Gerador de Capas para Blog Posts - Saraiva Vision

Script Python para gerar imagens de capa profissionais para posts do blog utilizando Google Gemini API (Imagen 4 e Gemini 2.5 Flash Image).

## 🎯 Funcionalidades

- ✅ Geração automática de capas baseada em dados dos posts
- ✅ Suporte a múltiplos modelos de IA (Imagen 4 e Gemini Flash)
- ✅ Estilos personalizados por categoria do blog
- ✅ Prompts otimizados para conteúdo médico oftalmológico
- ✅ Compliance com diretrizes médicas brasileiras (CFM)
- ✅ Geração em batch para múltiplos posts
- ✅ Output otimizado para web (16:9, alta qualidade)

## 📋 Requisitos

### Python
Python 3.8+ instalado

### Dependências
```bash
pip install -r requirements.txt
```

Ou instalar manualmente:
```bash
pip install google-generativeai pillow python-dotenv
```

### API Key do Google Gemini
Obtenha sua chave da API em: https://aistudio.google.com/apikey

## ⚙️ Configuração

1. **Copie o arquivo de exemplo de configuração:**
```bash
cp .env.example .env
```

2. **Edite o arquivo `.env` e adicione sua chave da API:**
```bash
GOOGLE_GEMINI_API_KEY=sua_chave_api_aqui
```

3. **Ou configure a variável de ambiente diretamente:**
```bash
export GOOGLE_GEMINI_API_KEY="sua_chave_api_aqui"
```

## 🚀 Uso

### Listar Posts Disponíveis
```bash
python generate_blog_covers.py --list
```

### Gerar Capa para Post Específico
```bash
python generate_blog_covers.py --post-id 22
```

### Gerar Capas para Categoria
```bash
python generate_blog_covers.py --category "Tecnologia"
```

### Gerar Capas para Todos os Posts
```bash
python generate_blog_covers.py --all
```

### Usar Modelo Gemini Flash (alternativo)
```bash
python generate_blog_covers.py --post-id 22 --model gemini-flash
```

## 🎨 Categorias e Estilos

O script aplica estilos visuais específicos baseados na categoria do post:

### 🛡️ Prevenção
- **Cores**: Verde esmeralda e branco limpo
- **Mood**: Confiável, profissional, preventivo
- **Elementos**: Escudos médicos, símbolos de saúde
- **Estilo**: Fotografia médica clean e moderna

### 💉 Tratamento
- **Cores**: Azul profissional
- **Mood**: Científico, preciso, terapêutico
- **Elementos**: Equipamentos médicos, símbolos de cura
- **Estilo**: Fotografia hospitalar high-tech

### 🔬 Tecnologia
- **Cores**: Roxo futurista, azul tecnológico
- **Mood**: Inovador, futurista, cutting-edge
- **Elementos**: Tecnologia médica avançada, IA
- **Estilo**: Renderização 3D futurista

### ❓ Dúvidas Frequentes
- **Cores**: Âmbar caloroso, amarelo dourado
- **Mood**: Educacional, acessível, informativo
- **Elementos**: Ícones de pergunta, diálogos
- **Estilo**: Ilustração médica moderna e friendly

## 📂 Output

As imagens geradas são salvas em:
```
/home/saraiva-vision-site/public/Blog/
```

### Formato dos Arquivos
- **Imagen 4**: `capa_post_{id}_opt{1-2}_{timestamp}.png`
- **Gemini Flash**: `capa_post_{id}_gemini_{timestamp}.png`

### Especificações Técnicas
- **Proporção**: 16:9 (ideal para web)
- **Formato**: PNG de alta qualidade
- **Resolução**: Alta (otimizada pelo modelo)
- **Sem texto sobreposto**: Design limpo e profissional

## 🔧 Modelos Disponíveis

### Imagen 4 (Padrão)
```bash
--model imagen
```
- Renderização de alta fidelidade
- Gera 2 opções por post
- Ideal para imagens fotorrealistas

### Gemini 2.5 Flash Image
```bash
--model gemini-flash
```
- Edição baseada em prompts
- Geração consciente de localidade
- Capacidades de raciocínio integradas

## 📝 Exemplos de Uso Completos

### Workflow Típico

1. **Listar posts disponíveis:**
```bash
python generate_blog_covers.py --list
```

2. **Testar com um post específico:**
```bash
python generate_blog_covers.py --post-id 22
```

3. **Revisar imagens geradas em:**
```
public/Blog/capa_post_22_opt1_*.png
public/Blog/capa_post_22_opt2_*.png
```

4. **Se satisfeito, gerar para categoria:**
```bash
python generate_blog_covers.py --category "Tecnologia"
```

5. **Gerar para todos os posts:**
```bash
python generate_blog_covers.py --all
```

### Usando Gemini Flash para Testes Rápidos
```bash
python generate_blog_covers.py --post-id 22 --model gemini-flash
```

## ⚠️ Considerações Importantes

### Compliance Médico (CFM)
- ✅ Imagens NÃO incluem texto sobreposto
- ✅ Evita rostos identificáveis
- ✅ Representações abstratas ou simbólicas
- ✅ Adequado para clínica médica brasileira

### Performance
- Cada imagem leva ~10-30 segundos para gerar
- Modo batch (`--all`) pode levar vários minutos
- Rate limits da API são respeitados automaticamente

### Custos
- Consulte preços da Google Gemini API
- Imagen 4: ~$0.04 por imagem
- Gemini Flash: Geralmente mais econômico

## 🐛 Troubleshooting

### "Chave da API não encontrada"
```bash
export GOOGLE_GEMINI_API_KEY="sua_chave_aqui"
```

### "Nenhum post encontrado"
Verifique se o arquivo existe:
```bash
ls -la src/data/blogPosts.js
```

### "Erro ao gerar imagem"
- Verifique sua conexão com internet
- Confirme que a API key está válida
- Verifique rate limits da API

### Permissões de arquivo
```bash
chmod +x generate_blog_covers.py
chmod 755 public/Blog/
```

## 🔄 Integração com Workflow

### Deploy Automático
Após gerar imagens, elas já estarão em `public/Blog/` e serão incluídas no próximo build:

```bash
# 1. Gerar imagens
python scripts/generate_blog_covers.py --post-id 22

# 2. Build aplicação
npm run build

# 3. Deploy
sudo cp -r dist/* /var/www/html/
sudo systemctl reload nginx
```

### Git Workflow
```bash
# Adicionar novas imagens ao controle de versão
git add public/Blog/capa_post_*.png
git commit -m "feat(blog): add AI-generated cover images for posts"
git push
```

## 📊 Exemplos de Prompts Gerados

### Post: "Teste do Olhinho e Retinoblastoma"
```
Crie uma imagem de capa profissional para blog médico oftalmológico...
TEMA: Teste do Olhinho e Retinoblastoma
CATEGORIA: Prevenção
ESTILO VISUAL:
- Fotografia médica profissional, clean e moderna
- Paleta de cores: tons de verde esmeralda e branco limpo
- Mood: confiável, profissional, preventivo
- Elementos visuais: escudo médico, símbolos de saúde
...
```

## 📚 Recursos Adicionais

- [Google Gemini API Docs](https://ai.google.dev/gemini-api/docs)
- [Imagen Documentation](https://ai.google.dev/gemini-api/docs/imagen)
- [Python SDK](https://github.com/google/generative-ai-python)

## 🤝 Contribuindo

Para melhorias no script:
1. Edite `scripts/generate_blog_covers.py`
2. Teste com posts de exemplo
3. Commit e push das mudanças

## 📄 Licença

Uso interno - Saraiva Vision Clinic
