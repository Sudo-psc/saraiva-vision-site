#!/bin/bash

echo "🚀 Setup Final do SaraivaVision"
echo "================================"

# Verificar status dos serviços
echo "📊 Verificando serviços Docker..."
docker compose ps

echo ""
echo "🔍 Testando endpoints principais..."

# Testar Frontend
echo "1. Frontend (http://localhost:3002):"
frontend_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/health 2>/dev/null)
if [ "$frontend_status" == "200" ]; then
    echo "   ✅ ONLINE"
else
    echo "   ❌ OFFLINE (Status: $frontend_status)"
fi

# Testar API
echo "2. API (http://localhost:3001):"
api_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health 2>/dev/null)
if [ "$api_status" == "200" ]; then
    echo "   ✅ ONLINE"
else
    echo "   ❌ OFFLINE (Status: $api_status)"
fi

# Testar Nginx
echo "3. Nginx (http://localhost:8080):"
nginx_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health 2>/dev/null)
if [ "$nginx_status" == "200" ]; then
    echo "   ✅ ONLINE"
else
    echo "   ❌ OFFLINE (Status: $nginx_status)"
fi

# Testar WordPress
echo "4. WordPress (http://localhost:8083):"
wp_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8083/ 2>/dev/null)
if [ "$wp_status" == "200" ] || [ "$wp_status" == "302" ]; then
    echo "   ✅ ONLINE (precisa configuração manual)"
    echo "      📝 Acesse: http://localhost:8083/wp-admin/install.php"
    echo "      👤 Usuário: admin"
    echo "      🔐 Senha: admin123"
else
    echo "   ❌ OFFLINE (Status: $wp_status)"
fi

# Testar Redis
echo "5. Redis (porta 6379):"
redis_status=$(docker exec saraiva-redis redis-cli -a redis_password ping 2>/dev/null)
if [ "$redis_status" == "PONG" ]; then
    echo "   ✅ ONLINE"
else
    echo "   ❌ OFFLINE"
fi

# Testar Database
echo "6. Database (MySQL):"
db_status=$(docker exec saraiva-db mysql -u wordpress -pwordpress -e "SELECT 1;" 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "   ✅ ONLINE"
else
    echo "   ❌ OFFLINE"
fi

echo ""
echo "🔗 URLs de Acesso:"
echo "=================="
echo "🌐 Frontend:      http://localhost:3002"
echo "🔧 API:           http://localhost:3001"
echo "🌍 Proxy Nginx:   http://localhost:8080"
echo "📝 WordPress:     http://localhost:8083"
echo "📊 Health Monitor: docker logs saraiva-health-monitor"

echo ""
echo "⚙️  Próximos Passos:"
echo "=================="
echo "1. Configure o WordPress acessando http://localhost:8083/wp-admin/install.php"
echo "2. Use as credenciais: admin / admin123"
echo "3. Instale plugins necessários para o projeto"
echo "4. Configure o tema e conteúdo inicial"

echo ""
echo "🎉 Setup concluído! O ambiente está pronto para desenvolvimento."