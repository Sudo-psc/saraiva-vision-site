# Guia: Adicionar Ícone de Meibografia

**Data**: 2025-11-16
**Autor**: Dr. Philipe Saraiva Cruz
**Tarefa**: Adicionar ícone do serviço de Meibografia

## 📋 Resumo

O serviço de **Meibografia** foi adicionado ao sistema, mas ainda **falta a imagem do ícone**. Este guia explica como obter e adicionar a imagem corretamente.

## 🎯 Link da Imagem Gerada

**Copilot Microsoft**: https://copilot.microsoft.com/shares/4HofKeJ8PxAyfNmyZPQyP

## 📥 Como Baixar a Imagem

### Opção 1: Via Browser (Recomendado)

1. **Abra o link** no navegador:
   ```
   https://copilot.microsoft.com/shares/4HofKeJ8PxAyfNmyZPQyP
   ```

2. **Aguarde o carregamento** da imagem gerada pelo Copilot

3. **Clique com botão direito** na imagem → **Salvar imagem como...**

4. **Salve como**:
   - Nome: `meibografia_icon` (qualquer formato: PNG, JPG, etc.)
   - Local: `~/Downloads/` ou pasta de sua preferência

### Opção 2: Screenshot

Se o link não permitir download direto:

1. Abra o link no navegador
2. Tire um screenshot da imagem
3. Recorte apenas o ícone
4. Salve como `meibografia_icon.png`

## 🔧 Como Converter e Adicionar ao Projeto

### Método Automático (Script)

Criamos um script que faz toda a conversão automaticamente:

```bash
# 1. Navegue até o diretório do projeto
cd /home/saraiva-vision-site

# 2. Execute o script passando o arquivo baixado
./scripts/convert-icon-to-webp.sh ~/Downloads/meibografia_icon.png

# O script irá:
# - Redimensionar para 64x64 pixels
# - Converter para WebP (formato otimizado)
# - Salvar em: /home/saraiva-vision-site/public/img/icon_meibografia.webp
```

### Método Manual

Se preferir fazer manualmente:

#### Usando Sharp (Node.js) - Mais Rápido

```bash
cd /home/saraiva-vision-site

# Verificar se Sharp está instalado
npm list sharp

# Se não estiver, instalar
npm install sharp

# Criar script de conversão temporário
cat > /tmp/convert.js << 'EOF'
const sharp = require('sharp');
sharp(process.argv[2])
  .resize(64, 64, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
  .webp({ quality: 90 })
  .toFile('public/img/icon_meibografia.webp')
  .then(() => console.log('✅ Convertido com sucesso!'))
  .catch(err => console.error('❌ Erro:', err));
EOF

# Executar conversão
node /tmp/convert.js ~/Downloads/meibografia_icon.png

# Limpar
rm /tmp/convert.js
```

#### Usando ImageMagick

```bash
# Instalar ImageMagick (se necessário)
sudo apt-get install imagemagick

# Converter imagem
convert ~/Downloads/meibografia_icon.png \
  -resize 64x64 \
  -background none \
  -gravity center \
  -extent 64x64 \
  /home/saraiva-vision-site/public/img/icon_meibografia.webp
```

#### Usando FFmpeg

```bash
# Instalar FFmpeg (se necessário)
sudo apt-get install ffmpeg

# Converter imagem
ffmpeg -i ~/Downloads/meibografia_icon.png \
  -vf "scale=64:64:force_original_aspect_ratio=decrease,pad=64:64:(ow-iw)/2:(oh-ih)/2:color=white@0.0" \
  -quality 90 \
  /home/saraiva-vision-site/public/img/icon_meibografia.webp -y
```

## ✅ Verificação

Após adicionar a imagem, verifique se está tudo correto:

