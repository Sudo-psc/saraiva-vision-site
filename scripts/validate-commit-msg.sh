#!/bin/bash

set -e

echo "🔍 Validating commit messages..."

COMMIT_MSG="$1"

if [ -z "$COMMIT_MSG" ]; then
  echo "Usage: $0 <commit-message>"
  exit 1
fi

if echo "$COMMIT_MSG" | grep -qE "^Merge|^\[skip ci\]|^chore\(release\):"; then
  echo "✅ Automated commit - skipping validation"
  exit 0
fi

if echo "$COMMIT_MSG" | grep -qE "^(feat|fix|docs|style|refactor|perf|test|build|ci|chore)(\(.+\))?: .{1,}"; then
  echo "✅ Commit message follows Conventional Commits format"
  exit 0
else
  echo ""
  echo "❌ Erro: Mensagem de commit não segue Conventional Commits!"
  echo ""
  echo "Formato esperado:"
  echo "  <tipo>(<escopo>): <descrição>"
  echo ""
  echo "Tipos válidos:"
  echo "  feat, fix, docs, style, refactor, perf, test, build, ci, chore"
  echo ""
  echo "Exemplos válidos:"
  echo "  feat(blog): adicionar sistema de comentários"
  echo "  fix(api): corrigir validação de email"
  echo "  docs: atualizar README"
  echo "  perf(images): otimizar carregamento"
  echo "  refactor(auth): simplificar lógica de autenticação"
  echo ""
  echo "💡 Dica: Use 'npm run commit' para uma interface interativa!"
  echo ""
  exit 1
fi
