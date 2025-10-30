#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

dotenv.config({ path: join(PROJECT_ROOT, '.env.production') });
dotenv.config({ path: join(PROJECT_ROOT, '.env') });

async function findLatestReport() {
  const reportsDir = join(PROJECT_ROOT, 'reports', 'system-checkup');
  
  try {
    const files = readdirSync(reportsDir)
      .filter(f => f.endsWith('.json'))
      .map(f => ({
        name: f,
        path: join(reportsDir, f),
        mtime: statSync(join(reportsDir, f)).mtime
      }))
      .sort((a, b) => b.mtime - a.mtime);

    if (files.length === 0) {
      throw new Error('No report files found');
    }

    return files[0].path;
  } catch (error) {
    console.error('Error finding report file:', error.message);
    throw error;
  }
}

async function sendReport(reportPath) {
  try {
    const { sendReportFromFile, validateReportEmailConfig } = await import('../api/src/routes/reports/reportEmailService.js');
    
    const configValidation = validateReportEmailConfig();
    if (!configValidation.isValid) {
      console.error('Configuration errors:');
      configValidation.errors.forEach(err => console.error(`  - ${err}`));
      process.exit(1);
    }

    console.log(`Enviando relatório: ${reportPath}`);
    
    const result = await sendReportFromFile(reportPath);

    if (result.success) {
      console.log(`✓ Relatório enviado com sucesso!`);
      console.log(`  Message ID: ${result.messageId}`);
      console.log(`  Timestamp: ${result.timestamp}`);
      process.exit(0);
    } else {
      console.error(`✗ Falha ao enviar relatório:`);
      console.error(`  Código: ${result.error.code}`);
      console.error(`  Mensagem: ${result.error.message}`);
      console.error(`  Detalhes: ${result.error.details}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('Erro ao enviar relatório:', error);
    process.exit(1);
  }
}

async function main() {
  try {
    const reportPath = process.argv[2] || await findLatestReport();
    
    if (!reportPath) {
      console.error('Nenhum relatório encontrado');
      process.exit(1);
    }

    await sendReport(reportPath);
  } catch (error) {
    console.error('Erro:', error.message);
    process.exit(1);
  }
}

main();
