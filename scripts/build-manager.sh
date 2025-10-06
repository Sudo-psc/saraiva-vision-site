#!/bin/bash

# Build Manager Script - Saraiva Vision
# Gerencia os últimos 10 builds com callback automatizado

set -euo pipefail

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PRODUCTION_DIR="/var/www/saraivavision"
BACKUPS_DIR="${PRODUCTION_DIR}/backups"
RELEASES_DIR="${PRODUCTION_DIR}/releases"
CURRENT_DIR="${PRODUCTION_DIR}/current"
BUILD_LIMIT=10

# Arquivos de log
LOG_DIR="${PROJECT_DIR}/logs"
mkdir -p "$LOG_DIR"
LOG_FILE="${LOG_DIR}/build-manager-$(date +%Y%m%d).log"

# Função de logging
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
}

# Funções de output colorido
info() { log "INFO" "${BLUE}$*${NC}"; }
success() { log "SUCCESS" "${GREEN}$*${NC}"; }
warning() { log "WARNING" "${YELLOW}$*${NC}"; }
error() { log "ERROR" "${RED}$*${NC}"; }
highlight() { log "HIGHLIGHT" "${PURPLE}$*${NC}"; }

# Função para exibir ajuda
show_help() {
    cat << EOF
${CYAN}Build Manager - Saraiva Vision${NC}

${YELLOW}USO:${NC}
    $0 [COMANDO] [OPÇÕES]

${YELLOW}COMANDOS:${NC}
    list                    Lista os últimos 10 builds disponíveis
    show <build_id>         Mostra detalhes de um build específico
    deploy <build_id>       Faz deploy de um build específico
    rollback [steps]        Volta para build anterior (padrão: 1)
    validate <build_id>     Valida um build antes do deploy
    backup <build_id>       Cria backup de um build
    cleanup                 Limpa builds antigos (mantém 10)
    health                  Verifica saúde do sistema
    test <build_id>         Testa um build em modo de preview
    monitor                 Monitora builds em tempo real

${YELLOW}OPÇÕES:${NC}
    -f, --force             Força operação sem confirmação
    -v, --verbose           Output detalhado
    -q, --quiet             Output mínimo
    -h, --help              Mostra esta ajuda

${YELLOW}EXEMPLOS:${NC}
    $0 list                                         # Listar builds
    $0 deploy 20251006_081524                      # Deploy específico
    $0 rollback 2                                   # Voltar 2 builds
    $0 validate 20251006_081524 && $0 deploy \$?   # Validar + deploy
    $0 test 20251006_081524                        # Testar build

EOF
}

# Função para obter lista de builds
get_builds() {
    local builds=()

    # Buscar em releases
    if [[ -d "$RELEASES_DIR" ]]; then
        while IFS= read -r -d '' build_dir; do
            local build_name=$(basename "$build_dir")
            local timestamp=$(stat -c %Y "$build_dir" 2>/dev/null || echo "0")
            builds+=("$timestamp:$build_name:release")
        done < <(find "$RELEASES_DIR" -maxdepth 1 -type d -name "20*" -printf "%T@ %p\n" 2>/dev/null | sort -nr | head -n "$BUILD_LIMIT" | cut -d' ' -f2- | tr '\n' '\0')
    fi

    # Buscar em backups
    if [[ -d "$BACKUPS_DIR" ]]; then
        while IFS= read -r -d '' build_dir; do
            local build_name=$(basename "$build_dir")
            local timestamp=$(stat -c %Y "$build_dir" 2>/dev/null || echo "0")
            builds+=("$timestamp:$build_name:backup")
        done < <(find "$BACKUPS_DIR" -maxdepth 1 -type d -name "backup_20*" -printf "%T@ %p\n" 2>/dev/null | sort -nr | head -n "$BUILD_LIMIT" | cut -d' ' -f2- | tr '\n' '\0')
    fi

    # Ordenar por timestamp
    IFS=$'\n' builds=($(sort -nr <<<"${builds[*]}"))
    unset IFS

    printf '%s\n' "${builds[@]}"
}

# Função para formatar timestamp
format_timestamp() {
    local timestamp="$1"
    date -d "@$timestamp" '+%d/%m/%Y %H:%M:%S' 2>/dev/null || echo "N/A"
}

