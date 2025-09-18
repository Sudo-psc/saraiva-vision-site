#!/bin/bash

echo "=================================================="
echo "🏥 INSTALANDO PLUGIN SARAIVA VISION API ENHANCER"
echo "=================================================="
echo ""

# 1. Verificar se estamos no diretório correto
if [ ! -f "wp-config.php" ]; then
    echo "❌ ERRO: wp-config.php não encontrado. Execute este script no diretório raiz do WordPress."
    exit 1
fi

# 2. Copiar plugin para o diretório de plugins
echo "1. Instalando plugin Saraiva Vision API Enhancer..."
PLUGIN_DIR="wp-content/plugins/saraiva-vision-api-enhancer"

if [ -d "$PLUGIN_DIR" ]; then
    echo "   • Removendo versão anterior do plugin..."
    rm -rf "$PLUGIN_DIR"
fi

mkdir -p "$PLUGIN_DIR"
cp saraiva-vision-api-enhancer.php "$PLUGIN_DIR/"
echo "   ✅ Plugin copiado com sucesso!"

# 3. Ativar o plugin via WP-CLI
echo ""
echo "2. Ativando plugin..."

# Verificar se WP-CLI está disponível
if command -v wp &> /dev/null; then
    wp plugin activate saraiva-vision-api-enhancer --allow-root
    echo "   ✅ Plugin ativado via WP-CLI!"
else
    echo "   ⚠️  WP-CLI não encontrado. Plugin precisa ser ativado manualmente no admin WordPress."
    echo "   URL do admin: https://saraivavision.com.br/blog/wp-admin/plugins.php"
fi

# 4. Testar endpoints customizados
echo ""
echo "3. Testando endpoints da API Saraiva Vision..."

# URL base
BASE_URL="https://saraivavision.com.br"

echo "   • Testando endpoint de saúde..."
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" "$BASE_URL/wp-json/saraiva-vision/v1/health" -o /dev/null)
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo "     ✅ Endpoint de saúde funcionando!"
else
    echo "     ❌ Endpoint de saúde retornou: $HEALTH_RESPONSE"
fi

echo "   • Testando serviços oftalmológicos..."
SERVICOS_RESPONSE=$(curl -s -w "%{http_code}" "$BASE_URL/wp-json/saraiva-vision/v1/servicos-oftalmologicos?per_page=3" -o /dev/null)
if [ "$SERVICOS_RESPONSE" = "200" ]; then
    echo "     ✅ Endpoint de serviços oftalmológicos funcionando!"
else
    echo "     ❌ Endpoint de serviços retornou: $SERVICOS_RESPONSE"
fi

echo "   • Testando equipe médica..."
EQUIPE_RESPONSE=$(curl -s -w "%{http_code}" "$BASE_URL/wp-json/saraiva-vision/v1/equipe-medica" -o /dev/null)
if [ "$EQUIPE_RESPONSE" = "200" ]; then
    echo "     ✅ Endpoint de equipe médica funcionando!"
else
    echo "     ❌ Endpoint de equipe retornou: $EQUIPE_RESPONSE"
fi

echo "   • Testando exames e procedimentos..."
EXAMES_RESPONSE=$(curl -s -w "%{http_code}" "$BASE_URL/wp-json/saraiva-vision/v1/exames-procedimentos" -o /dev/null)
if [ "$EXAMES_RESPONSE" = "200" ]; then
    echo "     ✅ Endpoint de exames funcionando!"
else
    echo "     ❌ Endpoint de exames retornou: $EXAMES_RESPONSE"
fi

# 5. Testar endpoints principais
echo ""
echo "4. Validando endpoints principais..."
POSTS_RESPONSE=$(curl -s -w "%{http_code}" "$BASE_URL/wp-json/wp/v2/posts?per_page=3" -o /dev/null)
if [ "$POSTS_RESPONSE" = "200" ]; then
    echo "   ✅ Endpoint de posts funcionando!"
    TOTAL_POSTS=$(curl -s "$BASE_URL/wp-json/wp/v2/posts" | jq -r '.[] | .title.rendered' | wc -l)
    echo "   📊 Total de posts disponíveis: $TOTAL_POSTS"
else
    echo "   ❌ Endpoint de posts retornou: $POSTS_RESPONSE"
fi

CATEGORIES_RESPONSE=$(curl -s -w "%{http_code}" "$BASE_URL/wp-json/wp/v2/categories" -o /dev/null)
if [ "$CATEGORIES_RESPONSE" = "200" ]; then
    echo "   ✅ Endpoint de categorias funcionando!"
else
    echo "   ❌ Endpoint de categorias retornou: $CATEGORIES_RESPONSE"
fi

# 6. Mostrar resumo dos endpoints disponíveis
echo ""
echo "5. Resumo dos endpoints disponíveis:"
echo "   🌐 Base API: $BASE_URL/wp-json/"
echo "   📝 Posts: $BASE_URL/wp-json/wp/v2/posts"
echo "   📂 Categorias: $BASE_URL/wp-json/wp/v2/categories"
echo "   👨‍⚕️ Saúde da API: $BASE_URL/wp-json/saraiva-vision/v1/health"
echo "   🏥 Serviços Oftalmológicos: $BASE_URL/wp-json/saraiva-vision/v1/servicos-oftalmologicos"
echo "   👥 Equipe Médica: $BASE_URL/wp-json/saraiva-vision/v1/equipe-medica"
echo "   🔬 Exames: $BASE_URL/wp-json/saraiva-vision/v1/exames-procedimentos"

echo ""
echo "=================================================="
echo "✅ INSTALAÇÃO CONCLUÍDA!"
echo "=================================================="
echo ""
echo "🏥 Clínica Saraiva Vision - API Oftalmológica Configurada"
echo "👨‍⚕️ Dr. Philipe Saraiva Cruz - CRM-MG 69.870"
echo "📍 Caratinga, MG"
echo ""
echo "📌 Próximos passos:"
echo "   1. Se WP-CLI não estava disponível, ative o plugin manualmente no admin"
echo "   2. Teste os endpoints no seu frontend React"
echo "   3. Configure o cache CDN para melhor performance"
echo ""
echo "🔧 Links úteis:"
echo "   • Admin WordPress: https://saraivavision.com.br/blog/wp-admin/"
echo "   • Teste API: curl $BASE_URL/wp-json/saraiva-vision/v1/health"
echo ""