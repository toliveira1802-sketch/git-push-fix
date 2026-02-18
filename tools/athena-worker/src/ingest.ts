/**
 * Script de ingestao - Carrega documentos na knowledge base
 * Uso: npm run ingest
 */

import 'dotenv/config';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { supabase } from './supabase.js';
import { ingestMarkdown, ingestDocument, syncBusinessData } from './knowledge.js';
import { log } from './logger.js';

const PROJECT_ROOT = resolve(import.meta.dirname, '..', '..', '..');

async function main() {
  console.log('\n========================================');
  console.log('  SOPHIA - Ingestao de Conhecimento');
  console.log('========================================\n');

  // Get Sophia ID (fallback Athena pra retrocompat)
  let agentResult = await supabase
    .from('ia_agents')
    .select('id')
    .eq('nome', 'Sophia')
    .single();

  if (agentResult.error || !agentResult.data) {
    agentResult = await supabase
      .from('ia_agents')
      .select('id')
      .eq('nome', 'Athena')
      .single();
  }

  if (!agentResult.data) {
    console.error('Sophia/Athena not found in ia_agents. Run migration first.');
    process.exit(1);
  }

  const sophiaId = agentResult.data.id;
  let totalDocs = 0;

  // 1. Ingest METRICAS_NEGOCIO.md
  const metricasPath = resolve(PROJECT_ROOT, 'METRICAS_NEGOCIO.md');
  if (existsSync(metricasPath)) {
    console.log('Ingerindo METRICAS_NEGOCIO.md...');
    const content = readFileSync(metricasPath, 'utf-8');
    const count = await ingestMarkdown(content, 'metricas', 'METRICAS_NEGOCIO.md');
    console.log(`  -> ${count} secoes indexadas`);
    totalDocs += count;
  } else {
    console.log('METRICAS_NEGOCIO.md nao encontrado, pulando...');
  }

  // 2. Ingest REGRAS_NEGOCIO.md
  const regrasPath = resolve(PROJECT_ROOT, 'REGRAS_NEGOCIO.md');
  if (existsSync(regrasPath)) {
    console.log('Ingerindo REGRAS_NEGOCIO.md...');
    const content = readFileSync(regrasPath, 'utf-8');
    const count = await ingestMarkdown(content, 'regras', 'REGRAS_NEGOCIO.md');
    console.log(`  -> ${count} secoes indexadas`);
    totalDocs += count;
  } else {
    console.log('REGRAS_NEGOCIO.md nao encontrado, pulando...');
  }

  // 3. Ingest DOCUMENTATION.md
  const docsPath = resolve(PROJECT_ROOT, 'DOCUMENTATION.md');
  if (existsSync(docsPath)) {
    console.log('Ingerindo DOCUMENTATION.md...');
    const content = readFileSync(docsPath, 'utf-8');
    const count = await ingestMarkdown(content, 'sistema', 'DOCUMENTATION.md');
    console.log(`  -> ${count} secoes indexadas`);
    totalDocs += count;
  } else {
    console.log('DOCUMENTATION.md nao encontrado, pulando...');
  }

  // 4. Ingest RELEASE_PLAN.md
  const releasePath = resolve(PROJECT_ROOT, 'RELEASE_PLAN.md');
  if (existsSync(releasePath)) {
    console.log('Ingerindo RELEASE_PLAN.md...');
    const content = readFileSync(releasePath, 'utf-8');
    const count = await ingestMarkdown(content, 'release', 'RELEASE_PLAN.md');
    console.log(`  -> ${count} secoes indexadas`);
    totalDocs += count;
  } else {
    console.log('RELEASE_PLAN.md nao encontrado, pulando...');
  }

  // 5. Sync business tables from Supabase
  console.log('Sincronizando dados das tabelas Supabase...');
  const syncCount = await syncBusinessData(sophiaId);
  console.log(`  -> ${syncCount} registros indexados`);
  totalDocs += syncCount;

  // 6. Log completion
  await log(sophiaId, 'info', `Ingestao concluida: ${totalDocs} documentos total`, {
    total: totalDocs,
  });

  console.log(`\nTotal: ${totalDocs} documentos ingeridos na knowledge base.`);
  console.log('Done!');
}

main().catch(err => {
  console.error('Ingest error:', err);
  process.exit(1);
});