# Função para obter tamanho do diretório
get_dir_size() {
    local dir="$1"
    du -sh "$dir" 2>/dev/null | cut -f1 || echo "N/A"
}

# Função para verificar se build é válido
is_build_valid() {
    local build_path="$1"

    # Verificar arquivos essenciais
    local required_files=("index.html" "assets")
    for file in "${required_files[@]}"; do
        [[ -f "$build_path/$file" || -d "$build_path/$file" ]] || return 1
    done

    # Verificar se index.html está completo
    if [[ -f "$build_path/index.html" ]]; then
        grep -q "assets/index-" "$build_path/index.html" || return 1
    fi

    return 0
}

# Comando: list
cmd_list() {
    info "Listando últimos $BUILD_LIMIT builds disponíveis:"
    echo

    printf "${CYAN}%-20s %-12s %-10s %-15s %-10s %s${NC}\n" "BUILD ID" "TIPO" "TAMANHO" "DATA/HORA" "STATUS" "DEPLOY"
    printf "%-20s %-12s %-10s %-15s %-10s %s\n" "--------------------" "------------" "----------" "---------------" "----------" "-----"

    local count=0
    while IFS=':' read -r timestamp build_name type; do
        ((count++))
        if [[ $count -gt $BUILD_LIMIT ]]; then break; fi

        local build_path="${RELEASES_DIR}/${build_name}"
        if [[ "$type" == "backup" ]]; then
            build_path="${BACKUPS_DIR}/${build_name}"
        fi

        local size=$(get_dir_size "$build_path")
        local formatted_time=$(format_timestamp "$timestamp")
        local status="✅ OK"
        local deploy_info=""

        if ! is_build_valid "$build_path"; then
            status="❌ INV"
        fi

        # Verificar se está em produção
        if [[ -L "$CURRENT_DIR" ]]; then
            local current_target=$(readlink "$CURRENT_DIR")
            if [[ "$current_target" == "$build_path" ]]; then
                deploy_info="${GREEN}ATUAL${NC}"
            fi
        fi

        printf "%-20s %-12s %-10s %-15s %-10s %s\n" \
            "$build_name" \
            "$type" \
            "$size" \
            "$formatted_time" \
            "$status" \
            "$deploy_info"

    done < <(get_builds)

    echo
    if [[ $count -eq 0 ]]; then
        warning "Nenhum build encontrado."
    else
        success "Encontrados $count builds."
    fi
}

# Comando: show
cmd_show() {
    local build_id="$1"

    if [[ -z "$build_id" ]]; then
        error "Build ID é obrigatório. Use: $0 show <build_id>"
        return 1
    fi

    info "Mostrando detalhes do build: $build_id"
    echo

    # Encontrar build
    local build_path=""
    local build_type=""

    if [[ -d "$RELEASES_DIR/$build_id" ]]; then
        build_path="$RELEASES_DIR/$build_id"
        build_type="release"
    elif [[ -d "$BACKUPS_DIR/backup_$build_id" ]]; then
        build_path="$BACKUPS_DIR/backup_$build_id"
        build_type="backup"
    else
        error "Build $build_id não encontrado."
        return 1
    fi

    # Informações detalhadas
    echo "${CYAN}Build ID:${NC} $build_id"
    echo "${CYAN}Tipo:${NC} $build_type"
    echo "${CYAN}Caminho:${NC} $build_path"
    echo "${CYAN}Tamanho:${NC} $(get_dir_size "$build_path")"
    echo "${CYAN}Criação:${NC} $(stat -c %y "$build_path" 2>/dev/null || echo "N/A")"
    echo "${CYAN}Status:${NC} $(is_build_valid "$build_path" && echo "✅ Válido" || echo "❌ Inválido")"
    echo

    # Arquivos principais
    echo "${YELLOW}Arquivos principais:${NC}"
    if [[ -f "$build_path/index.html" ]]; then
        local index_size=$(stat -c%s "$build_path/index.html" 2>/dev/null || echo "0")
        echo "  - index.html ($(($index_size / 1024))KB)"
    fi

    if [[ -d "$build_path/assets" ]]; then
        local assets_count=$(find "$build_path/assets" -name "*.js" -o -name "*.css" | wc -l)
        echo "  - assets/ ($assets_count arquivos)"

        # Mostrar bundle principal
        local main_bundle=$(find "$build_path/assets" -name "index-*.js" | head -1)
        if [[ -n "$main_bundle" ]]; then
            local bundle_size=$(stat -c%s "$main_bundle" 2>/dev/null || echo "0")
            echo "    └─ $(basename "$main_bundle") ($(($bundle_size / 1024))KB)"
        fi
    fi
    echo

    # Verificar se está em produção
    if [[ -L "$CURRENT_DIR" ]]; then
        local current_target=$(readlink "$CURRENT_DIR")
        if [[ "$current_target" == "$build_path" ]]; then
            success "Este build está ATUALMENTE EM PRODUÇÃO"
        fi
    fi
}

