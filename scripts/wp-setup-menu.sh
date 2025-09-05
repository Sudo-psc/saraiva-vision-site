#!/usr/bin/env bash
set -euo pipefail

# Import Saraiva Vision menu structure into WordPress via WP-CLI.
#
# Requirements:
# - WP-CLI installed on the target server
# - Provide WP_PATH (WP root) via env or argument
#
# Usage:
#   WP_PATH=/var/www/cms.saraivavision.local bash scripts/wp-setup-menu.sh
#   # or remote
#   ssh user@host "WP_PATH=/var/www/cms.saraivavision.local bash -s" < scripts/wp-setup-menu.sh

WP_PATH=${WP_PATH:-}
if [[ -z "${WP_PATH}" ]]; then
  echo "WP_PATH env var is required (absolute path to WordPress root)" >&2
  exit 1
fi

wp() { command wp --path="$WP_PATH" --allow-root "$@"; }

echo "Using WordPress at: $WP_PATH"

# Helper: ensure a page exists, echo its ID
ensure_page() {
  local slug="$1"; shift
  local title="$1"; shift

  local id
  id=$(wp post list --post_type=page --name="$slug" --field=ID --posts_per_page=1)
  if [[ -z "$id" ]]; then
    id=$(wp post create --post_type=page --post_status=publish --post_name="$slug" --post_title="$title" --porcelain)
    echo "Created page '$title' ($slug): $id"
  else
    echo "Found page '$title' ($slug): $id"
  fi
  echo "$id"
}

echo "Ensuring pages exist..."
HOME_ID=$(ensure_page home "Início")
SERVICOS_ID=$(ensure_page servicos "Serviços")
LENTES_ID=$(ensure_page lentes "Lentes de Contato")
SOBRE_ID=$(ensure_page sobre "Sobre")
DEPOIMENTOS_ID=$(ensure_page depoimentos "Depoimentos")
FAQ_ID=$(ensure_page faq "FAQ")
CONTATO_ID=$(ensure_page contato "Contato")
BLOG_ID=$(ensure_page blog "Blog")

echo "Configuring front page and posts page..."
wp option update show_on_front page
wp option update page_on_front "$HOME_ID"
wp option update page_for_posts "$BLOG_ID"

MENU_NAME="Menu Principal"
MENU_SLUG="menu-principal"

echo "Ensuring menu '$MENU_NAME' exists..."
MENU_ID=$(wp menu list --fields=term_id,name,slug | awk -v s="$MENU_SLUG" '$3==s {print $1}')
if [[ -z "$MENU_ID" ]]; then
  MENU_ID=$(wp menu create "$MENU_NAME" --porcelain)
  echo "Created menu '$MENU_NAME' with ID $MENU_ID"
else
  echo "Found menu '$MENU_NAME' with ID $MENU_ID"
fi

echo "Assigning menu to location 'primary'..."
wp menu location assign "$MENU_ID" primary || true

echo "Clearing existing items in menu (id=$MENU_ID)..."
ITEM_IDS=$(wp menu item list "$MENU_ID" --fields=db_id --format=ids || true)
if [[ -n "$ITEM_IDS" ]]; then
  for id in $ITEM_IDS; do wp menu item delete "$id" -q; done
fi

echo "Adding items to primary menu..."
wp menu item add-post "$MENU_ID" "$HOME_ID"   --title="Início"     --position=1
wp menu item add-post "$MENU_ID" "$SERVICOS_ID" --title="Serviços"   --position=2
wp menu item add-post "$MENU_ID" "$LENTES_ID"   --title="Lentes"     --position=3
wp menu item add-post "$MENU_ID" "$SOBRE_ID"    --title="Sobre"      --position=4
wp menu item add-post "$MENU_ID" "$DEPOIMENTOS_ID" --title="Depoimentos" --position=5
wp menu item add-post "$MENU_ID" "$BLOG_ID"     --title="Blog"       --position=6
wp menu item add-post "$MENU_ID" "$FAQ_ID"      --title="FAQ"        --position=7
wp menu item add-post "$MENU_ID" "$CONTATO_ID"  --title="Contato"    --position=8

# Instagram external link as in SPA
wp menu item add-custom "$MENU_ID" "Instagram" "https://www.instagram.com/saraiva_vision/" --position=99

echo "Done. Current primary menu:"
wp menu item list "$MENU_ID" --fields=title,type,object_id,url,menu_order

