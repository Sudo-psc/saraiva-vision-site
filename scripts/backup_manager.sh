#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"
BACKUP_DIR=".backups/builds"
CALLBACK_FILE=".backups/callback.cmd"
TASK_FILE=".backups/dev_tasks.tsv"
mkdir -p "$BACKUP_DIR"
mkdir -p ".backups"
run_callback() {
  if [ -f "$CALLBACK_FILE" ]; then
    local cmd
    cmd="$(cat "$CALLBACK_FILE")"
    if [ -n "$cmd" ]; then
      BACKUP_ACTION="$1" BACKUP_TARGET="$2" bash -lc "$cmd"
    fi
  fi
}
require_clean_worktree() {
  if [ -n "$(git status --porcelain)" ]; then
    printf "Existem alterações não commitadas. Continuar? (y/N): "
    read -r answer
    if [[ ! "$answer" =~ ^[Yy]$ ]]; then
      echo "Operação cancelada."
      return 1
    fi
  fi
  return 0
}
list_backups() {
  if [ -z "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]; then
    echo "Nenhum backup encontrado."
    return
  fi
  echo "Últimos backups disponíveis:"
  ls -1t "$BACKUP_DIR" | head -n 10 | nl -w2 -s'. '
}
create_backup() {
  require_clean_worktree || return
  local commit timestamp filename
  commit="$(git rev-parse --short HEAD)"
  timestamp="$(date +%Y%m%d%H%M%S)"
  filename="${timestamp}_${commit}.tar.gz"
  git archive --format=tar.gz -o "$BACKUP_DIR/$filename" HEAD
  echo "Backup criado em $BACKUP_DIR/$filename"
  run_callback "backup" "$filename"
}
select_backup() {
  mapfile -t backups < <(ls -1t "$BACKUP_DIR")
  if [ "${#backups[@]}" -eq 0 ]; then
    echo "Nenhum backup disponível."
    return 1
  fi
  local limit
  limit=${#backups[@]}
  echo "Selecione um backup:"
  for i in "${!backups[@]}"; do
    printf "%2d) %s\n" "$((i + 1))" "${backups[$i]}"
  done
  printf "Opção: "
  read -r choice
  if ! [[ "$choice" =~ ^[0-9]+$ ]]; then
    echo "Opção inválida."
    return 1
  fi
  if [ "$choice" -lt 1 ] || [ "$choice" -gt "$limit" ]; then
    echo "Opção fora do intervalo."
    return 1
  fi
  SELECTED_BACKUP="${backups[$((choice - 1))]}"
  return 0
}
restore_backup() {
  require_clean_worktree || return
  select_backup || return
  local path
  path="$BACKUP_DIR/$SELECTED_BACKUP"
  printf "Isso irá sobrescrever o diretório atual com o conteúdo do backup %s. Continuar? (y/N): " "$SELECTED_BACKUP"
  read -r answer
  if [[ ! "$answer" =~ ^[Yy]$ ]]; then
    echo "Operação cancelada."
    return
  fi
  local tmpdir
  tmpdir="$(mktemp -d)"
  tar -xzf "$path" -C "$tmpdir"
  rsync -a --delete "$tmpdir"/ "$ROOT_DIR"/
  rm -rf "$tmpdir"
  echo "Backup restaurado."
  run_callback "rollback" "$SELECTED_BACKUP"
}
list_commits() {
  git log --oneline --decorate --graph -n 20
}
create_backup_from_commit() {
  printf "Digite o hash ou referência do commit: "
  read -r ref
  if ! git rev-parse "$ref" >/dev/null 2>&1; then
    echo "Referência inválida."
    return
  fi
  local commit timestamp filename
  commit="$(git rev-parse --short "$ref")"
  timestamp="$(date +%Y%m%d%H%M%S)"
  filename="${timestamp}_${commit}.tar.gz"
  git archive --format=tar.gz -o "$BACKUP_DIR/$filename" "$ref"
  echo "Backup do commit $commit criado em $BACKUP_DIR/$filename"
  run_callback "backup" "$filename"
}
rollback_to_commit() {
  require_clean_worktree || return
  printf "Digite o hash ou referência do commit para rollback: "
  read -r ref
  if ! git rev-parse "$ref" >/dev/null 2>&1; then
    echo "Referência inválida."
    return
  fi
  printf "Isso executará git reset --hard %s. Continuar? (y/N): " "$ref"
  read -r answer
  if [[ ! "$answer" =~ ^[Yy]$ ]]; then
    echo "Operação cancelada."
    return
  fi
  git reset --hard "$ref"
  echo "Rollback para $ref concluído."
  run_callback "rollback" "$ref"
}
configure_callback() {
  printf "Digite o comando de callback (vazio para remover): "
  read -r cmd
  if [ -z "$cmd" ]; then
    rm -f "$CALLBACK_FILE"
    echo "Callback removido."
    return
  fi
  echo "$cmd" > "$CALLBACK_FILE"
  echo "Callback definido."
}
list_tasks() {
  if [ ! -f "$TASK_FILE" ] || [ ! -s "$TASK_FILE" ]; then
    echo "Nenhuma tarefa registrada."
    return
  fi
  local line index
  index=1
  while IFS=$'\t' read -r status created desc done_at; do
    if [ -z "$status" ]; then
      continue
    fi
    printf "%2d) [%s] %s\n" "$index" "$status" "$desc"
    printf "    Criada: %s" "$created"
    if [ -n "${done_at:-}" ]; then
      printf " | Concluída: %s" "$done_at"
    fi
    printf "\n"
    index=$((index + 1))
  done < "$TASK_FILE"
}
add_task() {
  printf "Descrição da tarefa: "
  read -r desc
  if [ -z "$desc" ]; then
    echo "Descrição obrigatória."
    return
  fi
  local created
  created="$(date --iso-8601=seconds)"
  printf "todo\t%s\t%s\t\n" "$created" "$desc" >> "$TASK_FILE"
  echo "Tarefa adicionada."
}
complete_task() {
  if [ ! -f "$TASK_FILE" ] || [ ! -s "$TASK_FILE" ]; then
    echo "Nenhuma tarefa para concluir."
    return
  fi
  list_tasks
  printf "Informe o número da tarefa para concluir: "
  read -r choice
  if ! [[ "$choice" =~ ^[0-9]+$ ]]; then
    echo "Opção inválida."
    return
  fi
  local total
  total=$(wc -l < "$TASK_FILE")
  if [ "$choice" -lt 1 ] || [ "$choice" -gt "$total" ]; then
    echo "Opção fora do intervalo."
    return
  fi
  local tmpfile
  tmpfile="$(mktemp)"
  local index
  index=1
  while IFS=$'\t' read -r status created desc done_at; do
    if [ -z "$status" ]; then
      continue
    fi
    if [ "$index" -eq "$choice" ]; then
      printf "done\t%s\t%s\t%s\n" "$created" "$desc" "$(date --iso-8601=seconds)" >> "$tmpfile"
    else
      printf "%s\t%s\t%s\t%s\n" "$status" "$created" "$desc" "$done_at" >> "$tmpfile"
    fi
    index=$((index + 1))
  done < "$TASK_FILE"
  mv "$tmpfile" "$TASK_FILE"
  echo "Tarefa marcada como concluída."
}
remove_task() {
  if [ ! -f "$TASK_FILE" ] || [ ! -s "$TASK_FILE" ]; then
    echo "Nenhuma tarefa para remover."
    return
  fi
  list_tasks
  printf "Informe o número da tarefa para remover: "
  read -r choice
  if ! [[ "$choice" =~ ^[0-9]+$ ]]; then
    echo "Opção inválida."
    return
  fi
  local total
  total=$(wc -l < "$TASK_FILE")
  if [ "$choice" -lt 1 ] || [ "$choice" -gt "$total" ]; then
    echo "Opção fora do intervalo."
    return
  fi
  local tmpfile
  tmpfile="$(mktemp)"
  local index
  index=1
  while IFS=$'\t' read -r status created desc done_at; do
    if [ -z "$status" ]; then
      continue
    fi
    if [ "$index" -ne "$choice" ]; then
      printf "%s\t%s\t%s\t%s\n" "$status" "$created" "$desc" "$done_at" >> "$tmpfile"
    fi
    index=$((index + 1))
  done < "$TASK_FILE"
  mv "$tmpfile" "$TASK_FILE"
  echo "Tarefa removida."
}
tasks_menu() {
  while true; do
    echo ""
    echo "=== Tarefas de Desenvolvimento ==="
    echo "1) Listar tarefas"
    echo "2) Adicionar tarefa"
    echo "3) Concluir tarefa"
    echo "4) Remover tarefa"
    echo "5) Voltar"
    printf "Opção: "
    read -r option
    case "$option" in
      1) list_tasks ;;
      2) add_task ;;
      3) complete_task ;;
      4) remove_task ;;
      5) break ;;
      *) echo "Opção inválida." ;;
    esac
  done
}
main_menu() {
  while true; do
    echo ""
    echo "=== Backup & Rollback Manager ==="
    echo "1) Criar backup da build atual"
    echo "2) Restaurar backup"
    echo "3) Listar últimos 10 backups"
    echo "4) Listar commits recentes"
    echo "5) Criar backup a partir de commit"
    echo "6) Rollback para commit"
    echo "7) Configurar callback"
    echo "8) Gerenciar tarefas de desenvolvimento"
    echo "9) Sair"
    printf "Opção: "
    read -r option
    case "$option" in
      1) create_backup ;;
      2) restore_backup ;;
      3) list_backups ;;
      4) list_commits ;;
      5) create_backup_from_commit ;;
      6) rollback_to_commit ;;
      7) configure_callback ;;
      8) tasks_menu ;;
      9) exit 0 ;;
      *) echo "Opção inválida." ;;
    esac
  done
}
main_menu
