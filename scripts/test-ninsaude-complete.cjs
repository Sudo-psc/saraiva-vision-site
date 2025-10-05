const https = require('https');

const NINSAUDE_ACCOUNT = process.env.NINSAUDE_ACCOUNT;
const NINSAUDE_USERNAME = process.env.NINSAUDE_USERNAME;
const NINSAUDE_PASSWORD = process.env.NINSAUDE_PASSWORD;
const NINSAUDE_ACCOUNT_UNIT = process.env.NINSAUDE_ACCOUNT_UNIT;

if (!NINSAUDE_ACCOUNT || !NINSAUDE_USERNAME || !NINSAUDE_PASSWORD || !NINSAUDE_ACCOUNT_UNIT) {
  console.error('Missing required environment variables: NINSAUDE_ACCOUNT, NINSAUDE_USERNAME, NINSAUDE_PASSWORD, NINSAUDE_ACCOUNT_UNIT');
  process.exit(1);
}

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

async function login() {
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

  const result = await makeRequest(options, postData);
  
  if (result.status === 200) {
    return {
      success: true,
      accessToken: result.data.access_token,
      refreshToken: result.data.refresh_token,
    };
  }
  
  return { success: false, error: result.data };
}

async function listUnits(accessToken) {
  const options = {
    hostname: 'api.ninsaude.com',
    port: 443,
    path: '/v1/account_geral/listar?limit=50&ativo=1',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `bearer ${accessToken}`,
    },
  };

  const result = await makeRequest(options);
  return result;
}

async function listProfessionals(accessToken) {
  const options = {
    hostname: 'api.ninsaude.com',
    port: 443,
    path: '/v1/cadastro_profissional/listar?limit=50',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `bearer ${accessToken}`,
    },
  };

  const result = await makeRequest(options);
  return result;
}

async function getAvailableSlots(accessToken, professionalId, startDate, endDate) {
  const options = {
    hostname: 'api.ninsaude.com',
    port: 443,
    path: `/v1/atendimento_agenda/listar/horario/disponivel/profissional/${professionalId}/dataInicial/${startDate}/dataFinal/${endDate}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `bearer ${accessToken}`,
    },
  };

  const result = await makeRequest(options);
  return result;
}

async function runCompleteTest() {
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('   🧪 TESTE COMPLETO - NINSAÚDE API\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('🔐 1. AUTENTICAÇÃO OAUTH2\n');
  const loginResult = await login();
  
  if (!loginResult.success) {
    console.log('❌ Falha no login:', loginResult.error);
    return;
  }
  
  console.log('✅ Login bem-sucedido!');
  console.log(`   Access Token: ${loginResult.accessToken.substring(0, 50)}...`);
  console.log(`   Refresh Token: ${loginResult.refreshToken.substring(0, 50)}...\n`);

  console.log('🏥 2. UNIDADES DE ATENDIMENTO\n');
  const unitsResult = await listUnits(loginResult.accessToken);
  
  if (unitsResult.status === 200 && unitsResult.data.result) {
    console.log(`✅ Total de unidades: ${unitsResult.data.result.length}\n`);
    unitsResult.data.result.forEach((unit, index) => {
      console.log(`   ${index + 1}. ${unit.descricao || unit.unidade || 'Sem nome'}`);
      console.log(`      ID: ${unit.id}`);
      console.log(`      Unidade: ${unit.unidade}`);
      console.log(`      Ativo: ${unit.ativo ? 'Sim' : 'Não'}\n`);
    });
  } else {
    console.log('⚠️ Nenhuma unidade encontrada');
    console.log('   Status:', unitsResult.status);
    console.log('   Resposta:', JSON.stringify(unitsResult.data, null, 2).substring(0, 300), '\n');
  }

  console.log('👨‍⚕️ 3. PROFISSIONAIS\n');
  const profsResult = await listProfessionals(loginResult.accessToken);
  
  let professionalId = null;
  
  if (profsResult.status === 200 && profsResult.data.result && profsResult.data.result.length > 0) {
    console.log(`✅ Total de profissionais: ${profsResult.data.result.length}\n`);
    profsResult.data.result.slice(0, 5).forEach((prof, index) => {
      console.log(`   ${index + 1}. ${prof.nome || 'Sem nome'}`);
      if (prof.id) console.log(`      ID: ${prof.id}`);
      if (prof.conselhoDescricao) console.log(`      Conselho: ${prof.conselhoDescricao}`);
      if (prof.email) console.log(`      Email: ${prof.email}`);
      console.log(`      Ativo: ${prof.ativo ? 'Sim' : 'Não'}\n`);
      
      if (index === 0 && prof.ativo) {
        professionalId = prof.id;
      }
    });
  } else {
    console.log('⚠️ Nenhum profissional encontrado');
    console.log('   Status:', profsResult.status);
    console.log('   Resposta:', JSON.stringify(profsResult.data, null, 2).substring(0, 300), '\n');
  }

  console.log('📅 4. HORÁRIOS DISPONÍVEIS\n');
  
  if (!professionalId) {
    console.log('⚠️ Não foi possível buscar horários (sem profissional disponível)\n');
  } else {
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    
    const endDateObj = new Date(today);
    endDateObj.setDate(endDateObj.getDate() + 7);
    const endDate = endDateObj.toISOString().split('T')[0];
    
    console.log(`   Profissional ID: ${professionalId}`);
    console.log(`   Período: ${startDate} até ${endDate}\n`);
    
    const slotsResult = await getAvailableSlots(loginResult.accessToken, professionalId, startDate, endDate);
    
    if (slotsResult.status === 200) {
      if (slotsResult.data.data && slotsResult.data.data.length > 0) {
        console.log(`✅ Total de horários: ${slotsResult.data.data.length}\n`);
        slotsResult.data.data.slice(0, 10).forEach((slot, index) => {
          console.log(`   ${index + 1}. ${slot.horario || slot.time || JSON.stringify(slot)}`);
        });
      } else {
        console.log('⚠️ Nenhum horário disponível para este período\n');
        console.log('   Resposta completa:', JSON.stringify(slotsResult.data, null, 2));
      }
    } else {
      console.log(`⚠️ Erro ao buscar horários (Status: ${slotsResult.status})\n`);
      console.log('   Resposta:', JSON.stringify(slotsResult.data, null, 2));
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   ✅ TESTES CONCLUÍDOS!');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('📊 RESUMO:\n');
  console.log(`   ✅ Autenticação OAuth2: ${loginResult.success ? 'OK' : 'FALHOU'}`);
  console.log(`   ${unitsResult.status === 200 ? '✅' : '⚠️'} Listagem de Unidades: ${unitsResult.status === 200 ? 'OK' : 'Sem dados'}`);
  console.log(`   ${profsResult.status === 200 ? '✅' : '⚠️'} Listagem de Profissionais: ${profsResult.status === 200 ? 'OK' : 'Sem dados'}`);
  console.log(`   ${professionalId ? '✅' : '⚠️'} Consulta de Horários: ${professionalId ? 'Testado' : 'Não testado'}\n`);
}

runCompleteTest();
