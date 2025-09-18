#!/bin/bash
# Script para iniciar o servidor da API em background

cd /home/saraiva-vision-site

# Parar qualquer processo anterior na porta 3001
echo "Parando processos anteriores na porta 3001..."
pkill -f "node server.js" || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# Aguardar um momento
sleep 2

# Iniciar o servidor em background
echo "Iniciando servidor API..."
nohup node server.js > api.log 2>&1 &

echo "Servidor API iniciado em background (PID: $!)"
echo "Logs podem ser visualizados em: tail -f api.log"

# Aguardar um momento e testar
sleep 3
if curl -s http://localhost:3001/api/reviews >/dev/null; then
    echo "✅ Servidor API respondendo corretamente"
else
    echo "❌ Erro: Servidor API não está respondendo"
    cat api.log | tail -10
    exit 1
fi