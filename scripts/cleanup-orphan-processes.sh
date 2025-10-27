#!/bin/bash

# Script de limpeza de processos órfãos Claude/OpenCode e MCP
# Mantém apenas a sessão atual ativa

echo "=== Saraiva Vision - Limpeza de Processos Órfãos ==="
echo "Iniciado em: $(date)"

# Identifica o terminal atual
CURRENT_TTY=$(tty 2>/dev/null || echo "none")
echo "Terminal atual: $CURRENT_TTY"

# Função para matar processos órfãos de Claude/OpenCode
cleanup_claude() {
    echo ""
    echo "=== Limpando processos Claude/OpenCode órfãos ==="
    
    # Lista processos antigos (mais de 1 dia)
    ps aux | grep -E "\.local/bin/claude|\.opencode/bin/opencode" | grep -v grep | \
    while read -r line; do
        pid=$(echo "$line" | awk '{print $2}')
        tty=$(echo "$line" | awk '{print $7}')
        start=$(echo "$line" | awk '{print $9}')
        
        # Se não é o terminal atual e começou há mais de 1 dia
        if [[ "$tty" != "$CURRENT_TTY" ]] && [[ "$start" != *":"* ]]; then
            echo "Matando processo órfão: PID $pid ($tty, iniciado $start)"
            kill -15 "$pid" 2>/dev/null || kill -9 "$pid" 2>/dev/null
        fi
    done
}

# Função para matar processos MCP órfãos
cleanup_mcp() {
    echo ""
    echo "=== Limpando processos MCP órfãos ==="
    
    ps aux | grep "mcp-server\|magic\|context7\|playwright\|sequential" | grep -v grep | \
    while read -r line; do
        pid=$(echo "$line" | awk '{print $2}')
        tty=$(echo "$line" | awk '{print $7}')
        start=$(echo "$line" | awk '{print $9}')
        
        # Se não é o terminal atual e começou há mais de 1 dia
        if [[ "$tty" != "$CURRENT_TTY" ]] && [[ "$start" != *":"* ]]; then
            echo "Matando MCP órfão: PID $pid ($tty, iniciado $start)"
            kill -15 "$pid" 2>/dev/null || kill -9 "$pid" 2>/dev/null
        fi
    done
}

# Função para matar processos TypeScript órfãos
cleanup_typescript() {
    echo ""
    echo "=== Limpando processos TypeScript Language Server órfãos ==="
    
    ps aux | grep "typescript-language-server\|tsserver" | grep -v grep | \
    while read -r line; do
        pid=$(echo "$line" | awk '{print $2}')
        tty=$(echo "$line" | awk '{print $7}')
        start=$(echo "$line" | awk '{print $9}')
        mem=$(echo "$line" | awk '{print $4}')
        
        # Se não é o terminal atual e começou há mais de 1 dia ou usa mais de 5% de memória
        if ([[ "$tty" != "$CURRENT_TTY" ]] && [[ "$start" != *":"* ]]) || \
           (( $(echo "$mem > 5.0" | bc -l 2>/dev/null || echo 0) )); then
            echo "Matando TypeScript órfão: PID $pid ($tty, iniciado $start, mem ${mem}%)"
            kill -15 "$pid" 2>/dev/null || kill -9 "$pid" 2>/dev/null
        fi
    done
}

# Executa limpeza
cleanup_claude
cleanup_mcp
cleanup_typescript

echo ""
echo "=== Resumo após limpeza ==="
echo "Memória disponível:"
free -h | grep -E "Mem|Swap"

echo ""
echo "Processos Claude/OpenCode ativos:"
ps aux | grep -E "claude|opencode" | grep -v grep | wc -l

echo ""
echo "Processos MCP ativos:"
ps aux | grep "mcp-server" | grep -v grep | wc -l

echo ""
echo "Limpeza concluída em: $(date)"