```bash
# 1. Verificar se arquivo existe
ls -lh /home/saraiva-vision-site/public/img/icon_meibografia.webp

# 2. Verificar dimensões e formato
file /home/saraiva-vision-site/public/img/icon_meibografia.webp

# 3. Verificar tamanho (ideal: 8-50KB)
du -h /home/saraiva-vision-site/public/img/icon_meibografia.webp
```

**Resultado esperado**:
```
-rw-r--r-- 1 user user 32K Nov 16 14:30 /home/saraiva-vision-site/public/img/icon_meibografia.webp
/home/saraiva-vision-site/public/img/icon_meibografia.webp: RIFF (little-endian) data, Web/P image
32K     /home/saraiva-vision-site/public/img/icon_meibografia.webp
```

## 🧪 Teste no Navegador

```bash
# 1. Iniciar servidor de desenvolvimento
npm run dev:vite

# 2. Abrir navegador
# URL: http://localhost:3002/servicos

# 3. Verificar:
# - O card de Meibografia deve aparecer
# - O ícone deve estar visível (sem fallback)
# - O ícone deve estar nítido e bem formatado
```

## 📊 Especificações Técnicas do Ícone

| Propriedade | Valor |
|-------------|-------|
| **Formato** | WebP (com fallback automático) |
| **Dimensões** | 64x64 pixels |
| **Tamanho** | 8-50 KB (ideal: ~30KB) |
| **Qualidade** | 90% |
| **Transparência** | Sim (alpha channel) |
| **Localização** | `/public/img/icon_meibografia.webp` |
| **Alt Text** | "Meibografia" (via i18n) |

## 🎨 Diretrizes de Design

O ícone deve seguir o padrão visual dos demais ícones de exames:

- **Estilo**: Minimalista, limpo, profissional
- **Cores**: Tons de azul/cyan (consistente com identidade visual)
- **Fundo**: Transparente ou branco
- **Elementos**: Representação visual de:
  - Glândulas de Meibômio
  - Exame de imagem ocular
  - Equipamento de meibografia

**Ícones similares para referência**:
- `icon_retinografia.webp` - Exame de imagem da retina
- `icon_topografia_corneana.webp` - Mapeamento corneano
- `icon_paquimetria.webp` - Medição ocular

## 🔄 Rollback (Se Necessário)

Se precisar reverter as alterações:

```bash
# Remover ícone
rm /home/saraiva-vision-site/public/img/icon_meibografia.webp

# Reverter código (opcional)
git checkout HEAD -- src/locales/pt/translation.json
git checkout HEAD -- src/components/ServicesEnhanced.jsx
git checkout HEAD -- src/components/icons/ServiceIcons.jsx
```

## 📝 Checklist Final

Antes de fazer deploy:

- [ ] Imagem baixada do Copilot
- [ ] Imagem convertida para WebP (64x64)
- [ ] Arquivo salvo em `/public/img/icon_meibografia.webp`
- [ ] Tamanho do arquivo entre 8-50KB
- [ ] Testado em `localhost:3002/servicos`
- [ ] Ícone aparece corretamente no card
- [ ] Sem erros no console do navegador
- [ ] Imagem nítida e bem formatada

## 🚀 Deploy

Após confirmar que tudo está funcionando:

```bash
# Build production
npm run build:vite

# Deploy
sudo npm run deploy:quick

# Verificar em produção
curl -I https://saraivavision.com.br/servicos
```

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs: `npm run dev:vite`
2. Verifique o console do navegador (F12)
3. Confirme que o arquivo existe: `ls -lh public/img/icon_meibografia.webp`
4. Teste com outro navegador

## 📚 Documentação Relacionada

- [CLAUDE.md](../CLAUDE.md) - Guia principal de desenvolvimento
- [Service Icons Guide](../src/components/icons/ServiceIcons.jsx) - Componente de ícones
- [i18n Translation](../src/locales/pt/translation.json) - Traduções

---

**Prepared by**: Dr. Philipe Saraiva Cruz
**Date**: 2025-11-16
**Status**: Aguardando adição da imagem
