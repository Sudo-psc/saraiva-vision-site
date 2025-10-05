#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

OUTPUT_MODE="${OUTPUT_MODE:-text}"
VERBOSE="${VERBOSE:-false}"
REPORT_DIR="$PROJECT_ROOT/reports/system-checkup"
mkdir -p "$REPORT_DIR"

FILE_STAMP="$(date +"%Y%m%d-%H%M%S")"
ISO_STAMP="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
LOG_FILE="$REPORT_DIR/system-checkup-$FILE_STAMP.log"
JSON_FILE="$REPORT_DIR/system-checkup-$FILE_STAMP.json"
touch "$LOG_FILE"

RESULTS_FILE="$(mktemp)"
trap 'rm -f "$RESULTS_FILE"' EXIT

overall_status="success"
start_epoch="$(date +%s)"

log_line() {
    printf '%s\n' "$1" >> "$LOG_FILE"
    if [[ "$OUTPUT_MODE" != "json" ]]; then
        printf '%s\n' "$1"
    fi
}

run_task() {
    local key="$1"
    local label="$2"
    shift 2
    local started="$(date +%s)"
    local output
    local status
    if output=$("$@" 2>&1); then
        status="success"
    else
        status="failure"
    fi
    local finished="$(date +%s)"
    local duration=$((finished - started))
    local encoded_output
    encoded_output=$(printf '%s' "$output" | base64 | tr -d '\n')
    printf '%s\t%s\t%s\t%s\t%s\n' "$key" "$label" "$status" "$duration" "$encoded_output" >> "$RESULTS_FILE"
    printf '===== %s =====\n' "$label" >> "$LOG_FILE"
    if [[ -n "$output" ]]; then
        printf '%s\n' "$output" >> "$LOG_FILE"
    fi
    if [[ "$status" == "success" ]]; then
        log_line "[OK] $label (${duration}s)"
        if [[ "$VERBOSE" == "true" && "$OUTPUT_MODE" != "json" && -n "$output" ]]; then
            printf '%s\n' "$output"
        fi
    else
        log_line "[FAIL] $label (${duration}s)"
        if [[ -n "$output" ]]; then
            printf '%s\n' "$output" >&2
        fi
        overall_status="failure"
    fi
}

log_line "[INFO] Iniciando checkup em $ISO_STAMP"

run_task "node_version" "Node.js versão" node --version
run_task "npm_version" "npm versão" npm --version
run_task "validate_api" "Validação da API" npm run validate:api
run_task "lint" "Linting" npm run lint
run_task "test_unit" "Testes unitários" npm run test:unit
run_task "test_integration" "Testes de integração" npm run test:integration
run_task "test_api" "Testes de API" npm run test:api
run_task "test_frontend" "Testes de frontend" npm run test:frontend
run_task "build" "Build sem prerender" npm run build:norender

end_epoch="$(date +%s)"
total_duration=$((end_epoch - start_epoch))

node --input-type=module - "$RESULTS_FILE" "$JSON_FILE" "$ISO_STAMP" "$overall_status" "$total_duration" <<'NODE'
import { readFileSync, writeFileSync } from 'fs'
const [resultsPath, jsonPath, isoStamp, overallStatus, totalDuration] = process.argv.slice(2)
const content = readFileSync(resultsPath, 'utf8')
const rows = content
  .split('\n')
  .map(line => line.trim())
  .filter(Boolean)
  .map(line => {
    const [key, label, status, durationSeconds, outputBase64] = line.split('\t')
    return {
      key,
      label,
      status,
      durationSeconds: Number.parseInt(durationSeconds, 10),
      outputBase64
    }
  })
writeFileSync(
  jsonPath,
  JSON.stringify(
    {
      generatedAt: isoStamp,
      status: overallStatus,
      durationSeconds: Number.parseInt(totalDuration, 10),
      results: rows
    },
    null,
    2
  ),
  'utf8'
)
NODE

if [[ "$OUTPUT_MODE" == "json" ]]; then
    cat "$JSON_FILE"
else
    log_line "[INFO] Status final: $overall_status"
    log_line "[INFO] Tempo total: ${total_duration}s"
    log_line "[INFO] Relatório JSON: $JSON_FILE"
    log_line "[INFO] Log detalhado: $LOG_FILE"
fi

if [[ "$overall_status" != "success" ]]; then
    exit 1
fi
