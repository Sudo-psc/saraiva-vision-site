const https = require('https');

const NINSAUDE_API_URL = 'https://api.ninsaude.com/v1';
const NINSAUDE_ACCOUNT = 'saraivavision';
const NINSAUDE_USERNAME = 'philipe';
const NINSAUDE_PASSWORD = 'Psc451992*';
const NINSAUDE_ACCOUNT_UNIT = '1';

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (postData) {
      req.write(postData);
    }

    req.end();
  });
}

async function testOAuth2Login() {
  console.log('🔐 Testando autenticação OAuth2 Ninsaúde...\n');

  console.log('📋 Credenciais:');
  console.log(`   Account: ${NINSAUDE_ACCOUNT}`);
  console.log(`   Username: ${NINSAUDE_USERNAME}`);
  console.log(`   Unit: ${NINSAUDE_ACCOUNT_UNIT}\n`);

  const formData = new URLSearchParams();
  formData.append('grant_type', 'password');
  formData.append('account', NINSAUDE_ACCOUNT);
  formData.append('username', NINSAUDE_USERNAME);
  formData.append('password', NINSAUDE_PASSWORD);
  formData.append('accountUnit', NINSAUDE_ACCOUNT_UNIT);

  const postData = formData.toString();

  const options = {
    hostname: 'api.ninsaude.com',
    port: 443,
    path: '/v1/oauth2/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
      'cache-control': 'no-cache',
    },
  };

  try {
    console.log('🚀 Enviando requisição de login...');
    const result = await makeRequest(options, postData);

    console.log(`\n📊 Status: ${result.status}`);

    if (result.status === 200) {
      console.log('\n✅ AUTENTICAÇÃO BEM-SUCEDIDA!\n');
      console.log('📝 Tokens recebidos:');
      console.log(`   Access Token: ${result.data.access_token?.substring(0, 50)}...`);
      console.log(`   Refresh Token: ${result.data.refresh_token?.substring(0, 50)}...`);
      console.log(`   Token Type: ${result.data.token_type}`);
      console.log(`   Expires In: ${result.data.expires_in} segundos (${result.data.expires_in / 60} minutos)\n`);

      return {
        success: true,
        accessToken: result.data.access_token,
        refreshToken: result.data.refresh_token,
      };
    } else {
      console.log('\n❌ ERRO NA AUTENTICAÇÃO\n');
      console.log('Resposta:', JSON.stringify(result.data, null, 2));
      return { success: false };
    }
  } catch (error) {
    console.log('\n❌ ERRO NA REQUISIÇÃO\n');
    console.error(error);
    return { success: false };
  }
}

async function testListUnits(accessToken) {
  console.log('\n🏥 Testando listagem de unidades...\n');

  const options = {
    hostname: 'api.ninsaude.com',
    port: 443,
    path: '/v1/account_geral/listar?limit=5&ativo=1',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `bearer ${accessToken}`,
    },
  };

  try {
    const result = await makeRequest(options);

    console.log(`📊 Status: ${result.status}`);

    if (result.status === 200) {
      console.log('\n✅ LISTAGEM BEM-SUCEDIDA!\n');
      console.log('📝 Unidades encontradas:');
      
      if (result.data.data && Array.isArray(result.data.data)) {
        result.data.data.forEach((unit, index) => {
          console.log(`\n   ${index + 1}. ${unit.descricao || unit.unidade}`);
          console.log(`      ID: ${unit.id}`);
          console.log(`      Ativo: ${unit.ativo ? 'Sim' : 'Não'}`);
          if (unit.foneComercial) console.log(`      Telefone: ${unit.foneComercial}`);
        });
        console.log(`\n   Total: ${result.data.data.length} unidade(s)\n`);
      }

      return { success: true };
    } else {
      console.log('\n❌ ERRO NA LISTAGEM\n');
      console.log('Resposta:', JSON.stringify(result.data, null, 2));
      return { success: false };
    }
  } catch (error) {
    console.log('\n❌ ERRO NA REQUISIÇÃO\n');
    console.error(error);
    return { success: false };
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('   🧪 TESTE DE INTEGRAÇÃO - NINSAÚDE OAUTH2\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  const loginResult = await testOAuth2Login();

  if (loginResult.success) {
    await testListUnits(loginResult.accessToken);
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   ✅ TESTES CONCLUÍDOS');
  console.log('═══════════════════════════════════════════════════════════\n');
}

runTests();