# Comando: validate
cmd_validate() {
    local build_id="$1"

    if [[ -z "$build_id" ]]; then
        error "Build ID é obrigatório. Use: $0 validate <build_id>"
        return 1
    fi

    info "Validando build: $build_id"

    # Encontrar build
    local build_path=""
    if [[ -d "$RELEASES_DIR/$build_id" ]]; then
        build_path="$RELEASES_DIR/$build_id"
    elif [[ -d "$BACKUPS_DIR/backup_$build_id" ]]; then
        build_path="$BACKUPS_DIR/backup_$build_id"
    else
        error "Build $build_id não encontrado."
        return 1
    fi

    # Validações
    local errors=0

    echo "🔍 Validando estrutura do build..."

    # 1. Arquivos essenciais
    local required_files=("index.html")
    for file in "${required_files[@]}"; do
        if [[ -f "$build_path/$file" ]]; then
            echo "  ✅ $file encontrado"
        else
            echo "  ❌ $file NÃO encontrado"
            ((errors++))
        fi
    done

    # 2. Diretórios essenciais
    local required_dirs=("assets")
    for dir in "${required_dirs[@]}"; do
        if [[ -d "$build_path/$dir" ]]; then
            echo "  ✅ $dir/ encontrado"
        else
            echo "  ❌ $dir/ NÃO encontrado"
            ((errors++))
        fi
    done

    # 3. Verificar index.html
    if [[ -f "$build_path/index.html" ]]; then
        if grep -q "assets/index-" "$build_path/index.html"; then
            echo "  ✅ index.html referencia bundle principal"
        else
            echo "  ❌ index.html não referencia bundle principal"
            ((errors++))
        fi

        if grep -q "<!DOCTYPE html>" "$build_path/index.html"; then
            echo "  ✅ index.html tem DOCTYPE válido"
        else
            echo "  ❌ index.html sem DOCTYPE"
            ((errors++))
        fi
    fi

    # 4. Verificar bundles
    if [[ -d "$build_path/assets" ]]; then
        local js_count=$(find "$build_path/assets" -name "*.js" | wc -l)
        local css_count=$(find "$build_path/assets" -name "*.css" | wc -l)

        echo "  📦 Encontrados $js_count arquivos JS e $css_count arquivos CSS"

        # Verificar bundle principal
        local main_js=$(find "$build_path/assets" -name "index-*.js" | head -1)
        if [[ -n "$main_js" ]]; then
            echo "  ✅ Bundle JS principal encontrado: $(basename "$main_js")"
        else
            echo "  ❌ Bundle JS principal NÃO encontrado"
            ((errors++))
        fi

        local main_css=$(find "$build_path/assets" -name "index-*.css" | head -1)
        if [[ -n "$main_css" ]]; then
            echo "  ✅ Bundle CSS principal encontrado: $(basename "$main_css")"
        else
            echo "  ❌ Bundle CSS principal NÃO encontrado"
            ((errors++))
        fi
    fi

    echo
    if [[ $errors -eq 0 ]]; then
        success "✅ Build $build_id está VALIDADO e pronto para deploy!"
        return 0
    else
        error "❌ Build $build_id tem $errors erros e NÃO está pronto para deploy!"
        return 1
    fi
}

