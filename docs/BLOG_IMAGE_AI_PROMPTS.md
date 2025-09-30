# Prompts de IA para Geração de Imagens - Blog Saraiva Vision

**Versão:** 1.0
**Última atualização:** 30 de Setembro, 2025
**Compatível com:** DALL-E 3, Midjourney, Stable Diffusion, Leonardo AI

---

## 📋 Índice

1. [Como Usar Este Documento](#como-usar-este-documento)
2. [Parâmetros Técnicos Padrão](#parâmetros-técnicos-padrão)
3. [Prompts por Categoria](#prompts-por-categoria)
4. [Prompts por Contexto](#prompts-por-contexto)
5. [Exemplos Práticos](#exemplos-práticos)
6. [Refinamento e Iteração](#refinamento-e-iteração)

---

## 📝 Como Usar Este Documento

### Placeholder {clipboard}

O placeholder `{clipboard}` representa o **título do post** e deve ser substituído pelo título real do artigo.

**Exemplo:**
```
Título do post: "Cuidados Visuais para Esportes"
Substituir: {clipboard} → Cuidados Visuais para Esportes
```

### Estrutura do Prompt

Cada prompt segue esta estrutura:

```
[DESCRIÇÃO DA CENA] + [ESTILO VISUAL] + [COMPOSIÇÃO] + [ILUMINAÇÃO] + [CORES] + [QUALIDADE]
```

### Ferramentas Recomendadas

1. **DALL-E 3** (OpenAI) - Melhor para realismo médico
2. **Midjourney V6** - Melhor para composições artísticas
3. **Leonardo AI** - Melhor custo-benefício
4. **Stable Diffusion XL** - Melhor controle técnico

---

## ⚙️ Parâmetros Técnicos Padrão

### Dimensões por Contexto

```yaml
Card Principal (Grid):
  - Dimensão: 1200x800px
  - Aspect Ratio: 3:2
  - Prompt parameter: --ar 3:2 ou 1200x800

Featured Image (Post):
  - Dimensão: 1920x1080px
  - Aspect Ratio: 16:9
  - Prompt parameter: --ar 16:9 ou 1920x1080

Hero Header:
  - Dimensão: 1920x1280px
  - Aspect Ratio: 3:2
  - Prompt parameter: --ar 3:2 ou 1920x1280

Posts Relacionados:
  - Dimensão: 800x600px
  - Aspect Ratio: 4:3
  - Prompt parameter: --ar 4:3 ou 800x600
```

### Parâmetros de Qualidade (Midjourney)

```
--style raw           # Estilo fotográfico realista
--stylize 200         # Balanço entre realismo e estética
--quality 2           # Máxima qualidade (consumo: 2 créditos)
--chaos 10            # Baixa variação (consistência)
--v 6                 # Versão 6 (mais recente)
```

### Parâmetros de Qualidade (DALL-E 3)

```
Quality: hd
Style: natural
Size: 1792x1024 (landscape) ou 1024x1792 (portrait)
```

### Parâmetros de Qualidade (Leonardo AI)

```
Model: Leonardo Diffusion XL
Width: 1200
Height: 800
Guidance Scale: 7
Steps: 50
Photo Real: Enabled
```

---

## 🎨 Prompts por Categoria

### 1️⃣ CATEGORIA: PREVENÇÃO (Verde Emerald)

#### 🎯 Prompt Base - Card (1200x800px, 3:2)

```
Professional medical photography for ophthalmology blog about "{clipboard}". Scene shows preventive eye care in a natural, healthy environment. A person wearing UV-protective sunglasses outdoors, soft natural lighting during golden hour, shallow depth of field with beautiful bokeh background featuring green vegetation. Color palette: emerald green (#10b981), soft blues, natural tones. Composition follows rule of thirds with 35% negative space. Clean, modern, professional medical aesthetic. Shot with 85mm lens at f/2.8. High-end medical photography style, authentic and relatable, not stock photo. --ar 3:2 --style raw --stylize 200 --quality 2 --v 6
```

#### 📱 Prompt Base - Featured Image (1920x1080px, 16:9)

```
Wide cinematic medical photography for ophthalmology article titled "{clipboard}". Preventive eye care concept showing healthy lifestyle and vision protection. Professional scene with natural lighting, emerald green color accents (#10b981), gradient from emerald-50 to white in background. Shallow depth of field, professional medical environment, authentic moment. Composition with safe zone margins (80px) for text overlay. Shot in 4K quality, clean aesthetic, modern healthcare photography. --ar 16:9 --style raw --stylize 250 --quality 2 --v 6
```

#### 🎨 Especificações de Cor

```css
Cor Principal: #10b981 (Emerald-500)
Cor Secundária: #d1fae5 (Emerald-100)
Cor de Acento: #059669 (Emerald-600)
Background Gradient: linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)
Overlay: rgba(16, 185, 129, 0.1)
```

#### 📋 Prompt Completo Pronto para Copiar

**Para DALL-E 3:**
```
Create a professional medical photograph for an ophthalmology blog post titled "{clipboard}". The image should depict preventive eye care in a natural, healthy outdoor setting. Feature a person wearing UV-protective sunglasses with soft natural lighting during golden hour. Use shallow depth of field with beautiful bokeh background showing lush green vegetation. Color palette: emerald green (#10b981), soft blues, and natural earth tones. Composition should follow the rule of thirds with 35% negative space for text overlay. Style: clean, modern, professional medical photography, authentic and relatable - avoid stock photo aesthetics. Camera: shot with 85mm lens at f/2.8 equivalent. High-resolution, photorealistic, medical-grade quality. Dimensions: 1200x800px landscape orientation.
```

**Para Midjourney:**
```
Professional medical photography for ophthalmology blog about "{clipboard}", preventive eye care, person wearing UV sunglasses outdoors, golden hour natural lighting, shallow depth of field f/2.8, bokeh background with green vegetation, emerald green color palette #10b981, rule of thirds composition, 35% negative space, clean modern aesthetic, authentic medical photography, not stock photo, shot with 85mm lens, high-end healthcare photography, photorealistic --ar 3:2 --style raw --stylize 200 --quality 2 --v 6
```

---

### 2️⃣ CATEGORIA: TRATAMENTO (Azul Blue)

#### 🎯 Prompt Base - Card (1200x800px, 3:2)

```
Professional medical photography for ophthalmology blog about "{clipboard}". Scene shows modern ophthalmic treatment environment with advanced diagnostic equipment. Ophthalmologist using high-tech medical device in clean clinical setting, soft diffused LED lighting, focus on equipment with doctor softly blurred in background. Color palette: professional blue (#0ea5e9), white clinical tones, metallic accents. Composition follows rule of thirds with 30% negative space. Clean, trustworthy, high-tech medical aesthetic. Shot with 50mm lens at f/4. Premium healthcare photography, authentic clinical environment. --ar 3:2 --style raw --stylize 200 --quality 2 --v 6
```

#### 📱 Prompt Base - Featured Image (1920x1080px, 16:9)

```
Cinematic medical photography for ophthalmology article titled "{clipboard}". Modern ophthalmic treatment concept showing state-of-the-art technology and medical expertise. Professional clinical scene with soft LED lighting, blue color accents (#0ea5e9), gradient from blue-50 to white background. Shallow to medium depth of field, high-tech medical equipment in focus, authentic hospital/clinic environment. Composition with safe zone margins (80px) for text overlay. Shot in 4K quality, clean professional aesthetic, contemporary healthcare photography, conveys trust and expertise. --ar 16:9 --style raw --stylize 250 --quality 2 --v 6
```

#### 🎨 Especificações de Cor

```css
Cor Principal: #0ea5e9 (Blue-500)
Cor Secundária: #dbeafe (Blue-100)
Cor de Acento: #0284c7 (Blue-600)
Background Gradient: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%)
Overlay: rgba(14, 165, 233, 0.15)
```

#### 📋 Prompt Completo Pronto para Copiar

**Para DALL-E 3:**
```
Create a professional medical photograph for an ophthalmology blog post titled "{clipboard}". The image should showcase modern ophthalmic treatment with advanced diagnostic equipment in a clean clinical setting. Feature an ophthalmologist using high-tech medical devices with soft diffused LED lighting. Use shallow to medium depth of field with the equipment in sharp focus and the doctor softly blurred in the background. Color palette: professional blue (#0ea5e9), pristine white clinical tones, subtle metallic accents. Composition should follow the rule of thirds with 30% negative space for text overlay. Style: clean, trustworthy, high-tech medical aesthetic that conveys expertise and modern healthcare. Camera: shot with 50mm lens at f/4 equivalent. Premium healthcare photography, authentic clinical environment, photorealistic. Dimensions: 1200x800px landscape orientation.
```

**Para Midjourney:**
```
Professional medical photography for ophthalmology blog about "{clipboard}", modern ophthalmic treatment, ophthalmologist using advanced diagnostic equipment, clean clinical setting, soft diffused LED lighting, shallow depth of field f/4, equipment in focus doctor blurred background, professional blue color palette #0ea5e9, white clinical tones, metallic accents, rule of thirds composition, 30% negative space, high-tech trustworthy aesthetic, authentic medical environment, shot with 50mm lens, premium healthcare photography, photorealistic --ar 3:2 --style raw --stylize 200 --quality 2 --v 6
```

---

### 3️⃣ CATEGORIA: TECNOLOGIA (Roxo Purple)

#### 🎯 Prompt Base - Card (1200x800px, 3:2)

```
Professional medical photography for ophthalmology blog about "{clipboard}". Scene shows cutting-edge ophthalmic technology with digital diagnostic screens displaying colorful topography data. Modern laser equipment or OCT machine with glowing purple and blue digital interfaces, darkened clinical environment with focused LED lighting on screens. Color palette: vibrant purple (#a855f7), electric blue, digital cyan, with subtle green data visualization. Composition follows rule of thirds with 25% negative space. Futuristic, innovative, high-tech medical aesthetic. Shot with 35mm lens at f/2.8. Premium technology-focused healthcare photography, authentic advanced equipment. --ar 3:2 --style raw --stylize 250 --quality 2 --v 6
```

#### 📱 Prompt Base - Featured Image (1920x1080px, 16:9)

```
Cinematic medical photography for ophthalmology article titled "{clipboard}". Cutting-edge ophthalmic technology concept showing innovation and precision in eye care. Professional scene with dramatic lighting on digital equipment screens, purple color accents (#a855f7), gradient from purple-50 to white background with digital glow effects. Shallow depth of field focusing on technology interface, modern equipment, futuristic medical environment. Composition with safe zone margins (80px) for text overlay. Shot in 4K quality, sleek high-tech aesthetic, contemporary innovation-focused healthcare photography, conveys advancement and precision. --ar 16:9 --style raw --stylize 300 --quality 2 --v 6
```

#### 🎨 Especificações de Cor

```css
Cor Principal: #a855f7 (Purple-500)
Cor Secundária: #f3e8ff (Purple-100)
Cor de Acento: #9333ea (Purple-600)
Background Gradient: linear-gradient(135deg, #faf5ff 0%, #ffffff 100%)
Overlay: rgba(168, 85, 247, 0.12)
Digital Accents: #3b82f6 (Blue), #06b6d4 (Cyan), #10b981 (Green)
```

#### 📋 Prompt Completo Pronto para Copiar

**Para DALL-E 3:**
```
Create a professional medical photograph for an ophthalmology blog post titled "{clipboard}". The image should showcase cutting-edge ophthalmic technology with digital diagnostic screens displaying colorful eye topography data. Feature modern laser equipment or OCT machine with glowing purple and blue digital interfaces in a darkened clinical environment with focused LED lighting on the screens. Color palette: vibrant purple (#a855f7), electric blue, digital cyan, with subtle green data visualization elements. Composition should follow the rule of thirds with 25% negative space for text overlay. Style: futuristic, innovative, high-tech medical aesthetic that conveys precision and advancement. Camera: shot with 35mm lens at f/2.8 equivalent. Premium technology-focused healthcare photography, authentic advanced equipment, photorealistic with slight digital glow. Dimensions: 1200x800px landscape orientation.
```

**Para Midjourney:**
```
Professional medical photography for ophthalmology blog about "{clipboard}", cutting-edge ophthalmic technology, digital diagnostic screens with colorful topography data, modern laser equipment OCT machine, glowing purple and blue interfaces, darkened clinical environment, focused LED lighting on screens, vibrant purple color palette #a855f7, electric blue digital cyan, green data visualization, rule of thirds composition, 25% negative space, futuristic innovative aesthetic, authentic advanced equipment, shot with 35mm lens f/2.8, premium technology healthcare photography, photorealistic with digital glow --ar 3:2 --style raw --stylize 250 --quality 2 --v 6
```

---

### 4️⃣ CATEGORIA: DÚVIDAS FREQUENTES (Amarelo Amber)

#### 🎯 Prompt Base - Card (1200x800px, 3:2)

```
Professional medical photography for ophthalmology blog about "{clipboard}". Scene shows doctor-patient communication moment, ophthalmologist explaining with anatomical eye model or educational materials, warm and welcoming consultation room setting. Natural window light creating soft, approachable atmosphere, focus on gestures of explanation and understanding. Color palette: warm amber yellow (#f59e0b), soft orange tones, natural wood elements, white clinical accents. Composition follows rule of thirds with 30% negative space. Educational, approachable, trustworthy medical aesthetic. Shot with 50mm lens at f/2.8. Authentic healthcare photography emphasizing communication and clarity. --ar 3:2 --style raw --stylize 200 --quality 2 --v 6
```

#### 📱 Prompt Base - Featured Image (1920x1080px, 16:9)

```
Cinematic medical photography for ophthalmology article titled "{clipboard}". Educational eye care concept showing clear communication and patient understanding. Professional scene with warm natural lighting from windows, amber color accents (#f59e0b), gradient from amber-50 to white background. Medium depth of field showing doctor-patient interaction or educational materials, welcoming consultation environment. Composition with safe zone margins (80px) for text overlay. Shot in 4K quality, warm approachable aesthetic, contemporary patient-centered healthcare photography, conveys clarity and education. --ar 16:9 --style raw --stylize 250 --quality 2 --v 6
```

#### 🎨 Especificações de Cor

```css
Cor Principal: #f59e0b (Amber-500)
Cor Secundária: #fef3c7 (Amber-100)
Cor de Acento: #d97706 (Amber-600)
Background Gradient: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)
Overlay: rgba(245, 158, 11, 0.1)
Natural Accents: #92400e (Wood brown), #ffffff (White)
```

#### 📋 Prompt Completo Pronto para Copiar

**Para DALL-E 3:**
```
Create a professional medical photograph for an ophthalmology blog post titled "{clipboard}". The image should depict a warm doctor-patient communication moment with an ophthalmologist explaining eye care using an anatomical eye model or educational materials in a welcoming consultation room. Use natural window light creating a soft, approachable atmosphere with focus on gestures of explanation and patient understanding. Color palette: warm amber yellow (#f59e0b), soft orange tones, natural wood elements, white clinical accents. Composition should follow the rule of thirds with 30% negative space for text overlay. Style: educational, approachable, trustworthy medical aesthetic that conveys clarity and patient care. Camera: shot with 50mm lens at f/2.8 equivalent. Authentic healthcare photography emphasizing communication and education, photorealistic. Dimensions: 1200x800px landscape orientation.
```

**Para Midjourney:**
```
Professional medical photography for ophthalmology blog about "{clipboard}", doctor-patient communication, ophthalmologist explaining with anatomical eye model, educational materials, warm welcoming consultation room, natural window light, soft approachable atmosphere, focus on explanation gestures, warm amber yellow color palette #f59e0b, soft orange tones, natural wood elements, white clinical accents, rule of thirds composition, 30% negative space, educational trustworthy aesthetic, authentic healthcare photography, shot with 50mm lens f/2.8, emphasizing communication clarity --ar 3:2 --style raw --stylize 200 --quality 2 --v 6
```

---

## 📐 Prompts por Contexto

### Hero Header (1920x1280px, 3:2)

```
Cinematic wide-angle medical photography for ophthalmology hero header about "{clipboard}". Dramatic professional healthcare scene with epic composition, [CATEGORIA-SPECIFIC SCENE DESCRIPTION]. Shot with 24mm lens creating expansive feel, dramatic lighting with depth, color palette: [CATEGORIA COLORS], gradient overlay from [COLOR]-50 to white. Large safe zone margins (120px all sides) for text overlay and title placement. Ultra-wide composition following rule of thirds, 40% negative space at top third for headline text. Premium editorial healthcare photography, cinematic quality, authentic medical environment. --ar 3:2 --style raw --stylize 300 --quality 2 --v 6
```

**Substituir [CATEGORIA-SPECIFIC SCENE DESCRIPTION]:**
- **Prevenção:** outdoor health and wellness setting, natural environment, protective eye care
- **Tratamento:** state-of-the-art medical facility, advanced diagnostic equipment
- **Tecnologia:** futuristic medical technology, digital interfaces, innovation focus
- **Dúvidas:** warm consultation setting, doctor-patient communication, educational focus

---

### Posts Relacionados - Compact (800x600px, 4:3)

```
Simplified professional medical photography for ophthalmology related post about "{clipboard}". Clean minimalist composition focusing on [CATEGORIA SUBJECT], [CATEGORIA COLOR] color palette, soft even lighting, medium depth of field. Composition with centered focal point, 20% negative space. Compact format optimized for thumbnail display while maintaining clarity and professionalism. Shot with 50mm lens at f/4. High-quality medical photography, clean aesthetic. --ar 4:3 --style raw --stylize 150 --quality 1 --v 6
```

**Substituir [CATEGORIA SUBJECT]:**
- **Prevenção:** UV protection, healthy lifestyle
- **Tratamento:** medical equipment, clinical care
- **Tecnologia:** digital technology, innovation
- **Dúvidas:** patient education, communication

---

## 💡 Exemplos Práticos

### Exemplo 1: Post sobre Catarata (Tratamento)

**Título do Post:** "Cirurgia de Catarata: Guia Completo"

**Prompt Final (Midjourney):**
```
Professional medical photography for ophthalmology blog about "Cirurgia de Catarata: Guia Completo", modern ophthalmic treatment, ophthalmologist using advanced diagnostic equipment for cataract surgery, clean clinical setting, soft diffused LED lighting, shallow depth of field f/4, equipment in focus doctor blurred background, professional blue color palette #0ea5e9, white clinical tones, metallic accents, rule of thirds composition, 30% negative space, high-tech trustworthy aesthetic, authentic medical environment, shot with 50mm lens, premium healthcare photography, photorealistic --ar 3:2 --style raw --stylize 200 --quality 2 --v 6
```

---

### Exemplo 2: Post sobre Proteção UV (Prevenção)

**Título do Post:** "Como Proteger Seus Olhos do Sol"

**Prompt Final (DALL-E 3):**
```
Create a professional medical photograph for an ophthalmology blog post titled "Como Proteger Seus Olhos do Sol". The image should depict preventive eye care in a natural, healthy outdoor beach or park setting. Feature a person wearing stylish UV-protective sunglasses with soft natural lighting during golden hour. Use shallow depth of field with beautiful bokeh background showing lush green vegetation or blue sky. Color palette: emerald green (#10b981), ocean blues, and natural earth tones. Composition should follow the rule of thirds with 35% negative space for text overlay. Style: clean, modern, professional medical photography, authentic and relatable - avoid stock photo aesthetics. Camera: shot with 85mm lens at f/2.8 equivalent. High-resolution, photorealistic, medical-grade quality. Dimensions: 1200x800px landscape orientation.
```

---

### Exemplo 3: Post sobre LASIK (Tecnologia)

**Título do Post:** "LASIK: Tecnologia a Laser para Correção Visual"

**Prompt Final (Leonardo AI):**
```
Professional medical photography for ophthalmology blog about "LASIK: Tecnologia a Laser para Correção Visual", cutting-edge ophthalmic technology, modern LASIK laser equipment with glowing purple and blue digital interfaces, digital diagnostic screens with eye topography data, darkened clinical environment, focused LED lighting on screens, vibrant purple color palette #a855f7, electric blue digital cyan, green data visualization, rule of thirds composition, 25% negative space, futuristic innovative aesthetic, authentic advanced equipment, shot with 35mm lens f/2.8, premium technology healthcare photography, photorealistic with digital glow

Settings:
- Model: Leonardo Diffusion XL
- Dimensions: 1200x800
- Guidance Scale: 7
- Steps: 50
- Photo Real: Enabled
```

---

### Exemplo 4: Post sobre Dúvidas de Glaucoma (Dúvidas Frequentes)

**Título do Post:** "Glaucoma: Tire Suas Dúvidas com o Especialista"

**Prompt Final (Midjourney):**
```
Professional medical photography for ophthalmology blog about "Glaucoma: Tire Suas Dúvidas com o Especialista", doctor-patient communication, ophthalmologist explaining glaucoma with anatomical eye model and eye pressure measurement demonstration, educational materials, warm welcoming consultation room, natural window light, soft approachable atmosphere, focus on explanation gestures and patient understanding, warm amber yellow color palette #f59e0b, soft orange tones, natural wood elements, white clinical accents, rule of thirds composition, 30% negative space, educational trustworthy aesthetic, authentic healthcare photography, shot with 50mm lens f/2.8, emphasizing communication clarity --ar 3:2 --style raw --stylize 200 --quality 2 --v 6
```

---

## 🔧 Refinamento e Iteração

### Problemas Comuns e Soluções

#### Problema 1: Imagem muito "stock photo"

**Solução - Adicionar ao prompt:**
```
, authentic documentary-style medical photography, real clinical environment, avoid posed or artificial staging, natural candid moments, professional photojournalism style
```

#### Problema 2: Cores muito saturadas

**Solução - Adicionar ao prompt:**
```
, muted professional color palette, subtle color grading, natural color tones, avoid oversaturation, clean medical aesthetic with restrained colors
```

#### Problema 3: Composição genérica

**Solução - Adicionar ao prompt:**
```
, dynamic composition with visual interest, intentional framing using architectural elements, leading lines directing to focal point, creative use of depth layers
```

#### Problema 4: Falta de espaço para texto

**Solução - Adicionar ao prompt:**
```
, large area of negative space in [top/bottom/left/right] third for text overlay, clean uncluttered background, intentional empty space for typography, safe zone for title placement
```

#### Problema 5: Iluminação inadequada

**Solução - Adicionar ao prompt:**
```
, professional three-point lighting setup, soft diffused key light from [direction], subtle fill light reducing harsh shadows, gentle rim light for separation, cinematic lighting quality
```

---

### Palavras-Chave Negativas (Para Stable Diffusion)

```
Negative Prompt:
ugly, deformed, noisy, blurry, distorted, grainy, low quality, jpeg artifacts, stock photo, cliche, artificial, oversaturated colors, harsh lighting, cluttered composition, text, watermark, signature, amateur photography, unrealistic, cartoon, illustration, fake, posed, staged, obvious models, excessive makeup, exaggerated expressions, neon colors, fluorescent lighting
```

---

### Iteração Progressiva

**Passo 1 - Gerar Base:**
Use o prompt base da categoria

**Passo 2 - Avaliar Resultado:**
- Composição adequada? ✅/❌
- Cores corretas? ✅/❌
- Estilo profissional? ✅/❌
- Espaço para texto? ✅/❌

**Passo 3 - Refinar com Variações:**

Para Midjourney:
```
/imagine [seu prompt original] --seed [número do seed da imagem anterior]
```

Para DALL-E 3:
```
"Similar to previous image but [specific changes]"
```

**Passo 4 - Ajustes Finais em Photoshop:**
- Crop para dimensões exatas
- Ajuste de cores (se necessário)
- Adição de overlay com gradiente da categoria
- Otimização de contraste para texto

---

## 📊 Matriz de Decisão Rápida

| Categoria | Cor Principal | Ambiente | Iluminação | Profundidade | Elemento-Chave |
|-----------|--------------|----------|------------|--------------|----------------|
| **Prevenção** | #10b981 (Emerald) | Exterior/Natural | Golden Hour | f/2.8 (Rasa) | Proteção UV |
| **Tratamento** | #0ea5e9 (Blue) | Clínica/Hospital | LED Difuso | f/4 (Média) | Equipamento |
| **Tecnologia** | #a855f7 (Purple) | Lab/Tech Room | LED Focado | f/2.8 (Rasa) | Telas Digitais |
| **Dúvidas** | #f59e0b (Amber) | Consultório | Janela Natural | f/2.8 (Rasa) | Comunicação |

---

## ✅ Checklist Final Antes de Publicar

### Verificação de Prompt
- [ ] {clipboard} substituído pelo título real
- [ ] Dimensões especificadas corretamente
- [ ] Categoria de cor apropriada incluída
- [ ] Aspect ratio correto para o contexto
- [ ] Parâmetros de qualidade adicionados

### Verificação de Resultado
- [ ] Composição segue regra dos terços
- [ ] Espaço negativo adequado (mín. 25-35%)
- [ ] Cores consistentes com categoria
- [ ] Profundidade de campo apropriada
- [ ] Iluminação profissional e suave
- [ ] Estilo realista, não "stock photo"

### Pós-Processamento
- [ ] Crop para dimensões exatas
- [ ] Compressão otimizada (80-85%)
- [ ] Conversão para WebP + JPG fallback
- [ ] Alt text descritivo adicionado
- [ ] Arquivo nomeado corretamente

---

## 🎓 Glossário de Termos Fotográficos

**Bokeh:** Efeito de desfoque artístico no background
**Golden Hour:** 1h após nascer ou antes do pôr do sol
**Rule of Thirds:** Grade 3x3 para composição equilibrada
**Negative Space:** Área vazia que "respira" na composição
**Depth of Field:** Área em foco (rasa = pouco, profunda = muito)
**f/2.8, f/4:** Abertura do diafragma (menor número = mais luz + menos profundidade)
**Safe Zone:** Área protegida de cortes em diferentes telas
**Overlay:** Camada semitransparente de cor sobre imagem

---

## 📞 Suporte

**Para dúvidas sobre geração de imagens:**
- Email: contato@saraivavision.com.br
- WhatsApp: (33) 98420-7437

**Documentação relacionada:**
- `/docs/BLOG_IMAGE_GUIDELINES.md` - Diretrizes completas
- `/docs/BLOG_IMAGE_AI_PROMPTS.md` - Este documento

---

**Última atualização:** 30 de Setembro, 2025
**Saraiva Vision** - Clínica Oftalmológica | Caratinga, MG
**CRM-MG 69.870** | Dr. Philipe Saraiva Cruz