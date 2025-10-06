#!/bin/bash

# Auto Backup Script - Saraiva Vision
# Cria backups automáticos antes de cada deploy

set -euo pipefail

# Configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PRODUCTION_DIR="/var/www/saraivavision"
BACKUPS_DIR="${PRODUCTION_DIR}/backups"
MAX_BACKUPS=20

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Função de logging
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" >&2
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Criar backup do estado atual
create_backup() {
    local backup_name="backup_$(date +%Y%m%d_%H%M%S)"
    local backup_path="${BACKUPS_DIR}/${backup_name}"
    local source_path="$1"

    if [[ -z "$source_path" ]]; then
        if [[ -L "${PRODUCTION_DIR}/current" ]]; then
            source_path=$(readlink "${PRODUCTION_DIR}/current")
        else
            error "Nenhum build atual encontrado para backup"
            return 1
        fi
    fi

    if [[ ! -d "$source_path" ]]; then
        error "Diretório fonte não encontrado: $source_path"
        return 1
    fi

    log "Criando backup: $backup_name"
    log "Fonte: $source_path"

    # Criar backup
    if cp -r "$source_path" "$backup_path"; then
        log "✅ Backup criado com sucesso: $backup_path"

        # Adicionar metadados
        cat > "$backup_path/backup-info.txt" << EOF
Backup Information
==================
Name: $backup_name
Source: $source_path
Created: $(date)
Size: $(du -sh "$backup_path" | cut -f1)
Files: $(find "$backup_path" -type f | wc -l)
Type: automatic
EOF

        # Limpar backups antigos
        cleanup_old_backups

        return 0
    else
        error "Falha ao criar backup"
        return 1
    fi
}

# Limpar backups antigos
cleanup_old_backups() {
    log "Verificando backups antigos..."

    local backup_count=$(find "$BACKUPS_DIR" -maxdepth 1 -type d -name "backup_20*" | wc -l)

    if [[ $backup_count -gt $MAX_BACKUPS ]]; then
        local to_remove=$((backup_count - MAX_BACKUPS))
        log "Removendo $to_remove backups antigos..."

        find "$BACKUPS_DIR" -maxdepth 1 -type d -name "backup_20*" \
            -printf "%T@ %p\n" | sort -n | head -n "$to_remove" | \
            cut -d' ' -f2- | xargs -r rm -rf

        log "✅ Limpeza de backups concluída"
    fi
}

# Listar backups disponíveis
list_backups() {
    log "Backups disponíveis:"
    find "$BACKUPS_DIR" -maxdepth 1 -type d -name "backup_20*" \
        -printf "%T@ %p\n" | sort -nr | head -10 | \
        while read timestamp path; do
            local name=$(basename "$path")
            local date=$(date -d "@${timestamp%.*}" '+%Y-%m-%d %H:%M:%S')
            local size=$(du -sh "$path" 2>/dev/null | cut -f1 || echo "N/A")
            echo "  📦 $name ($size) - $date"
        done
}

# Restaurar backup
restore_backup() {
    local backup_name="$1"

    if [[ -z "$backup_name" ]]; then
        error "Nome do backup é obrigatório"
        return 1
    fi

    local backup_path="${BACKUPS_DIR}/${backup_name}"

    if [[ ! -d "$backup_path" ]]; then
        error "Backup não encontrado: $backup_name"
        return 1
    fi

    log "Restaurando backup: $backup_name"

    # Criar backup do estado atual antes de restaurar
    if [[ -L "${PRODUCTION_DIR}/current" ]]; then
        create_backup
    fi

    # Atualizar symlink
    ln -sfn "$backup_path" "${PRODUCTION_DIR}/current"

    # Reload Nginx
    if systemctl reload nginx; then
        log "✅ Nginx recarregado"
    else
        warning "⚠️ Falha ao recarregar Nginx"
    fi

    log "✅ Backup $backup_name restaurado com sucesso!"
}

# Verificar integridade do backup
verify_backup() {
    local backup_name="$1"

    if [[ -z "$backup_name" ]]; then
        error "Nome do backup é obrigatório"
        return 1
    fi

    local backup_path="${BACKUPS_DIR}/${backup_name}"

    if [[ ! -d "$backup_path" ]]; then
        error "Backup não encontrado: $backup_name"
        return 1
    fi

    log "Verificando integridade do backup: $backup_name"

    # Verificar arquivos essenciais
    local required_files=("index.html" "assets")
    local errors=0

    for file in "${required_files[@]}"; do
        if [[ -e "$backup_path/$file" ]]; then
            log "  ✅ $file existe"
        else
            error "  ❌ $file NÃO existe"
            ((errors++))
        fi
    done

    # Verificar metadados
    if [[ -f "$backup_path/backup-info.txt" ]]; then
        log "  ✅ Metadados encontrados"
    else
        warning "  ⚠️ Metadados não encontrados"
    fi

    if [[ $errors -eq 0 ]]; then
        log "✅ Backup íntegro!"
        return 0
    else
        error "❌ Backup com $errors erros!"
        return 1
    fi
}

# Main case
case "${1:-help}" in
    create)
        create_backup "${2:-}"
        ;;
    restore)
        restore_backup "$2"
        ;;
    list)
        list_backups
        ;;
    verify)
        verify_backup "$2"
        ;;
    cleanup)
        cleanup_old_backups
        ;;
    help|--help|-h)
        cat << EOF
Auto Backup Script - Saraiva Vision

USO:
    $0 [COMANDO] [ARGUMENTOS]

COMANDOS:
    create [path]      Cria backup do build atual ou path especificado
    restore <name>     Restaura um backup específico
    list               Lista backups disponíveis
    verify <name>      Verifica integridade de um backup
    cleanup            Remove backups antigos
    help               Mostra esta ajuda

EXEMPLOS:
    $0 create                              # Backup do build atual
    $0 create /path/to/build              # Backup de path específico
    $0 restore backup_20251006_120000     # Restaurar backup
    $0 verify backup_20251006_120000      # Verificar backup

EOF
        ;;
    *)
        error "Comando desconhecido: $1"
        echo "Use $0 help para ver os comandos disponíveis"
        exit 1
        ;;
esac