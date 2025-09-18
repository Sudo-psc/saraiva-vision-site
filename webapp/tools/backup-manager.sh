#!/usr/bin/env bash

# Saraiva Vision – Backup & Snapshot manager
#
# Visualiza e restaura versões de forma rápida.
# Suporta:
#  - Backups do build (saraivavision_YYYYmmdd_HHMMSS) em /var/backups/saraivavision
#  - Snapshots de config Nginx (nginx.conf.backup.* no repo e /etc/nginx/sites-available/saraivavision.backup.*)
#
# Uso:
#   backup-manager.sh list [all|dist|nginx]
#   backup-manager.sh restore dist <timestamp|latest> [--yes] [--dry-run]
#   backup-manager.sh restore nginx-local <timestamp> [--yes] [--dry-run]
#   backup-manager.sh restore nginx-system <timestamp> [--yes] [--dry-run]
#
# Ex.: Listar todos
#   tools/backup-manager.sh list
#
# Ex.: Restaurar o último build (dist) para produção
#   sudo tools/backup-manager.sh restore dist latest --yes
#
# Ex.: Restaurar um snapshot local do nginx para nginx.conf
#   tools/backup-manager.sh restore nginx-local 20240830_235959
#
set -euo pipefail

BACKUP_DIR=${BACKUP_DIR:-/var/backups/saraivavision}
PROD_DIST=${PROD_DIST:-/var/www/saraivavision/current}
NGINX_AVAIL=${NGINX_AVAIL:-/etc/nginx/sites-available/saraivavision}

# Descobre diretório do repositório (volta 1 nível a partir de tools/)
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
REPO_DIR=$(cd -- "$SCRIPT_DIR/.." && pwd)

confirm() {
  local prompt=${1:-"Confirmar?"}
  local yn
  read -r -p "$prompt [s/N] " yn || true
  case "$yn" in
    s|S|y|Y) return 0;;
    *) return 1;;
  esac
}

_echo_or_run() {
  if [[ "${DRY_RUN:-0}" == "1" ]]; then
    echo "+ $*"
  else
    eval "$@"
  fi
}

