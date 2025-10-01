# Quick Guide: Generate Blog Cover Images with Gemini

## 🚀 Quick Start (3 Steps)

### 1. Get Your API Key
Visit: https://aistudio.google.com/apikey
- Click "Create API key"
- Copy the key (starts with `AIza...`)

### 2. Set the API Key
```bash
export GOOGLE_GEMINI_API_KEY='AIza...'
```

### 3. Generate Images
```bash
# Navigate to project
cd /home/saraiva-vision-site

# Generate for one post
./scripts/generate-covers-simple.sh --post-id 16

# Or for entire category
./scripts/generate-covers-simple.sh --category "Tecnologia"
```

---

## 📋 Common Commands

### List All Posts
```bash
./scripts/generate-covers-simple.sh --list
```

### Generate for Specific Post
```bash
# Example: Generate for post ID 16 (IA na Oftalmologia)
./scripts/generate-covers-simple.sh --post-id 16
```

### Generate by Category
```bash
# All Technology posts
./scripts/generate-covers-simple.sh --category "Tecnologia"

# All Prevention posts
./scripts/generate-covers-simple.sh --category "Prevenção"

# All Treatment posts
./scripts/generate-covers-simple.sh --category "Tratamento"

# All FAQ posts
./scripts/generate-covers-simple.sh --category "Dúvidas Frequentes"
```

### Generate All Posts
```bash
./scripts/generate-covers-simple.sh --all
```

---

## 🎨 Categories & Styles

### Prevenção (Green Theme)
- Color: Emerald Green (#10B981)
- Style: Trustworthy, caring, protective
- Examples: Post 22 (Teste do Olhinho), Post 11 (Síndrome da Visão)

### Tratamento (Blue Theme)
- Color: Cyan Blue (#3B82F6)
- Style: Scientific, precise, clinical
- Examples: Post 15 (Doença de Coats), Post 9 (Estrabismo)

### Tecnologia (Purple/Blue Theme)
- Color: Purple/Cyan (#8B5CF6, #06B6D4)
- Style: Futuristic, innovative, cutting-edge
- Examples: Post 21 (Luxturna), Post 16 (IA)

### Dúvidas Frequentes (Yellow Theme)
- Color: Amber/Yellow (#F59E0B)
- Style: Educational, friendly, accessible
- Examples: Post 23 (Mitos e Verdades), Post 20 (Moscas Volantes)

---

## 📂 Output Location

Generated images will be saved to:
```
/home/saraiva-vision-site/public/Blog/
```

Filename format:
```
capa_post_{id}_gemini_flash_{timestamp}.png
```

Example:
```
capa_post_16_gemini_flash_20251001_143022.png
```

---

## ✏️ After Generating Images

### Step 1: Review Images
```bash
# View generated images
ls -lh public/Blog/capa_post_*_gemini_*
```

### Step 2: Update Blog Post Data
Edit `src/data/blogPosts.js`:

```javascript
{
  id: 16,
  slug: 'como-inteligencia-artificial-transforma-exames-oftalmologicos-caratinga-mg',
  title: 'Dry Eye: Tratamento de Olho Seco | Caratinga MG',
  // OLD: image: '/Blog/futuristic-eye-examination.png',
  image: '/Blog/capa_post_16_gemini_flash_20251001_143022.png',
  // ... rest of post
}
```

### Step 3: Test Locally
```bash
npm run dev
# Open http://localhost:5173/blog
```

### Step 4: Commit & Deploy
```bash
git add public/Blog/capa_post_*.png src/data/blogPosts.js
git commit -m "feat: update blog cover images with Gemini-generated designs"
git push
```

---

## 🔧 Troubleshooting

### "API key not found"
```bash
# Make sure you've exported the key
export GOOGLE_GEMINI_API_KEY='your-key-here'

# Check it's set
echo $GOOGLE_GEMINI_API_KEY
```

### "Module not found: google"
The virtual environment will be created automatically on first run.
If issues persist:
```bash
rm -rf .venv
./scripts/generate-covers-simple.sh --list
```

### "No images generated"
- Check API key is valid
- Verify internet connection
- Review prompt in script output
- Try with different post ID

### Images too large
Generated PNGs are typically 500KB-1.5MB.
To optimize further:
```bash
# Install optimization tools
npm install -g sharp-cli

# Optimize image
sharp public/Blog/image.png -o public/Blog/image-opt.png
```

---

## 💡 Tips for Best Results

### 1. Preview Before Batch Generation
Always test with 1-2 posts first:
```bash
./scripts/generate-covers-simple.sh --post-id 16
```

### 2. Generate Multiple Options
Run the same post 2-3 times to get variations, then pick the best:
```bash
./scripts/generate-covers-simple.sh --post-id 16
# Wait for completion, review image
./scripts/generate-covers-simple.sh --post-id 16
# Compare results
```

### 3. Category Consistency
Generate all posts in a category together for visual cohesion:
```bash
./scripts/generate-covers-simple.sh --category "Tecnologia"
```

### 4. Backup Originals
Before replacing existing images:
```bash
cp -r public/Blog public/Blog-backup-$(date +%Y%m%d)
```

---

## 📊 Recommended Posts for Regeneration

### High Priority (Outdated Design)
1. **Post 16** - IA na Oftalmologia
   - Current: Generic futuristic eye
   - Opportunity: Modern AI-focused design

2. **Post 15** - Doença de Coats
   - Current: Generic retina
   - Opportunity: Child-friendly protective imagery

3. **Post 9** - Ceratocone
   - Current: Clinical diagram
   - Opportunity: Modern abstract representation

### Medium Priority (Enhancement)
- Post 1 - IA na Oftalmologia (duplicate title, different content)
- Post 8 - Alimentação e Microbioma
- Post 7 - Lentes Premium

---

## 🎯 Success Checklist

After generating new images:

- [ ] Images are 16:9 aspect ratio
- [ ] File size < 2MB each
- [ ] No text visible in images
- [ ] Colors match category theme
- [ ] Professional medical appearance
- [ ] Updated in blogPosts.js
- [ ] Tested in local dev server
- [ ] Original images backed up

---

## 📞 Need Help?

Review the full analysis:
```bash
cat BLOG_COVER_ANALYSIS.md
```

Check script documentation:
```bash
.venv/bin/python scripts/generate_covers_gemini_flash.py --help
```

---

**Last Updated**: 2025-10-01
**Version**: 1.0
