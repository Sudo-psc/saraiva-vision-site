#!/bin/bash

# CI Blog Compliance Check
# Validação automatizada para CI/CD pipeline
# Uso: ./scripts/ci-blog-compliance-check.sh [exit-on-failure]

set -euo pipefail

# Configuração
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPORTS_DIR="$PROJECT_ROOT/reports"
COMPLIANCE_REPORT="$REPORTS_DIR/image-compliance-report.json"
SUMMARY_FILE="$REPORTS_DIR/ci-compliance-summary.md"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parâmetros
EXIT_ON_FAILURE=${1:-false}

echo -e "${BLUE}🏥 Saraiva Vision - Blog Compliance Check${NC}"
echo -e "${BLUE}=============================================${NC}"

# Garante diretório de reports
mkdir -p "$REPORTS_DIR"

echo -e "\n${YELLOW}📋 Executando validação CFM/LGPD...${NC}"

# Executa validação
if node scripts/validate-blog-compliance.js; then
    echo -e "${GREEN}✅ Validação concluída com sucesso${NC}"
else
    echo -e "${RED}❌ Validação encontrou problemas${NC}"

    if [[ "$EXIT_ON_FAILURE" == "true" ]]; then
        echo -e "${RED}🚨 Falhando CI conforme solicitado${NC}"
        exit 1
    fi
fi

# Processa resultados se existirem
if [[ -f "$COMPLIANCE_REPORT" ]]; then

    # Extrai estatísticas com jq (se disponível) ou grep
    if command -v jq &> /dev/null; then
        TOTAL=$(jq -r '.summary.total' "$COMPLIANCE_REPORT")
        PASSED=$(jq -r '.summary.passed' "$COMPLIANCE_REPORT")
        FAILED=$(jq -r '.summary.failed' "$COMPLIANCE_REPORT")
        WARNINGS=$(jq -r '.summary.warnings' "$COMPLIANCE_REPORT")
        CFM_VIOLATIONS=$(jq -r '.summaryStats.cfmViolations' "$COMPLIANCE_REPORT")
    else
        # Fallback para grep
        TOTAL=$(grep -o '"total": *[0-9]*' "$COMPLIANCE_REPORT" | grep -o '[0-9]*')
        PASSED=$(grep -o '"passed": *[0-9]*' "$COMPLIANCE_REPORT" | grep -o '[0-9]*')
        FAILED=$(grep -o '"failed": *[0-9]*' "$COMPLIANCE_REPORT" | grep -o '[0-9]*')
        WARNINGS=$(grep -o '"warnings": *[0-9]*' "$COMPLIANCE_REPORT" | grep -o '[0-9]*')
        CFM_VIOLATIONS=$(grep -o '"cfmViolations": *[0-9]*' "$COMPLIANCE_REPORT" | grep -o '[0-9]*')
    fi

    echo -e "\n${BLUE}📊 ESTATÍSTICAS DE VALIDAÇÃO:${NC}"
    echo -e "   Total analisado: ${TOTAL}"
    echo -e "   ${GREEN}✅ Aprovados: ${PASSED}${NC}"
    echo -e "   ${RED}❌ Falharam: ${FAILED}${NC}"
    echo -e "   ${YELLOW}⚠️  Avisos: ${WARNINGS}${NC}"
    echo -e "   ${RED}🚨 Violações CFM: ${CFM_VIOLATIONS}${NC}"

    # Gera sumário para GitHub Actions
    cat > "$SUMMARY_FILE" << EOF
# 🏥 Blog Compliance Report

**Data:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Status:** $([ "$FAILED" -eq 0 ] && echo "✅ Aprovado" || echo "� Falha na validação")

## 📊 Estatísticas

| Métrica | Quantidade | Status |
|---------|-----------|--------|
| Posts analisados | $TOTAL | - |
| Aprovados | $PASSED | ✅ |
| Falhas | $FAILED | $([ "$FAILED" -eq 0 ] && echo "✅" || echo "❌") |
| Avisos | $WARNINGS | ⚠️ |
| Violações CFM | $CFM_VIOLATIONS | $([ "$CFM_VIOLATIONS" -eq 0 ] && echo "✅" || echo "🚨") |

## 🚨 Ações Necessárias

$([ "$FAILED" -gt 0 ] && echo "### ❌ Itens que precisam de correção:" || echo "### ✅ Nenhuma correção necessária")

EOF

    # Adiciona itens falhos ao sumário
    if [[ "$FAILED" -gt 0 ]]; then
        if command -v jq &> /dev/null; then
            # Extrai issues do relatório
            jq -r '.issues[] | "- **Post ID \(.postId)**: \(.title) - \(.issues[0].message)"' "$COMPLIANCE_REPORT" >> "$SUMMARY_FILE"
        fi
    fi

    # Adiciona recomendações
    cat >> "$SUMMARY_FILE" << EOF

## 💡 Recomendações

- Manter nomenclatura profissional padrão CFM
- Otimizar imagens >2MB para formatos modernos (AVIF/WebP)
- Adicionar disclaimers para procedimentos experimentais
- Verificar alinhamento temático imagem-conteúdo

## 📋 Comandos Úteis

\`\`\`bash
# Validar conformidade localmente
npm run audit:blog-images

# Otimizar imagens existentes
npm run optimize:images

# Gerar novas capas com AI
./scripts/generate-additional-covers.sh
\`\`\`

---

*Relatório gerado automaticamente por Saraiva Vision Blog Compliance Validator*
EOF

    echo -e "\n${BLUE}📄 Sumário gerado: ${SUMMARY_FILE}${NC}"

    # Output para GitHub Actions (se estiver no CI)
    if [[ "${GITHUB_ACTIONS:-}" == "true" ]]; then
        echo "::group::Blog Compliance Results"

        # GitHub Annotations para falhas
        if [[ "$FAILED" -gt 0 ]]; then
            echo "::error::Blog compliance check failed with $FAILED posts requiring attention"
        fi

        if [[ "$CFM_VIOLATIONS" -gt 0 ]]; then
            echo "::error::CFM violations detected: $CFM_VIOLATIONS - Immediate action required"
        fi

        # Sumário no GitHub
        echo "total=$TOTAL" >> "$GITHUB_OUTPUT"
        echo "passed=$PASSED" >> "$GITHUB_OUTPUT"
        echo "failed=$FAILED" >> "$GITHUB_OUTPUT"
        echo "warnings=$WARNINGS" >> "$GITHUB_OUTPUT"
        echo "cfm_violations=$CFM_VIOLATIONS" >> "$GITHUB_OUTPUT"

        echo "::endgroup::"
    fi

    # Verifica se deve falhar o CI
    if [[ "$FAILED" -gt 0 || "$CFM_VIOLATIONS" -gt 0 ]]; then
        if [[ "$EXIT_ON_FAILURE" == "true" ]]; then
            echo -e "\n${RED}🚨 CI FAILED: Compliance issues detected${NC}"
            exit 1
        else
            echo -e "\n${YELLOW}⚠️  Compliance issues detected but CI continuing${NC}"
        fi
    fi

else
    echo -e "${YELLOW}⚠️  Nenhum relatório de validação encontrado${NC}"
fi

echo -e "\n${GREEN}✅ Blog compliance check concluído${NC}"