#!/bin/bash
###############################################################################
# SCRIPT DE BACKUP DA CONFIGURAÇÃO DO MONIT
# Cria backup completo de todas as configurações
###############################################################################

BACKUP_DIR="/home/saraiva-vision-site/monit-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/monit-backup-$TIMESTAMP.tar.gz"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💾 BACKUP DA CONFIGURAÇÃO DO MONIT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Criar diretório de backup se não existir
mkdir -p "$BACKUP_DIR"

# Criar arquivo temporário para o backup
TMP_DIR=$(mktemp -d)

echo "📁 Copiando arquivos..."

# Copiar configurações
cp -r /etc/monit "$TMP_DIR/"
cp /var/log/monit.log "$TMP_DIR/" 2>/dev/null || echo "  ⚠️  Log não copiado (permissões)"

# Copiar documentação
cp /home/saraiva-vision-site/MONIT_README.md "$TMP_DIR/" 2>/dev/null
cp /home/saraiva-vision-site/MONIT_EMAIL_SETUP.md "$TMP_DIR/" 2>/dev/null
cp /home/saraiva-vision-site/monit-credentials.txt "$TMP_DIR/" 2>/dev/null

# Criar arquivo de informações do backup
cat > "$TMP_DIR/backup-info.txt" << INFO
MONIT BACKUP
Data: $(date)
Servidor: $(hostname)
Monit Version: $(monit -V 2>&1 | head -1)
Serviços Monitorados: $(monit summary 2>/dev/null | tail -n +3 | wc -l)

Conteúdo:
$(ls -lh $TMP_DIR)
INFO

# Criar tarball
echo "📦 Criando arquivo de backup..."
tar -czf "$BACKUP_FILE" -C "$TMP_DIR" . 2>/dev/null

# Limpar temporários
rm -rf "$TMP_DIR"

# Verificar sucesso
if [ -f "$BACKUP_FILE" ]; then
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo ""
    echo "✅ Backup criado com sucesso!"
    echo "   Arquivo: $BACKUP_FILE"
    echo "   Tamanho: $SIZE"
    echo ""
    echo "📋 Backups existentes:"
    ls -lh "$BACKUP_DIR"
    echo ""
    echo "Para restaurar:"
    echo "   tar -xzf $BACKUP_FILE -C /destino/"
else
    echo "❌ Erro ao criar backup!"
    exit 1
fi

# Manter apenas últimos 10 backups
echo "🧹 Limpando backups antigos (mantendo últimos 10)..."
cd "$BACKUP_DIR"
ls -t monit-backup-*.tar.gz 2>/dev/null | tail -n +11 | xargs -r rm
echo ""
echo "✅ Backup completo!"

