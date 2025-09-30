# Exemplos de Uso - Gerador de Capas

## 📋 Setup Inicial

### 1. Instalar Dependências
```bash
cd /home/saraiva-vision-site/scripts
pip3 install -r requirements.txt
```

### 2. Configurar API Key
```bash
# Opção 1: Variável de ambiente (temporária)
export GOOGLE_GEMINI_API_KEY="sua_chave_aqui"

# Opção 2: Arquivo .env (permanente)
cp .env.example .env
nano .env  # Adicione sua chave: GOOGLE_GEMINI_API_KEY=sua_chave_aqui
```

### 3. Obter API Key
Acesse: https://aistudio.google.com/apikey

---

## 🎯 Comandos Principais

### Listar Todos os Posts Disponíveis
```bash
python3 /home/saraiva-vision-site/scripts/generate_blog_covers.py --list
```

**Output:**
```
🏥 SARAIVA VISION - Gerador de Capas para Blog
======================================================================

📚 Carregando posts do blog...
✓ 22 posts carregados do banco de dados

📋 Posts disponíveis:

  ID:  22 | Categoria: Prevenção            | Teste do Olhinho e Retinoblastoma...
  ID:  21 | Categoria: Tecnologia           | Retinose Pigmentar e a Revolução...
  ID:  20 | Categoria: Dúvidas Frequentes   | Moscas Volantes: Quando as Manchas...
  ...

✓ Total: 22 posts
```

---

## 🖼️ Geração de Imagens

### Exemplo 1: Post Específico (Recomendado para Testes)
```bash
python3 /home/saraiva-vision-site/scripts/generate_blog_covers.py --post-id 22
```

**O que acontece:**
1. Carrega dados do post ID 22 (Teste do Olhinho)
2. Identifica categoria "Prevenção"
3. Aplica estilo visual: verde esmeralda, mood confiável
4. Gera 2 variações da imagem
5. Salva em: `public/Blog/capa_post_22_opt1_*.png` e `capa_post_22_opt2_*.png`

**Output esperado:**
```
======================================================================
📰 Gerando capa para: Teste do Olhinho e Retinoblastoma...
🆔 Post ID: 22
📂 Categoria: Prevenção
======================================================================

🤖 Prompt gerado (preview):
Crie uma imagem de capa profissional para blog médico oftalmológico...
TEMA: Teste do Olhinho e Retinoblastoma...
CATEGORIA: Prevenção
ESTILO VISUAL:
- Fotografia médica profissional, clean e moderna
- Paleta de cores: tons de verde esmeralda e branco limpo...

🎨 Gerando imagem com Imagen 4...
📝 Post ID: 22
✓ Opção 1 salva: capa_post_22_opt1_20250930_173245.png
✓ Opção 2 salva: capa_post_22_opt2_20250930_173245.png

======================================================================
✅ GERAÇÃO COMPLETA!
📊 Total de imagens geradas: 2
📂 Diretório de saída: /home/saraiva-vision-site/public/Blog
======================================================================
```

---

### Exemplo 2: Categoria Específica
```bash
python3 /home/saraiva-vision-site/scripts/generate_blog_covers.py --category "Tecnologia"
```

**Gera capas para todos os posts de Tecnologia:**
- Post 21: Retinose Pigmentar e Luxturna
- Post 18: Lentes Especiais para Daltonismo
- Post 16: IA em Exames Oftalmológicos

**Estilo aplicado:**
- Cores: Roxo futurista, azul tecnológico
- Mood: Inovador, cutting-edge
- Elementos: Tech médica avançada, IA
- Renderização 3D futurista

---

### Exemplo 3: Todos os Posts (Batch)
```bash
python3 /home/saraiva-vision-site/scripts/generate_blog_covers.py --all
```

⚠️ **Atenção:**
- Gera capas para TODOS os 22 posts
- Pode levar 20-40 minutos
- Gera ~44 imagens (2 por post)
- Recomendado executar em horário de baixo tráfego

---

### Exemplo 4: Usando Modelo Alternativo (Gemini Flash)
```bash
python3 /home/saraiva-vision-site/scripts/generate_blog_covers.py --post-id 22 --model gemini-flash
```

**Diferenças:**
- Más rápido que Imagen 4
- Gera 1 imagem por post (não 2)
- Pode incluir descrição textual
- Geralmente mais econômico

---

## 🎨 Estilos por Categoria

### 🛡️ Prevenção (9 posts)
```bash
python3 generate_blog_covers.py --category "Prevenção"
```
**Posts:** Teste Olhinho, Academia/Esportes, Terapias Genéticas, Visão de Computador, Olho Seco, Alimentação, Fotofobia, Presbiopia, Oftalmologia Pediátrica

**Características visuais:**
- ✅ Verde esmeralda + branco limpo
- ✅ Símbolos de proteção e saúde
- ✅ Mood confiável e preventivo
- ✅ Fotografia clean e moderna

---