list_dist() {
  echo "== Backups de build (saraivavision) em $BACKUP_DIR =="
  if [[ ! -d "$BACKUP_DIR" ]]; then
    echo "(sem diretório $BACKUP_DIR)"
    return
  fi

  shopt -s nullglob
  local any=0
  local tmp
  tmp=$(mktemp)
  for dir in "$BACKUP_DIR"/saraivavision_*; do
    [[ -d "$dir" ]] || continue
    any=1
    local name size mtime ts
    name=$(basename -- "$dir")
    size=$(du -sh "$dir" 2>/dev/null | awk '{print $1}')
    mtime=$(date -r "$dir" '+%Y-%m-%d %H:%M')
    ts=${name#saraivavision_}
    printf '  %s\t%s\t%s\n' "$name" "$mtime" "$size" >> "$tmp"
  done
  if [[ $any -eq 1 ]]; then
    sort -r "$tmp"
  else
    echo "(nenhum backup encontrado)"
  fi
  rm -f "$tmp"
  shopt -u nullglob
}

list_nginx() {
  echo "== Snapshots de Nginx (repo local) =="
  shopt -s nullglob
  local local_any=0
  local tmp_l
  tmp_l=$(mktemp)
  for f in "$REPO_DIR"/nginx.conf.backup.*; do
    [[ -f "$f" ]] || continue
    local_any=1
    local name size mtime
    name=$(basename -- "$f")
    size=$(du -h "$f" 2>/dev/null | awk '{print $1}')
    mtime=$(date -r "$f" '+%Y-%m-%d %H:%M')
    printf '  %s\t%s\t%s\n' "$name" "$mtime" "$size" >> "$tmp_l"
  done
  if [[ $local_any -eq 1 ]]; then
    sort -r "$tmp_l"
  else
    echo "(nenhum snapshot local em $REPO_DIR)"
  fi
  rm -f "$tmp_l"

  echo ""
  echo "== Snapshots de Nginx (sistema) =="
  local sys_any=0
  local tmp_s
  tmp_s=$(mktemp)
  for f in /etc/nginx/sites-available/saraivavision.backup.*; do
    [[ -f "$f" ]] || continue
    sys_any=1
    local name size mtime
    name=$(basename -- "$f")
    size=$(du -h "$f" 2>/dev/null | awk '{print $1}')
    mtime=$(date -r "$f" '+%Y-%m-%d %H:%M')
    printf '  %s\t%s\t%s\n' "$name" "$mtime" "$size" >> "$tmp_s"
  done
  if [[ $sys_any -eq 1 ]]; then
    sort -r "$tmp_s"
  else
    echo "(nenhum snapshot em /etc/nginx/sites-available)"
  fi
  rm -f "$tmp_s"
  shopt -u nullglob
}

restore_dist() {
  local ref=${1:-}
  if [[ -z "$ref" ]]; then
    echo "Uso: $0 restore dist <timestamp|latest> [--yes] [--dry-run]"; exit 1
  fi

  if [[ "$EUID" -ne 0 ]]; then
    echo "❌ É necessário sudo para restaurar em $PROD_DIST"; exit 1
  fi

  local src
  if [[ "$ref" == "latest" ]]; then
    src=$(ls -1d "$BACKUP_DIR"/saraivavision_* 2>/dev/null | sort -r | head -n1 || true)
  else
    src="$BACKUP_DIR/saraivavision_$ref"
  fi

  if [[ -z "${src:-}" || ! -d "$src" ]]; then
    echo "❌ Backup não encontrado: $ref"; exit 1
  fi

  echo "Vai restaurar:"
  echo "  Origem: $src"
  echo "  Destino: $PROD_DIST"

  if [[ "${ASSUME_YES:-0}" != "1" ]]; then
    confirm "Continuar com a restauração?" || { echo "Cancelado."; exit 0; }
  fi

  # Cria backup de segurança da versão atual
  local ts_now; ts_now=$(date +"%Y%m%d_%H%M%S")
  if [[ -d "$PROD_DIST" ]]; then
    _echo_or_run mkdir -p "$BACKUP_DIR"
    _echo_or_run cp -r "$PROD_DIST" "$BACKUP_DIR/saraivavision_restore_$ts_now"
    echo "💾 Backup de segurança em: $BACKUP_DIR/saraivavision_restore_$ts_now"
  fi

  # Restaura via rsync
  _echo_or_run mkdir -p "$PROD_DIST"
  _echo_or_run rsync -a --delete "$src/" "$PROD_DIST/"
  _echo_or_run chown -R www-data:www-data "$PROD_DIST"
  _echo_or_run chmod -R 755 "$PROD_DIST"

  echo "✅ Restauração concluída."
}

restore_nginx_local() {
  local ts=${1:-}
  if [[ -z "$ts" ]]; then echo "Uso: $0 restore nginx-local <timestamp> [--yes] [--dry-run]"; exit 1; fi
  local src="$REPO_DIR/nginx.conf.backup.$ts"
  local dst="$REPO_DIR/nginx.conf"
  if [[ ! -f "$src" ]]; then echo "❌ Snapshot local não encontrado: $src"; exit 1; fi
  echo "Vai restaurar arquivo local:"; echo "  $src -> $dst"
  if [[ "${ASSUME_YES:-0}" != "1" ]]; then confirm "Continuar?" || { echo "Cancelado."; exit 0; }; fi
  _echo_or_run cp "$src" "$dst"
  echo "✅ Restaurado: $dst"
}

restore_nginx_system() {
  local ts=${1:-}
  if [[ -z "$ts" ]]; then echo "Uso: $0 restore nginx-system <timestamp> [--yes] [--dry-run]"; exit 1; fi
  if [[ "$EUID" -ne 0 ]]; then echo "❌ É necessário sudo para restaurar em /etc/nginx"; exit 1; fi
  local src="/etc/nginx/sites-available/saraivavision.backup.$ts"
  local dst="$NGINX_AVAIL"
  if [[ ! -f "$src" ]]; then echo "❌ Snapshot de sistema não encontrado: $src"; exit 1; fi
  echo "Vai restaurar Nginx:"; echo "  $src -> $dst"
  if [[ "${ASSUME_YES:-0}" != "1" ]]; then confirm "Continuar e recarregar Nginx?" || { echo "Cancelado."; exit 0; }; fi
  _echo_or_run cp "$src" "$dst"
  _echo_or_run nginx -t
  _echo_or_run systemctl reload nginx
  echo "✅ Nginx recarregado com configuração restaurada."
}

usage() {
  sed -n '1,40p' "$0" | sed 's/^# \{0,1\}//'
}

main() {
  local cmd=${1:-list}
  local scope=${2:-all}

  # Flags
  ASSUME_YES=0; DRY_RUN=0
  for arg in "$@"; do
    case "$arg" in
      --yes|-y) ASSUME_YES=1;;
      --dry-run) DRY_RUN=1;;
      --help|-h) usage; exit 0;;
    esac
  done

  case "$cmd" in
    list)
      case "$scope" in
        all) list_dist; echo ""; list_nginx;;
        dist) list_dist;;
        nginx) list_nginx;;
        *) echo "Escopo inválido: $scope"; exit 1;;
      esac
      ;;
    restore)
      local target=${2:-}
      local ref=${3:-}
      case "$target" in
        dist) restore_dist "$ref";;
        nginx-local) restore_nginx_local "$ref";;
        nginx-system) restore_nginx_system "$ref";;
        *) echo "Alvo inválido: $target"; usage; exit 1;;
      esac
      ;;
    *)
      usage; exit 1;;
  esac
}

main "$@"
