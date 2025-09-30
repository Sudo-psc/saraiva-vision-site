# Guia Completo: Geração de Imagens para Blog - Saraiva Vision

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Comparação de Modelos](#comparação-de-modelos)
3. [Cuando Usar Cada Modelo](#cuando-usar-cada-modelo)
4. [Imagen 4: Guia Completo](#imagen-4-guia-completo)
5. [Gemini Flash: Guia Completo](#gemini-flash-guia-completo)
6. [Prompt Engineering por Categoria](#prompt-engineering-por-categoria)
7. [Workflows Recomendados](#workflows-recomendados)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

A Saraiva Vision possui dois scripts especializados para geração de capas de blog:

1. **`generate_covers_imagen.py`** - Baseado em Imagen 4
2. **`generate_covers_gemini_flash.py`** - Baseado em Gemini 2.5 Flash Image Preview

Cada modelo tem forças e casos de uso específicos.

---

## 📊 Comparação de Modelos

### Imagen 4

| Característica | Detalhes |
|----------------|----------|
| **Modelo** | `imagen-4.0-generate-001` (Standard)<br>`imagen-4.0-ultra-generate-001` (Ultra)<br>`imagen-4.0-fast-generate-001` (Fast) |
| **Pontos Fortes** | Fotorrealismo, clareza, tipografia avançada |
| **Melhor Para** | Imagens de alta qualidade, branding, logos |
| **Resolução** | 1K (1024x1024) ou 2K (2048x2048) |
| **Aspect Ratios** | 1:1, 3:4, 4:3, 9:16, 16:9 |
| **Imagens por Request** | 1-4 |
| **Latência** | Baixa (rápido) |
| **Preço** | $0.02-$0.12 por imagem |
| **Quando Usar** | Fotorealismo, tipografia, branding |

### Gemini 2.5 Flash Image Preview

| Característica | Detalhes |
|----------------|----------|
| **Modelo** | `gemini-2.5-flash-image-preview` |
| **Pontos Fortes** | Edição conversacional, contexto profundo, combinações criativas |
| **Melhor Para** | Edição multi-turno, composição complexa |
| **Resolução** | 1024x1024 (padrão atual) |
| **Aspect Ratios** | Suporte limitado (1:1 predominante) |
| **Imagens por Request** | 1 |
| **Latência** | Média |
| **Preço** | $30 por 1M tokens (~1290 tokens/imagem) |
| **Quando Usar** | Edições, combinações, contexto narrativo |

---

## 🎯 Cuando Usar Cada Modelo

### Use **Imagen 4** Quando:

✅ **Fotorrealismo é Prioridade**
- Imagens de procedimentos médicos
- Fotos de equipamentos oftalmológicos
- Representações realistas de anatomia ocular

✅ **Tipografia e Texto são Necessários**
- Logos com texto legível
- Diagramas com etiquetas
- Infográficos médicos

✅ **Múltiplas Variações são Desejadas**
- Gerar 2-4 opções simultaneamente
- A/B testing de designs

✅ **Performance e Custo são Importantes**
- Geração rápida (baixa latência)
- Custo mais previsível por imagem

**Exemplo de Comando:**
```bash
python3 scripts/generate_covers_imagen.py --post-id 22 --variations 3 --aspect-ratio 16:9
```

---

### Use **Gemini Flash** Quando:

✅ **Edições Conversacionais são Necessárias**
- Ajustar cores de uma imagem existente
- Adicionar/remover elementos iterativamente
- Refinar progressivamente até o resultado ideal

✅ **Composições Complexas**
- Combinar elementos de múltiplas imagens
- Transferência de estilo artístico
- Fusão criativa de conceitos

✅ **Contexto Narrativo é Rico**
- Posts com histórias complexas
- Conceitos abstratos que requerem interpretação
- Simbolismos sofisticados

✅ **Geração Intercalada Texto + Imagem**
- Receitas médicas ilustradas passo-a-passo
- Tutoriais com imagens inline

**Exemplo de Comando:**
```bash
python3 scripts/generate_covers_gemini_flash.py --post-id 16

# Modo de edição
python3 scripts/generate_covers_gemini_flash.py \
    --edit public/Blog/capa_post_16_gemini_flash_*.png \
    --edit-instruction "Change the color scheme to warm amber tones" \
    --post-id 16
```

---

## 🎨 Imagen 4: Guia Completo

### Instalação

```bash
# Instalar dependências
pip3 install google-genai pillow

# Configurar API key
export GOOGLE_GEMINI_API_KEY="sua_chave_aqui"
```

### Uso Básico

```bash
# Post específico (2 variações em 16:9)
python3 scripts/generate_covers_imagen.py --post-id 22

# Categoria com 4 variações
python3 scripts/generate_covers_imagen.py --category "Tecnologia" --variations 4

# Todos os posts
python3 scripts/generate_covers_imagen.py --all
```

### Opções Avançadas

```bash
# Modelo Ultra (máxima qualidade, mais caro)
python3 scripts/generate_covers_imagen.py \
    --post-id 22 \
    --model imagen-4.0-ultra-generate-001 \
    --variations 2

# Modelo Fast (geração rápida, custo menor)
python3 scripts/generate_covers_imagen.py \
    --post-id 22 \
    --model imagen-4.0-fast-generate-001 \
    --variations 4

# Aspect ratios diferentes
python3 scripts/generate_covers_imagen.py --post-id 22 --aspect-ratio 1:1
python3 scripts/generate_covers_imagen.py --post-id 22 --aspect-ratio 4:3
python3 scripts/generate_covers_imagen.py --post-id 22 --aspect-ratio 9:16  # Vertical
```

### Prompts Otimizados para Imagen 4

**Estrutura Ideal:**
```
1. Descrição fotográfica específica
2. Especificações de câmera/lente
3. Iluminação e atmosfera
4. Detalhes de composição
5. Estilo artístico (se aplicável)
```

**Exemplo para Prevenção:**
```
A professional medical photography of a symbolic eye shield representing
preventive care. Shot with 50mm prime lens at f/2.8, natural soft lighting
from the left. Centered composition with negative space. Emerald green (#10B981)
and clean white color palette. Clean, modern, minimalist aesthetic.
High resolution 4K quality. NO text overlay.
```

**Exemplo para Tecnologia:**
```
A 3D rendered futuristic medical AI interface floating in space. Volumetric
lighting with purple (#8B5CF6) and cyan (#06B6D4) gradient overlays. Isometric
view showing neural network patterns and holographic eye scans. Ray-traced
rendering with 4K quality. Cyberpunk medical aesthetic. NO text.
```

### Melhores Práticas Imagen 4

#### ✅ Fazer:

- **Seja Hiperspecífico**: "50mm prime lens, f/2.8" vs "boa câmera"
- **Use Termos Fotográficos**: bokeh, golden hour, depth of field
- **Especifique Cores com Hex**: #10B981 em vez de "verde"
- **Descreva Narrativamente**: Conte uma cena, não liste palavras-chave
- **Referencie Estilos**: "medical photography style" ou "art deco design"

#### ❌ Evitar:

- **Prompts Genéricos**: "imagem bonita de olho"
- **Listas de Keywords**: "olho, médico, saúde, tecnologia, azul"
- **Negativos Diretos**: Em vez de "não escuro", diga "iluminado"
- **Instruções Vagas**: "faça algo interessante"

### Limitações Imagen 4

- ⚠️ Não edita imagens existentes (apenas geração do zero)
- ⚠️ Não suporta entrada de imagens
- ⚠️ Geração de pessoas pode ser restrita em certas regiões
- ⚠️ Limite de 480 tokens de prompt

---

## 🚀 Gemini Flash: Guia Completo

### Instalação

```bash
# Já instalado se você instalou as dependências do Imagen
pip3 install google-genai pillow

export GOOGLE_GEMINI_API_KEY="sua_chave_aqui"
```

### Uso Básico

```bash
# Geração simples
python3 scripts/generate_covers_gemini_flash.py --post-id 16

# Por categoria
python3 scripts/generate_covers_gemini_flash.py --category "Tecnologia"

# Listar posts
python3 scripts/generate_covers_gemini_flash.py --list
```

### Modo de Edição (Funcionalidade Avançada)

```bash
# Editar imagem existente
python3 scripts/generate_covers_gemini_flash.py \
    --edit public/Blog/capa_post_16_gemini_flash_20250930_175253.png \
    --edit-instruction "Add a subtle purple glow effect around the edges" \
    --post-id 16

# Mudança de cor
python3 scripts/generate_covers_gemini_flash.py \
    --edit public/Blog/capa_original.png \
    --edit-instruction "Change the color scheme to warm amber and golden yellow tones" \
    --post-id 23

# Adicionar elemento
python3 scripts/generate_covers_gemini_flash.py \
    --edit public/Blog/capa_original.png \
    --edit-instruction "Add a shield symbol in the center with emerald green color" \
    --post-id 22
```

### Prompts Otimizados para Gemini Flash

**Estrutura Ideal:**
```
1. Descrição narrativa da cena
2. Mood e atmosfera emocional
3. Composição e elementos visuais
4. Cor e estilo artístico
5. Contexto do blog post
```

**Exemplo para Tratamento:**
```
Generate an image showing a scene representing advanced eye treatment therapy.

A therapeutic medical scene where precision medical instruments are delicately
positioned around a symbolic eye representation. Professional blue tones (#3B82F6)
create a sense of scientific precision and trust. Dynamic perspective with depth
of field showing medical excellence. The atmosphere is scientific, precise, and
cutting-edge. Modern high-tech medical facility aesthetic with clinical perfection.

Context: This is a blog cover about "Retinal Detachment Treatment" for patients
in Caratinga, MG, Brazil.

Generate the visual image in 16:9 landscape format. NO text or words.
```

**Exemplo para Dúvidas Frequentes:**
```
Create an educational scene that welcomes people seeking eye health answers.

An approachable, friendly composition featuring question mark symbols and dialogue
elements floating in a warm, inviting space. Warm amber (#F59E0B) and golden yellow
(#FCD34D) color palette creates accessibility and comfort. Modern flat illustration
style with depth. The atmosphere is educational, welcoming, and informative - like
a knowledgeable friend explaining medical concepts.

Context: Blog post answering common questions about "Floaters in Vision"
for Brazilian patients.

16:9 landscape format, NO text overlay.
```

### Melhores Práticas Gemini Flash

#### ✅ Fazer:

- **Narrativas Descritivas**: Conte uma história visual
- **Contexto Rico**: Explique o propósito e público-alvo
- **Edições Iterativas**: Use o modo de edição para refinar
- **Descrições Emocionais**: Mood, atmosfera, sentimentos
- **Simbolismo Abstrato**: "representa confiança" vs "escudo literal"

#### ❌ Evitar:

- **Instruções Técnicas Demais**: Menos "50mm f/2.8", mais "perspectiva íntima"
- **Prompts Muito Curtos**: Gemini se beneficia de contexto
- **Solicitações Literais Demais**: Prefira interpretação abstrata

### Limitações Gemini Flash

- ⚠️ Gera 1 imagem por vez (não múltiplas variações)
- ⚠️ Suporte limitado a aspect ratios (predominância 1:1)
- ⚠️ Pode retornar texto em vez de imagem se prompt ambíguo
- ⚠️ Precificação por token (menos previsível)

---

## 🎨 Prompt Engineering por Categoria

### 🛡️ Prevenção (Verde Esmeralda)

**Objetivo:** Transmitir confiança, cuidado preventivo, proteção

**Imagen 4 Prompt:**
```
Professional medical photography of preventive eye care symbolism.
Shot with 50mm prime lens, f/2.8, natural soft window lighting.
Centered composition with generous negative space. Emerald green
(#10B981) shield symbol overlaying clean white background.
Protective hands gesture cradling abstract eye representation.
Clean, modern, minimalist aesthetic. 4K high resolution.
NO text overlay. Trustworthy healthcare atmosphere.
```

**Gemini Flash Prompt:**
```
A scene representing preventive eye healthcare protection for families
and children. Symbolic shield made of soft emerald green light (#10B981)
gently surrounding an abstract eye symbol. Caring hands in the composition
suggest protection and care. The mood is trustworthy, professional, and
welcoming - like a guardian watching over precious vision. Modern medical
photography meets abstract symbolism. Clean, approachable design suitable
for a Brazilian ophthalmology clinic blog about preventive care.

16:9 landscape, NO text.
```

---

### 💉 Tratamento (Azul Profissional)

**Objetivo:** Demonstrar precisão científica, tecnologia avançada, cura

**Imagen 4 Prompt:**
```
High-tech medical facility photography showing precision ophthalmology
instruments. Shot with 85mm lens, f/1.8, clinical diffused lighting.
Dynamic angle with shallow depth of field, bokeh background. Professional
blue color palette (#3B82F6) with white clinical surfaces. Medical precision
tools in sharp focus. Modern hospital aesthetic. 4K HDR quality.
NO text. Scientific therapeutic atmosphere.
```

**Gemini Flash Prompt:**
```
A therapeutic medical scene showcasing advanced eye treatment technology.
Precision medical instruments positioned with scientific exactness around
a central abstract eye element. Professional blue tones (#3B82F6) create
a sense of science, trust, and medical expertise. The composition suggests
dynamic movement and depth - instruments working in harmony. Atmosphere is
scientific, precise, and cutting-edge medicine. High-tech medical facility
with clinical perfection aesthetic. Context: Blog about retinal treatment
procedures in Caratinga, MG.

16:9 landscape, NO text overlay.
```

---

### 🔬 Tecnologia (Roxo Futurista)

**Objetivo:** Mostrar inovação, futuro da medicina, IA

**Imagen 4 Prompt:**
```
3D rendered futuristic medical AI interface visualization. Volumetric ray-traced
lighting with purple (#8B5CF6) and cyan (#06B6D4) gradient overlays. Isometric
view showing neural network patterns analyzing holographic eye scans. Floating
digital interfaces with glowing elements. Cyberpunk medical aesthetic with neon
accents. 4K rendered quality. NO text. Innovative sci-fi atmosphere.
```

**Gemini Flash Prompt:**
```
Futuristic medical technology transforming ophthalmology practice. A 3D rendered
scene where artificial intelligence visualizes eye health data in stunning ways.
Neural network patterns flow through space in purple (#8B5CF6) and blue (#06B6D4)
gradients. Holographic eye scans float in an isometric composition. The mood is
innovative, futuristic, and cutting-edge - showing the exciting future of medical
care. Volumetric lighting creates depth and drama. Context: Blog post about how
AI is revolutionizing eye exams in Caratinga, MG, Brazil.

16:9 landscape, NO text.
```

---

### ❓ Dúvidas Frequentes (Âmbar Caloroso)

**Objetivo:** Educar, acolher, responder perguntas

**Imagen 4 Prompt:**
```
Modern medical illustration in flat design style with dimensional depth.
Warm amber (#F59E0B) and golden yellow (#FCD34D) color palette. Balanced
symmetrical composition with question mark icons and dialogue bubble elements.
Educational symbols arranged in friendly, approachable layout. Vector-inspired
clean lines. Professional yet welcoming atmosphere. High resolution. NO text.
```

**Gemini Flash Prompt:**
```
An educational scene welcoming people seeking answers about eye health.
Question marks and information symbols float in a warm, inviting environment
colored in amber (#F59E0B) and golden yellow (#FCD34D). The composition feels
like a friendly conversation - approachable, clear, informative. Modern flat
illustration style with subtle depth creates accessibility. The atmosphere is
educational without being intimidating, welcoming without being childish.
Like a knowledgeable doctor taking time to explain medical concepts clearly.
Context: Blog answering common questions about eye floaters for patients in
Caratinga, MG.

16:9 landscape, NO text.
```

---

## 🔄 Workflows Recomendados

### Workflow 1: Fotorrealismo de Alta Qualidade

**Objetivo:** Capa fotorrealista perfeita

```bash
# 1. Gerar 4 variações com Imagen 4 Standard
python3 scripts/generate_covers_imagen.py \
    --post-id 22 \
    --variations 4 \
    --aspect-ratio 16:9

# 2. Revisar as 4 opções geradas
ls -lh public/Blog/capa_post_22_imagen4_opt*

# 3. Se precisar de qualidade máxima, usar Ultra
python3 scripts/generate_covers_imagen.py \
    --post-id 22 \
    --model imagen-4.0-ultra-generate-001 \
    --variations 2 \
    --aspect-ratio 16:9

# 4. Escolher a melhor opção
```

**Custo Estimado:** $0.08-$0.24 (4 imagens Standard) ou $0.24-$0.48 (2 imagens Ultra)

---

### Workflow 2: Edição Iterativa e Refinamento

**Objetivo:** Refinar até o resultado perfeito

```bash
# 1. Gerar base com Gemini Flash
python3 scripts/generate_covers_gemini_flash.py --post-id 16

# 2. Revisar e decidir ajustes
# Saída: public/Blog/capa_post_16_gemini_flash_20250930_175253.png

# 3. Primeira edição - ajustar cores
python3 scripts/generate_covers_gemini_flash.py \
    --edit public/Blog/capa_post_16_gemini_flash_20250930_175253.png \
    --edit-instruction "Make the purple tones more vibrant and add subtle glow" \
    --post-id 16

# 4. Segunda edição - adicionar elemento
python3 scripts/generate_covers_gemini_flash.py \
    --edit public/Blog/capa_post_16_gemini_edited_*.png \
    --edit-instruction "Add a subtle AI neural network pattern in the background" \
    --post-id 16

# 5. Edição final - ajuste fino
python3 scripts/generate_covers_gemini_flash.py \
    --edit public/Blog/capa_post_16_gemini_edited_*.png \
    --edit-instruction "Increase overall brightness by 10% and add warmth" \
    --post-id 16
```

**Custo Estimado:** ~$0.12-$0.15 por geração/edição (baseado em tokens)

---

### Workflow 3: Batch Generation para Categoria

**Objetivo:** Gerar capas para todos os posts de uma categoria

```bash
# Tecnologia (3 posts) com Imagen 4 Fast (rápido e barato)
python3 scripts/generate_covers_imagen.py \
    --category "Tecnologia" \
    --model imagen-4.0-fast-generate-001 \
    --variations 3

# Resultado: 9 imagens (3 posts × 3 variações)
```

**Tempo Estimado:** 30-60 segundos
**Custo Estimado:** $0.18-$0.27

---

### Workflow 4: Teste A/B de Designs

**Objetivo:** Testar diferentes estilos

```bash
# Opção A: Fotorrealista (Imagen 4)
python3 scripts/generate_covers_imagen.py \
    --post-id 22 \
    --variations 2

# Opção B: Abstrato/Artístico (Gemini Flash)
python3 scripts/generate_covers_gemini_flash.py \
    --post-id 22

# Comparar resultados e escolher o melhor
```

---

## 🐛 Troubleshooting

### Problema: "API key não encontrada"

**Solução:**
```bash
export GOOGLE_GEMINI_API_KEY="AIzaSy..."
echo $GOOGLE_GEMINI_API_KEY  # Verificar
```

### Problema: Imagen gera imagem 1:1 em vez de 16:9

**Causa:** Aspect ratio não suportado para o modelo escolhido

**Solução:**
```bash
# Verificar modelos compatíveis
python3 scripts/generate_covers_imagen.py --help

# Usar Standard ou Ultra (não Fast) para 16:9
python3 scripts/generate_covers_imagen.py \
    --model imagen-4.0-generate-001 \
    --aspect-ratio 16:9
```

### Problema: Gemini Flash retorna apenas texto

**Causa:** Prompt interpretado como solicitação de descrição

**Solução:**
```python
# Adicionar ao início do prompt:
"Generate an image (not text description)."
"Create a visual image now."

# Ou usar linguagem mais direta:
"Show me an image of..."
```

### Problema: Imagem contém texto indesejado

**Causa:** Prompt não especificou claramente "NO text"

**Solução:**
```python
# Sempre incluir no final do prompt:
"NO text, NO words, NO letters anywhere in the image."
"Clean design without any text overlay."
```

### Problema: Cores não correspondem ao solicitado

**Imagen 4 Solução:**
```python
# Usar códigos hex específicos
"emerald green (#10B981)" em vez de "verde"
"professional blue (#3B82F6)" em vez de "azul"
```

**Gemini Flash Solução:**
```python
# Descrever mood e contexto das cores
"warm amber tones (#F59E0B) that create a welcoming atmosphere"
```

### Problema: Custo muito alto

**Solução para Imagen:**
```bash
# Usar modelo Fast
--model imagen-4.0-fast-generate-001

# Reduzir número de variações
--variations 2  # em vez de 4
```

**Solução para Gemini:**
```bash
# Usar prompts mais concisos
# Evitar múltiplas edições quando possível
# Preferir Imagen 4 se não precisar de edição
```

---

## 📊 Tabela de Decisão Rápida

| Necessidade | Modelo Recomendado | Comando |
|-------------|-------------------|---------|
| **Fotorrealismo** | Imagen 4 Standard | `--model imagen-4.0-generate-001` |
| **Máxima Qualidade** | Imagen 4 Ultra | `--model imagen-4.0-ultra-generate-001` |
| **Geração Rápida** | Imagen 4 Fast | `--model imagen-4.0-fast-generate-001` |
| **Edição Iterativa** | Gemini Flash | `generate_covers_gemini_flash.py --edit` |
| **Múltiplas Variações** | Imagen 4 | `--variations 4` |
| **Custo Mínimo** | Imagen 4 Fast | `imagen-4.0-fast-generate-001 --variations 2` |
| **Contexto Narrativo** | Gemini Flash | `generate_covers_gemini_flash.py` |
| **Tipografia** | Imagen 4 | Cualquer versão Imagen |
| **Composição Complexa** | Gemini Flash | Com edições multi-turno |

---

## ✅ Checklist Pré-Geração

Antes de gerar imagens, certifique-se:

- [ ] API key configurada (`echo $GOOGLE_GEMINI_API_KEY`)
- [ ] Post existe (`--list` para verificar)
- [ ] Categoria correta no `blogPosts.js`
- [ ] Diretório de saída tem permissão de escrita
- [ ] Modelo escolhido está correto para o caso de uso
- [ ] Aspect ratio suportado pelo modelo
- [ ] Prompt inclui "NO text" se necessário

---

## 📚 Recursos Adicionais

- **Documentação Oficial Imagen:** https://ai.google.dev/gemini-api/docs/imagen
- **Documentação Gemini Image:** https://ai.google.dev/gemini-api/docs/image-generation
- **Google AI Studio:** https://aistudio.google.com/
- **Pricing Calculator:** https://ai.google.dev/pricing

---

**Última Atualização:** 30/09/2025
**Versão:** 1.0
**Autor:** Saraiva Vision Development Team