### 💉 Tratamento (7 posts)
```bash
python3 generate_blog_covers.py --category "Tratamento"
```
**Posts:** Descolamento Retina, Coats, Estrabismo, Cirurgia Refrativa, Ducto Lacrimal, Lentes Premium Catarata, Pterígio

**Características visuais:**
- ✅ Azul profissional
- ✅ Equipamentos médicos e símbolos de cura
- ✅ Mood científico e preciso
- ✅ Fotografia hospitalar high-tech

---

### 🔬 Tecnologia (3 posts)
```bash
python3 generate_blog_covers.py --category "Tecnologia"
```
**Posts:** Retinose Pigmentar/Luxturna, Daltonismo/Lentes, IA em Exames

**Características visuais:**
- ✅ Roxo futurista + azul tech
- ✅ Tecnologia médica avançada e IA
- ✅ Mood inovador e cutting-edge
- ✅ Renderização 3D futurista

---

### ❓ Dúvidas Frequentes (3 posts)
```bash
python3 generate_blog_covers.py --category "Dúvidas Frequentes"
```
**Posts:** Moscas Volantes, Mitos e Verdades (ID 23)

**Características visuais:**
- ✅ Âmbar caloroso + amarelo dourado
- ✅ Ícones educativos e diálogos
- ✅ Mood acessível e informativo
- ✅ Ilustração médica friendly

---

## 🔄 Workflow Completo

### Cenário: Novo Post Publicado

**1. Identificar o post:**
```bash
python3 generate_blog_covers.py --list | grep "novo-post-titulo"
```

**2. Gerar capas (teste):**
```bash
python3 generate_blog_covers.py --post-id 24
```

**3. Revisar imagens geradas:**
```bash
ls -lh public/Blog/capa_post_24_*.png
```

**4. Se satisfeito, atualizar referência no blogPosts.js:**
```javascript
{
  id: 24,
  image: '/Blog/capa_post_24_opt1_20250930_173245.png',
  // ...
}
```

**5. Build e deploy:**
```bash
npm run build
sudo cp -r dist/* /var/www/html/
sudo systemctl reload nginx
```

---

## 🐛 Troubleshooting

### Erro: "API key não encontrada"
```bash
# Verificar se variável está configurada
echo $GOOGLE_GEMINI_API_KEY

# Se vazio, configurar:
export GOOGLE_GEMINI_API_KEY="sua_chave_aqui"
```

### Erro: "No module named 'google'"
```bash
# Reinstalar dependências
pip3 install -r scripts/requirements.txt
```

### Erro: "Nenhum post encontrado"
```bash
# Verificar se arquivo existe
ls -la src/data/blogPosts.js

# Testar parsing
python3 generate_blog_covers.py --list
```

### Imagens não aparecem no site
```bash
# Verificar permissões
ls -la public/Blog/

# Ajustar se necessário
chmod 644 public/Blog/capa_post_*.png

# Rebuild
npm run build
```

---

## 💡 Dicas Avançadas

### 1. Testar Prompt Antes de Gerar
O script mostra um preview do prompt antes de gerar. Revise para ajustar se necessário.

### 2. Gerar Múltiplas Variações
Execute o comando múltiplas vezes para obter diferentes variações:
```bash
python3 generate_blog_covers.py --post-id 22  # Primeira tentativa
python3 generate_blog_covers.py --post-id 22  # Segunda tentativa
```

### 3. Comparar Modelos
Gere com ambos os modelos e compare:
```bash
python3 generate_blog_covers.py --post-id 22 --model imagen
python3 generate_blog_covers.py --post-id 22 --model gemini-flash
```

### 4. Batch por Categoria
Gere todas as categorias separadamente para melhor controle:
```bash
python3 generate_blog_covers.py --category "Prevenção"
python3 generate_blog_covers.py --category "Tratamento"
python3 generate_blog_covers.py --category "Tecnologia"
python3 generate_blog_covers.py --category "Dúvidas Frequentes"
```

---

## 📊 Estimativas de Tempo e Custo

### Tempo de Geração
- **1 post (Imagen 4)**: ~20-30 segundos
- **1 categoria (~5 posts)**: ~2-3 minutos
- **Todos os posts (22)**: ~8-10 minutos

### Custos Estimados (Google Gemini API)
- **Imagen 4**: ~$0.04 USD por imagem
- **Gemini Flash**: ~$0.01-0.02 USD por imagem
- **22 posts (44 imagens)**: ~$1.76 USD com Imagen 4

---

## 🎓 Recursos de Aprendizado

### Melhorar Prompts
Edite o arquivo `generate_blog_covers.py`, linha ~60:
```python
MEDICAL_PROMPT_TEMPLATE = """
Crie uma imagem de capa profissional...
[Personalize aqui]
"""
```

### Adicionar Nova Categoria
Edite `CATEGORY_STYLES` no script (linha ~40):
```python
'Nova Categoria': {
    'color_palette': 'suas cores',
    'mood': 'seu mood',
    'visual_elements': 'seus elementos',
    'style': 'seu estilo'
}
```

---

**✨ Script desenvolvido para Saraiva Vision - Caratinga, MG**
