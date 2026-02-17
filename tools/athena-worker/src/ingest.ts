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
  console.log('  ATHENA - Ingestao de Conhecimento');
  console.log('========================================\n');

  // Get Athena ID
  const { data: athena } = await supabase
    .from('ia_agents')
    .select('id')
    .eq('nome', 'Athena')
    .single();

  if (!athena) {
    console.error('Athena not found in ia_agents. Run migration first.');
    process.exit(1);
  }

  const athenaId = athena.id;
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

  // 4. Sync business tables from Supabase
  console.log('Sincronizando dados das tabelas Supabase...');
  const syncCount = await syncBusinessData(athenaId);
  console.log(`  -> ${syncCount} registros indexados`);
  totalDocs += syncCount;

  // 5. Log completion
  await log(athenaId, 'info', `Ingestao concluida: ${totalDocs} documentos total`, {
    metricas: existsSync(metricasPath),
    regras: existsSync(regrasPath),
    sync: syncCount,
    total: totalDocs,
  });

  console.log(`\nTotal: ${totalDocs} documentos ingeridos na knowledge base.`);
  console.log('Done!');
}

main().catch(err => {
  console.error('Ingest error:', err);
  process.exit(1);
});
