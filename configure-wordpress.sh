#!/bin/bash

echo "🔧 Configurando WordPress..."

# Aguardar WordPress ficar disponível
echo "⏳ Aguardando WordPress responder..."
until curl -f http://localhost:8083/wp-admin/install.php 2>/dev/null; do
    echo "Aguardando WordPress..."
    sleep 3
done

echo "✅ WordPress está pronto!"

# Criar configuração básica via curl
echo "📝 Enviando configuração inicial..."

response=$(curl -s -X POST http://localhost:8083/wp-admin/install.php \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "weblog_title=SaraivaVision+Development" \
    -d "user_name=admin" \
    -d "admin_password=admin123" \
    -d "admin_password2=admin123" \
    -d "admin_email=admin%40saraivavision.com.br" \
    -d "Submit=Install+WordPress")

if echo "$response" | grep -q "Success"; then
    echo "✅ WordPress instalado com sucesso!"
    echo "🔗 Site: http://localhost:8083/"
    echo "👤 Admin: http://localhost:8083/wp-admin/"
    echo "📝 Usuário: admin"
    echo "🔐 Senha: admin123"
else
    echo "⚠️ Possível falha na instalação, mas tentaremos continuar..."
    echo "🔍 Verificando status..."
    curl -I http://localhost:8083/
fi