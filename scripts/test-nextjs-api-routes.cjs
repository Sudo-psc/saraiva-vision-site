const https = require('https');

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
let accessToken = '';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : require('http');

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (options.body) {
      const bodyStr = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
      requestOptions.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    const req = client.request(requestOptions, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      const bodyStr = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
      req.write(bodyStr);
    }

    req.end();
  });
}

async function testAuthentication() {
  console.log('\n🔐 1. TESTE DE AUTENTICAÇÃO\n');
  
  try {
    const result = await makeRequest(`${API_BASE_URL}/api/ninsaude/auth`, {
      method: 'POST',
      body: { action: 'login' }
    });

    if (result.status === 200 && result.data.access_token) {
      accessToken = result.data.access_token;
      console.log('✅ Login bem-sucedido!');
      console.log(`   Access Token: ${accessToken.substring(0, 50)}...`);
      console.log(`   Expires in: ${result.data.expires_in} segundos\n`);
      return true;
    } else {
      console.log(`❌ Falha no login (Status: ${result.status})`);
      console.log('   Resposta:', JSON.stringify(result.data, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ Erro na autenticação:', error.message);
    return false;
  }
}

async function testUnits() {
  console.log('🏥 2. TESTE DE UNIDADES\n');
  
  try {
    const result = await makeRequest(`${API_BASE_URL}/api/ninsaude/units?limit=10`, {
      method: 'GET',
      headers: { 'x-access-token': accessToken }
    });

    if (result.status === 200) {
      console.log(`✅ Total de unidades: ${result.data.total}`);
      if (result.data.units && result.data.units.length > 0) {
        result.data.units.forEach((unit, index) => {
          console.log(`   ${index + 1}. ${unit.descricao || unit.unidade}`);
          console.log(`      ID: ${unit.id}`);
          console.log(`      Cidade: ${unit.enderecoCidadeTitle || 'N/A'}/${unit.enderecoCidadeSig || 'N/A'}\n`);
        });
      }
      return result.data.units[0]?.id;
    } else {
      console.log(`❌ Erro ao buscar unidades (Status: ${result.status})\n`);
      return null;
    }
  } catch (error) {
    console.log('❌ Erro:', error.message, '\n');
    return null;
  }
}

async function testProfessionals() {
  console.log('👨‍⚕️ 3. TESTE DE PROFISSIONAIS\n');
  
  try {
    const result = await makeRequest(`${API_BASE_URL}/api/ninsaude/professionals?limit=10`, {
      method: 'GET',
      headers: { 'x-access-token': accessToken }
    });

    if (result.status === 200) {
      console.log(`✅ Total de profissionais: ${result.data.total}`);
      if (result.data.professionals && result.data.professionals.length > 0) {
        result.data.professionals.forEach((prof, index) => {
          console.log(`   ${index + 1}. ${prof.nome}`);
          console.log(`      ID: ${prof.id}`);
          console.log(`      Email: ${prof.email || 'N/A'}`);
          console.log(`      Conselho: ${prof.conselhoDescricao || 'N/A'}\n`);
        });
      }
      return result.data.professionals[0]?.id;
    } else {
      console.log(`❌ Erro ao buscar profissionais (Status: ${result.status})\n`);
      return null;
    }
  } catch (error) {
    console.log('❌ Erro:', error.message, '\n');
    return null;
  }
}

async function testAvailableSlots(professionalId) {
  console.log('📅 4. TESTE DE HORÁRIOS DISPONÍVEIS\n');
  
  if (!professionalId) {
    console.log('⚠️ Profissional não encontrado - pulando teste\n');
    return [];
  }

  try {
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    const endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const result = await makeRequest(
      `${API_BASE_URL}/api/ninsaude/available-slots?professional_id=${professionalId}&start_date=${startDate}&end_date=${endDate}`,
      {
        method: 'GET',
        headers: { 'x-access-token': accessToken }
      }
    );

    if (result.status === 200) {
      console.log(`✅ Total de horários disponíveis: ${result.data.total}`);
      console.log(`   Período: ${startDate} até ${endDate}\n`);
      
      if (result.data.slots && result.data.slots.length > 0) {
        const slotsByDate = {};
        result.data.slots.forEach(slot => {
          if (!slotsByDate[slot.date]) {
            slotsByDate[slot.date] = [];
          }
          slotsByDate[slot.date].push(slot);
        });

        Object.keys(slotsByDate).slice(0, 3).forEach(date => {
          console.log(`   📆 ${date}: ${slotsByDate[date].length} horários`);
          slotsByDate[date].slice(0, 5).forEach(slot => {
            console.log(`      • ${slot.startTime} - ${slot.endTime}`);
          });
          if (slotsByDate[date].length > 5) {
            console.log(`      ... e mais ${slotsByDate[date].length - 5} horários`);
          }
          console.log();
        });

        return result.data.slots;
      }
      return [];
    } else {
      console.log(`❌ Erro ao buscar horários (Status: ${result.status})`);
      console.log('   Resposta:', JSON.stringify(result.data, null, 2), '\n');
      return [];
    }
  } catch (error) {
    console.log('❌ Erro:', error.message, '\n');
    return [];
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   🧪 TESTE DAS API ROUTES NEXT.JS - NINSAÚDE');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`\n   Base URL: ${API_BASE_URL}\n`);

  const authSuccess = await testAuthentication();
  if (!authSuccess) {
    console.log('\n❌ Falha na autenticação - abortando testes\n');
    return;
  }

  const unitId = await testUnits();
  const professionalId = await testProfessionals();
  const slots = await testAvailableSlots(professionalId);

  console.log('═══════════════════════════════════════════════════════════');
  console.log('   📊 RESUMO DOS TESTES');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log(`   ✅ Autenticação: ${authSuccess ? 'OK' : 'FALHOU'}`);
  console.log(`   ${unitId ? '✅' : '⚠️'} Unidades: ${unitId ? 'OK' : 'Sem dados'}`);
  console.log(`   ${professionalId ? '✅' : '⚠️'} Profissionais: ${professionalId ? 'OK' : 'Sem dados'}`);
  console.log(`   ${slots.length > 0 ? '✅' : '⚠️'} Horários: ${slots.length > 0 ? `${slots.length} slots encontrados` : 'Sem dados'}\n`);

  if (authSuccess && unitId && professionalId && slots.length > 0) {
    console.log('   🎉 Todos os testes passaram com sucesso!\n');
  } else {
    console.log('   ⚠️ Alguns testes falharam ou retornaram sem dados\n');
  }
}

runTests();
