#!/usr/bin/env bash
# git-history-menu.sh - interactive git history navigation and restoration

set -euo pipefail

# Remember the branch we started on to return later
DEFAULT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")
if [ -z "$DEFAULT_BRANCH" ]; then
  DEFAULT_BRANCH="main"
fi

show_menu() {
  cat <<MENU
Git History Menu
----------------
1) Show commit history
2) View commit snapshot
3) Checkout/restore to commit
4) Return to $DEFAULT_BRANCH branch
5) Exit
MENU
}

show_history() {
  git --no-pager log --oneline --graph --decorate --all | head -n 20
}

view_snapshot() {
  read -rp "Enter commit hash or ref: " ref
  git show --stat "$ref"
}

restore_commit() {
  read -rp "Enter commit hash or ref to checkout: " ref
  git checkout "$ref"
}

return_default() {
  git checkout "$DEFAULT_BRANCH"
}

while true; do
  show_menu
  read -rp "Select an option: " opt
  case "$opt" in
    1) show_history ;;
    2) view_snapshot ;;
    3) restore_commit ;;
    4) return_default ;;
    5) exit 0 ;;
    *) echo "Invalid option" ;;
  esac
  echo ""
  read -rp "Press enter to continue..." _
  clear
done
