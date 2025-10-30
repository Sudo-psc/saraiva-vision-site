#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

CHECKUP_SCRIPT="$SCRIPT_DIR/system-checkup-suite.sh"
SEND_EMAIL_SCRIPT="$SCRIPT_DIR/send-daily-report.js"
REPORT_DIR="$PROJECT_ROOT/reports/system-checkup"

mkdir -p "$REPORT_DIR"

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Iniciando checkup do sistema..."

if [[ ! -x "$CHECKUP_SCRIPT" ]]; then
    echo "Erro: Script de checkup não encontrado ou sem permissão: $CHECKUP_SCRIPT" >&2
    exit 1
fi

if [[ ! -x "$SEND_EMAIL_SCRIPT" ]]; then
    echo "Erro: Script de envio de e-mail não encontrado ou sem permissão: $SEND_EMAIL_SCRIPT" >&2
    exit 1
fi

OUTPUT_MODE=json bash "$CHECKUP_SCRIPT" > /tmp/checkup-output.json 2>&1 || {
    checkup_exit_code=$?
    echo "Aviso: Checkup terminou com código $checkup_exit_code"
}

LATEST_REPORT=$(find "$REPORT_DIR" -name "*.json" -type f -printf '%T@ %p\n' 2>/dev/null | sort -rn | head -1 | cut -d' ' -f2-)

if [[ -z "$LATEST_REPORT" ]]; then
    echo "Erro: Nenhum relatório JSON encontrado em $REPORT_DIR" >&2
    exit 1
fi

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Relatório gerado: $LATEST_REPORT"
echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Enviando e-mail com o relatório..."

if node "$SEND_EMAIL_SCRIPT" "$LATEST_REPORT"; then
    echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] E-mail enviado com sucesso!"
    exit 0
else
    echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Falha ao enviar e-mail" >&2
    exit 1
fi