# Comando: deploy
cmd_deploy() {
    local build_id="$1"
    local force="${2:-false}"

    if [[ -z "$build_id" ]]; then
        error "Build ID é obrigatório. Use: $0 deploy <build_id>"
        return 1
    fi

    info "Iniciando deploy do build: $build_id"

    # Validar primeiro
    if ! cmd_validate "$build_id"; then
        error "Deploy cancelado devido a falha na validação."
        return 1
    fi

    # Encontrar build
    local build_path=""
    if [[ -d "$RELEASES_DIR/$build_id" ]]; then
        build_path="$RELEASES_DIR/$build_id"
    elif [[ -d "$BACKUPS_DIR/backup_$build_id" ]]; then
        build_path="$BACKUPS_DIR/backup_$build_id"
    else
        error "Build $build_id não encontrado."
        return 1
    fi

    # Confirmação
    if [[ "$force" != "true" ]]; then
        echo
        echo -e "${YELLOW}ATENÇÃO: Isso vai substituir a versão atual em produção.${NC}"
        echo -e "${YELLOW}Build: $build_id${NC}"
        echo -e "${YELLOW}Caminho: $build_path${NC}"
        echo
        read -p "Confirmar deploy? (s/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Ss]$ ]]; then
            info "Deploy cancelado."
            return 0
        fi
    fi

    # Backup automático do atual
    if [[ -L "$CURRENT_DIR" ]]; then
        local current_target=$(readlink "$CURRENT_DIR")
        if [[ -d "$current_target" ]]; then
            local current_name=$(basename "$current_target")
            local backup_name="backup_auto_${current_name}_$(date +%Y%m%d_%H%M%S)"
            local backup_path="${BACKUPS_DIR}/${backup_name}"

            info "Criando backup automático: $backup_name"
            cp -r "$current_target" "$backup_path"
            success "Backup criado: $backup_path"
        fi
    fi

    # Atualizar symlink
    info "Atualizando symlink para novo build..."
    ln -sfn "$build_path" "$CURRENT_DIR"

    # Reload Nginx
    info "Recarregando Nginx..."
    if systemctl reload nginx; then
        success "Nginx recarregado com sucesso"
    else
        warning "Falha ao recarregar Nginx (pode requerer sudo)"
    fi

    success "🚀 Deploy do build $build_id COMPLETO!"

    # Verificação pós-deploy
    echo
    info "Verificando deploy..."
    sleep 2

    if curl -s "http://localhost/" | grep -q "saraivavision"; then
        success "✅ Site respondendo corretamente"
    else
        warning "⚠️ Site pode não estar respondendo corretamente"
    fi
}

