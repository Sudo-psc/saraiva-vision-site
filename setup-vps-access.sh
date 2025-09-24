#!/bin/bash

# Script para configurar acesso SSH ao VPS
# Este script deve ser executado para configurar o acesso ao VPS 31.97.129.78

VPS_IP="31.97.129.78"
SSH_KEY_PATH="/root/.ssh/saraiva_deploy"
SSH_PUB_KEY_PATH="/root/.ssh/saraiva_deploy.pub"

echo "🔑 Configurando acesso SSH ao VPS"
echo "================================="

# Verifica se a chave SSH existe
if [ ! -f "$SSH_KEY_PATH" ]; then
    echo "❌ Chave SSH não encontrada em $SSH_KEY_PATH"
    echo "⚡ Gerando nova chave SSH..."
    ssh-keygen -t ed25519 -C "saraiva-deploy-$(date +%Y%m%d)" -f "$SSH_KEY_PATH" -N ""
    echo "✅ Chave SSH gerada com sucesso"
fi

# Mostra a chave pública
echo ""
echo "🔑 Chave pública SSH para adicionar ao VPS:"
echo "==========================================="
cat "$SSH_PUB_KEY_PATH"
echo ""

# Instruções para configuração manual
echo "📋 INSTRUÇÕES PARA CONFIGURAÇÃO DO VPS:"
echo "======================================="
echo "1. Acesse o VPS $VPS_IP via painel de controle ou console"
echo "2. Execute os seguintes comandos como root:"
echo ""
echo "   mkdir -p /root/.ssh"
echo "   chmod 700 /root/.ssh"
echo "   echo '$(cat $SSH_PUB_KEY_PATH)' >> /root/.ssh/authorized_keys"
echo "   chmod 600 /root/.ssh/authorized_keys"
echo "   systemctl restart sshd"
echo ""
echo "3. Após configurar, teste a conexão com:"
echo "   ssh -i $SSH_KEY_PATH root@$VPS_IP"
echo ""

# Tenta conexão de teste
echo "🧪 Testando conexão SSH..."
if ssh -i "$SSH_KEY_PATH" -o ConnectTimeout=10 -o StrictHostKeyChecking=no root@$VPS_IP "echo 'Conexão SSH funcionando!'" 2>/dev/null; then
    echo "✅ Conexão SSH estabelecida com sucesso!"
    echo "🚀 VPS está pronto para deploy. Use: npm run deploy:vps"
else
    echo "⚠️  Conexão SSH ainda não configurada"
    echo "📝 Siga as instruções acima para configurar o acesso"
fi

# Configurar SSH config para facilitar acesso
SSH_CONFIG="/root/.ssh/config"
if ! grep -q "Host saraiva-vps" "$SSH_CONFIG" 2>/dev/null; then
    echo ""
    echo "⚙️  Configurando SSH config..."
    cat >> "$SSH_CONFIG" << EOF

# Saraiva Vision VPS
Host saraiva-vps
    HostName $VPS_IP
    User root
    IdentityFile $SSH_KEY_PATH
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
EOF
    chmod 600 "$SSH_CONFIG"
    echo "✅ SSH config configurado. Use: ssh saraiva-vps"
fi

echo ""
echo "🎯 PRÓXIMOS PASSOS:"
echo "=================="
echo "• Configure o acesso SSH seguindo as instruções acima"
echo "• Use 'npm run deploy' para deploy no Vercel (padrão)"
echo "• Use 'npm run deploy:vps' para deploy no VPS (após configurar SSH)"
echo "• Use 'npm run deploy:preview' para deploy preview no Vercel"