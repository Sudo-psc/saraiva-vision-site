#!/bin/bash
# Script para converter ícone de meibografia para WebP
# Uso: ./scripts/convert-icon-to-webp.sh <arquivo-origem>

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se foi passado um arquivo
if [ $# -eq 0 ]; then
    echo -e "${RED}❌ Erro: Nenhum arquivo especificado${NC}"
    echo "Uso: $0 <arquivo-origem>"
    echo "Exemplo: $0 ~/Downloads/meibografia_icon.png"
    exit 1
fi

INPUT_FILE="$1"
OUTPUT_DIR="/home/saraiva-vision-site/public/img"
OUTPUT_FILE="$OUTPUT_DIR/icon_meibografia.webp"

# Verificar se o arquivo de entrada existe
if [ ! -f "$INPUT_FILE" ]; then
    echo -e "${RED}❌ Erro: Arquivo não encontrado: $INPUT_FILE${NC}"
    exit 1
fi

# Verificar se o diretório de saída existe
if [ ! -d "$OUTPUT_DIR" ]; then
    echo -e "${RED}❌ Erro: Diretório de saída não existe: $OUTPUT_DIR${NC}"
    exit 1
fi

echo -e "${YELLOW}🔄 Convertendo imagem para WebP...${NC}"
echo "📁 Origem: $INPUT_FILE"
echo "📁 Destino: $OUTPUT_FILE"

# Verificar se Sharp está disponível (via Node.js)
if command -v node &> /dev/null; then
    echo -e "${GREEN}✅ Node.js encontrado, usando Sharp para conversão${NC}"

    # Criar script Node.js temporário para conversão
    cat > /tmp/convert-to-webp.js << 'EOF'
const sharp = require('sharp');
const fs = require('fs');

const inputFile = process.argv[2];
const outputFile = process.argv[3];

console.log('📸 Processando imagem com Sharp...');

sharp(inputFile)
  .resize(64, 64, {
    fit: 'contain',
    background: { r: 255, g: 255, b: 255, alpha: 0 }
  })
  .webp({ quality: 90, alphaQuality: 100 })
  .toFile(outputFile)
  .then(info => {
    console.log('✅ Conversão concluída com sucesso!');
    console.log(`📊 Tamanho: ${info.size} bytes`);
    console.log(`📐 Dimensões: ${info.width}x${info.height}`);
    console.log(`🎨 Formato: ${info.format}`);
  })
  .catch(err => {
    console.error('❌ Erro na conversão:', err);
    process.exit(1);
  });
EOF

    node /tmp/convert-to-webp.js "$INPUT_FILE" "$OUTPUT_FILE"
    rm /tmp/convert-to-webp.js

elif command -v convert &> /dev/null; then
    # Fallback para ImageMagick
    echo -e "${GREEN}✅ ImageMagick encontrado, usando convert${NC}"
    convert "$INPUT_FILE" -resize 64x64 -background none -gravity center -extent 64x64 "$OUTPUT_FILE"

elif command -v ffmpeg &> /dev/null; then
    # Fallback para ffmpeg
    echo -e "${GREEN}✅ FFmpeg encontrado, usando ffmpeg${NC}"
    ffmpeg -i "$INPUT_FILE" -vf "scale=64:64:force_original_aspect_ratio=decrease,pad=64:64:(ow-iw)/2:(oh-ih)/2:color=white@0.0" -quality 90 "$OUTPUT_FILE" -y

else
    echo -e "${RED}❌ Erro: Nenhuma ferramenta de conversão encontrada${NC}"
    echo "Por favor, instale uma das seguintes opções:"
    echo "  - Sharp (Node.js): npm install sharp"
    echo "  - ImageMagick: sudo apt-get install imagemagick"
    echo "  - FFmpeg: sudo apt-get install ffmpeg"
    exit 1
fi

# Verificar se a conversão foi bem-sucedida
if [ -f "$OUTPUT_FILE" ]; then
    FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
    echo ""
    echo -e "${GREEN}✅ Ícone criado com sucesso!${NC}"
    echo "📁 Localização: $OUTPUT_FILE"
    echo "📊 Tamanho: $FILE_SIZE"
    echo ""
    echo -e "${YELLOW}🎯 Próximos passos:${NC}"
    echo "1. Verifique a qualidade do ícone"
    echo "2. Execute: npm run dev:vite"
    echo "3. Acesse: http://localhost:3002/servicos"
    echo "4. Confirme que o ícone de Meibografia aparece corretamente"
else
    echo -e "${RED}❌ Erro: Falha na conversão da imagem${NC}"
    exit 1
fi