# Comando: rollback
cmd_rollback() {
    local steps="${1:-1}"

    if ! [[ "$steps" =~ ^[0-9]+$ ]] || [[ "$steps" -lt 1 ]]; then
        error "Número de passos inválido. Use: $0 rollback [número]"
        return 1
    fi

    info "Iniciando rollback de $steps build(s)..."

    # Obter build atual
    if [[ ! -L "$CURRENT_DIR" ]]; then
        error "Nenhum build atual configurado para rollback."
        return 1
    fi

    local current_target=$(readlink "$CURRENT_DIR")
    local current_name=$(basename "$current_target")

    info "Build atual: $current_name"

    # Obter lista de builds
    local builds=($(get_builds))
    local current_index=-1

    # Encontrar index do build atual
    for i in "${!builds[@]}"; do
        IFS=':' read -r timestamp build_name type <<< "${builds[$i]}"
        if [[ "$build_name" == "$current_name" ]]; then
            current_index=$i
            break
        fi
    done

    if [[ $current_index -eq -1 ]]; then
        error "Build atual não encontrado na lista de builds disponíveis."
        return 1
    fi

    # Calcular target index
    local target_index=$((current_index + steps))

    if [[ $target_index -ge ${#builds[@]} ]]; then
        error "Não há builds suficientes para rollback de $steps passos."
        return 1
    fi

    # Obter build de destino
    IFS=':' read -r timestamp target_build type <<< "${builds[$target_index]}"

    info "Fazendo rollback para: $target_build"

    # Executar deploy
    cmd_deploy "$target_build" "true"
}

# Comando: health
cmd_health() {
    info "Verificação de saúde do sistema..."
    echo

    # Verificar diretórios
    echo "${YELLOW}Estrutura de diretórios:${NC}"
    for dir in "$PROJECT_DIR" "$PRODUCTION_DIR" "$RELEASES_DIR" "$BACKUPS_DIR"; do
        if [[ -d "$dir" ]]; then
            echo "  ✅ $dir"
        else
            echo "  ❌ $dir (NÃO encontrado)"
        fi
    done
    echo

    # Verificar symlink atual
    echo "${YELLOW}Build atual:${NC}"
    if [[ -L "$CURRENT_DIR" ]]; then
        local target=$(readlink "$CURRENT_DIR")
        local target_name=$(basename "$target")
        echo "  ✅ Symlink: $target_name"
        echo "  📍 Alvo: $target"

        if [[ -d "$target" ]]; then
            echo "  ✅ Diretório existe"
            if is_build_valid "$target"; then
                echo "  ✅ Build válido"
            else
                echo "  ❌ Build inválido"
            fi
        else
            echo "  ❌ Diretório NÃO existe"
        fi
    else
        echo "  ❌ Nenhum symlink atual configurado"
    fi
    echo

    # Verificar Nginx
    echo "${YELLOW}Nginx:${NC}"
    if systemctl is-active --quiet nginx; then
        echo "  ✅ Nginx está rodando"

        if nginx -t >/dev/null 2>&1; then
            echo "  ✅ Configuração válida"
        else
            echo "  ❌ Configuração inválida"
        fi
    else
        echo "  ❌ Nginx NÃO está rodando"
    fi
    echo

    # Verificar espaço em disco
    echo "${YELLOW}Espaço em disco:${NC}"
    df -h "$PRODUCTION_DIR" | tail -1 | awk '{print "  📁 " $4 " disponível em " $6}'
    echo

    # Estatísticas de builds
    local total_builds=$(find "$RELEASES_DIR" "$BACKUPS_DIR" -maxdepth 1 -type d -name "20*" -o -name "backup_20*" 2>/dev/null | wc -l)
    echo "${YELLOW}Estatísticas:${NC}"
    echo "  📦 Total de builds: $total_builds"
    echo "  🗂️ Releases: $(find "$RELEASES_DIR" -maxdepth 1 -type d -name "20*" 2>/dev/null | wc -l)"
    echo "  💾 Backups: $(find "$BACKUPS_DIR" -maxdepth 1 -type d -name "backup_20*" 2>/dev/null | wc -l)"
}

# Comando: cleanup
cmd_cleanup() {
    info "Limpando builds antigos (mantendo últimos $BUILD_LIMIT)..."

    # Limpar releases
    local old_releases=($(find "$RELEASES_DIR" -maxdepth 1 -type d -name "20*" -printf "%T@ %p\n" 2>/dev/null | sort -n | head -n -$BUILD_LIMIT | cut -d' ' -f2-))

    for release in "${old_releases[@]}"; do
        if [[ -d "$release" ]]; then
            local name=$(basename "$release")
            info "Removendo release antigo: $name"
            rm -rf "$release"
        fi
    done

    # Limpar backups
    local old_backups=($(find "$BACKUPS_DIR" -maxdepth 1 -type d -name "backup_20*" -printf "%T@ %p\n" 2>/dev/null | sort -n | head -n -$BUILD_LIMIT | cut -d' ' -f2-))

    for backup in "${old_backups[@]}"; do
        if [[ -d "$backup" ]]; then
            local name=$(basename "$backup")
            info "Removendo backup antigo: $name"
            rm -rf "$backup"
        fi
    done

    success "Limpeza completada!"
}

# Comando: backup
cmd_backup() {
    local build_id="$1"

    if [[ -z "$build_id" ]]; then
        error "Build ID é obrigatório. Use: $0 backup <build_id>"
        return 1
    fi

    info "Criando backup do build: $build_id"

    # Encontrar build
    local build_path=""
    if [[ -d "$RELEASES_DIR/$build_id" ]]; then
        build_path="$RELEASES_DIR/$build_id"
    elif [[ -d "$BACKUPS_DIR/backup_$build_id" ]]; then
        build_path="$BACKUPS_DIR/backup_$build_id"
    else
        error "Build $build_id não encontrado."
        return 1
    fi

    local backup_name="backup_manual_${build_id}_$(date +%Y%m%d_%H%M%S)"
    local backup_path="${BACKUPS_DIR}/${backup_name}"

    info "Criando backup: $backup_name"
    cp -r "$build_path" "$backup_path"

    success "✅ Backup criado: $backup_path"
}

# Comando: test
cmd_test() {
    local build_id="$1"

    if [[ -z "$build_id" ]]; then
        error "Build ID é obrigatório. Use: $0 test <build_id>"
        return 1
    fi

    info "Iniciando teste do build: $build_id"

    # Encontrar build
    local build_path=""
    if [[ -d "$RELEASES_DIR/$build_id" ]]; then
        build_path="$RELEASES_DIR/$build_id"
    elif [[ -d "$BACKUPS_DIR/backup_$build_id" ]]; then
        build_path="$BACKUPS_DIR/backup_$build_id"
    else
        error "Build $build_id não encontrado."
        return 1
    fi

    # Criar diretório de teste
    local test_dir="${PROJECT_DIR}/test-build-${build_id}"
    if [[ -d "$test_dir" ]]; then
        rm -rf "$test_dir"
    fi

    info "Copiando build para ambiente de teste..."
    cp -r "$build_path" "$test_dir"

    # Iniciar servidor de teste
    local test_port=3003
    info "Iniciando servidor de teste na porta $test_port..."

    echo
    echo "${CYAN}🧪 Build em modo de teste:${NC}"
    echo "  📍 URL: http://localhost:$test_port"
    echo "  📁 Diretório: $test_dir"
    echo "  ⏹️  Para parar: CTRL+C"
    echo

    cd "$test_dir"
    if command -v python3 >/dev/null 2>&1; then
        python3 -m http.server "$test_port"
    elif command -v python >/dev/null 2>&1; then
        python -m SimpleHTTPServer "$test_port"
    else
        error "Python não encontrado para servidor de teste"
        return 1
    fi
}

# Comando: monitor
cmd_monitor() {
    info "Monitorando builds em tempo real (CTRL+C para parar)..."
    echo

    while true; do
        clear
        echo "${CYAN}📊 Build Monitor - Saraiva Vision${NC}"
        echo "${YELLOW}Última atualização: $(date)${NC}"
        echo

        cmd_health
        echo
        cmd_list
        echo
        echo "${YELLOW}Pressione CTRL+C para parar o monitoramento...${NC}"

        sleep 30
    done
}

# Função principal
main() {
    local command=""
    local args=()
    local force_flag=false
    local verbose_flag=false
    local quiet_flag=false

    # Parse argumentos
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -f|--force)
                force_flag=true
                shift
                ;;
            -v|--verbose)
                verbose_flag=true
                shift
                ;;
            -q|--quiet)
                quiet_flag=true
                shift
                ;;
            list|show|deploy|rollback|validate|backup|cleanup|health|test|monitor)
                command="$1"
                shift
                args=("$@")
                break
                ;;
            *)
                error "Comando desconhecido: $1"
                echo "Use $0 --help para ver os comandos disponíveis."
                exit 1
                ;;
        esac
    done

    # Verificar comando
    if [[ -z "$command" ]]; then
        error "Comando é obrigatório."
        show_help
        exit 1
    fi

    # Verificar permissões
    if [[ "$command" =~ ^(deploy|rollback|cleanup)$ ]]; then
        if [[ $EUID -ne 0 ]]; then
            error "Este comando requer privilégios de root (sudo)."
            exit 1
        fi
    fi

    # Mudar para diretório do projeto
    cd "$PROJECT_DIR" || {
        error "Não foi possível acessar o diretório do projeto: $PROJECT_DIR"
        exit 1
    }

    # Executar comando
    case $command in
        list)
            cmd_list
            ;;
        show)
            cmd_show "${args[0]}"
            ;;
        deploy)
            if [[ "$force_flag" == true ]]; then
                cmd_deploy "${args[0]}" "true"
            else
                cmd_deploy "${args[0]}" "false"
            fi
            ;;
        rollback)
            cmd_rollback "${args[0]:-1}"
            ;;
        validate)
            cmd_validate "${args[0]}"
            ;;
        backup)
            cmd_backup "${args[0]}"
            ;;
        cleanup)
            cmd_cleanup
            ;;
        health)
            cmd_health
            ;;
        test)
            cmd_test "${args[0]}"
            ;;
        monitor)
            cmd_monitor
            ;;
        *)
            error "Comando não implementado: $command"
            exit 1
            ;;
    esac
}

# Trap para limpeza
trap 'exit 130' INT TERM

# Executar função principal
main "$@"