# 🎨 Guia de Geração de Imagens - Blog Saraiva Vision

## Imagens Prioritárias para Gerar

### Usar Google AI Studio ou Vertex AI Imagen

Acesse: https://aistudio.google.com/app/prompts/new_chat
Ou: https://console.cloud.google.com/vertex-ai/generative/multimodal/create

### 1. capa-moscas-volantes.png
**Prompt:**
```
Medical illustration of eye vitreous floaters, microscopic view of translucent strands and particles floating in eye fluid, professional ophthalmology visualization, clean blue and white medical aesthetic, educational diagram style, high detail, medical accuracy
```
**Specs:** 1920x1080px, PNG, Aspect Ratio 16:9

### 2. capa-descolamento-retina.png
**Prompt:**
```
Medical cross-section illustration of detached retina, anatomical diagram showing retinal separation from underlying tissue, professional ophthalmology educational image, clear anatomical structure, medical blue and red color scheme, realistic medical illustration style
```
**Specs:** 1920x1080px, PNG, Aspect Ratio 16:9

### 3. capa-teste-olhinho.png
**Prompt:**
```
Newborn baby eye examination scene, pediatric ophthalmologist performing red reflex test with handheld ophthalmoscope, warm hospital lighting, gentle medical care atmosphere, professional healthcare photography style, soft focus, compassionate medical setting
```
**Specs:** 1920x1080px, PNG, Aspect Ratio 16:9

### 4. capa-retinose-pigmentar.png
**Prompt:**
```
Fundus photograph showing retinitis pigmentosa, retinal degeneration with characteristic bone spicule pigmentation pattern, medical ophthalmology retinal imaging, professional diagnostic visualization, detailed retinal structure
```
**Specs:** 1920x1080px, PNG, Aspect Ratio 16:9

## Após Gerar

1. Salvar em `public/Blog/` com os nomes exatos
2. Executar: `node scripts/generate-all-avif.js` (gera versões responsivas)
3. Rebuild: `npm run build:blog && npm run build`
4. Deploy: `sudo /home/saraiva-vision-site/DEPLOY_NOW.sh`

## Alternativa: Usar Imagens Existentes Temporariamente

Enquanto aguarda geração profissional, use placeholders:
```bash
cp public/Blog/capa-geral.png public/Blog/capa-moscas-volantes.png
cp public/Blog/capa-geral.png public/Blog/capa-descolamento-retina.png
cp public/Blog/olhinho.png public/Blog/capa-teste-olhinho.png
cp public/Blog/retinose-pigmentar.png public/Blog/capa-retinose-pigmentar.png
```
