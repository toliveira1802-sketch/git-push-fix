/**
 * BOT SQL - Query Engine em Linguagem Natural
 * Recebe pergunta em portugues -> converte pra SQL -> executa no Supabase -> retorna formatado
 *
 * Roda como servico HTTP na porta 3001
 * Usa Ollama local (custo zero) pra gerar SQL
 */

import 'dotenv/config';
import http from 'http';
import { supabase } from './supabase.js';
import { log } from './logger.js';
import { ollamaChat } from './ollama.js';

const PORT = Number(process.env.BOT_SQL_PORT) || 3001;

// Schema cache - carrega uma vez, usa sempre
let schemaCache: string | null = null;

/**
 * Busca o schema do banco (tabelas + colunas) pra dar contexto pro LLM
 */
async function getSchema(): Promise<string> {
  if (schemaCache) return schemaCache;

  const { data, error } = await supabase.rpc('get_schema_info').select();

  if (error || !data) {
    // Fallback: query information_schema direto
    const { data: tables } = await supabase
      .from('information_schema.columns' as any)
      .select('table_name,column_name,data_type,is_nullable')
      .eq('table_schema', 'public')
      .order('table_name')
      .order('ordinal_position');

    if (tables && tables.length > 0) {
      const grouped: Record<string, string[]> = {};
      for (const col of tables as any[]) {
        if (!grouped[col.table_name]) grouped[col.table_name] = [];
        grouped[col.table_name].push(`  ${col.column_name} (${col.data_type}${col.is_nullable === 'NO' ? ', NOT NULL' : ''})`);
      }
      schemaCache = Object.entries(grouped)
        .map(([table, cols]) => `${table}:\n${cols.join('\n')}`)
        .join('\n\n');
    } else {
      schemaCache = 'Schema nao disponivel. Gere SQL generico.';
    }
  } else {
    schemaCache = JSON.stringify(data, null, 2);
  }

  return schemaCache!;
}

/**
 * Converte pergunta em SQL usando Ollama
 */
async function questionToSQL(question: string): Promise<string> {
  const schema = await getSchema();

  const prompt = `Voce e um assistente SQL para PostgreSQL (Supabase).
Dado o schema abaixo, converta a pergunta do usuario em uma query SQL.

REGRAS:
- Retorne APENAS o SQL, sem explicacao, sem markdown, sem \`\`\`
- Use apenas SELECT (nunca INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE)
- Limite a 100 resultados (LIMIT 100) a menos que o usuario peca diferente
- Use nomes de tabela e coluna exatamente como no schema
- Para datas, use timezone 'America/Sao_Paulo'
- Para buscas de texto, use ILIKE
- Se nao souber a tabela, retorne: SELECT 'Tabela nao encontrada' as erro

SCHEMA DO BANCO:
${schema}

PERGUNTA DO USUARIO:
${question}

SQL:`;

  const response = await ollamaChat(prompt, 'llama3.1:8b');

  // Limpa resposta - remove markdown, espacos extras
  let sql = response
    .replace(/```sql\n?/gi, '')
    .replace(/```\n?/g, '')
    .replace(/^SQL:\s*/i, '')
    .trim();

  // Seguranca: bloqueia qualquer coisa que nao seja SELECT
  const forbidden = /\b(INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|CREATE|GRANT|REVOKE|EXEC)\b/i;
  if (forbidden.test(sql)) {
    throw new Error('BLOQUEADO: Apenas queries SELECT sao permitidas.');
  }

  // Adiciona LIMIT se nao tem
  if (!/\bLIMIT\b/i.test(sql)) {
    sql = sql.replace(/;?\s*$/, ' LIMIT 100;');
  }

  return sql;
}

/**
 * Executa SQL no Supabase via RPC ou query direta
 */
async function executeSQL(sql: string): Promise<{ data: any[]; rowCount: number }> {
  // Usa supabase.rpc pra executar SQL raw
  const { data, error } = await supabase.rpc('execute_readonly_query', {
    query_text: sql,
  });

  if (error) {
    // Tenta query direta se RPC nao existe
    throw new Error(`Erro SQL: ${error.message}`);
  }

  const rows = Array.isArray(data) ? data : [];
  return { data: rows, rowCount: rows.length };
}

/**
 * Formata resultado pra exibicao
 */
function formatResult(data: any[], rowCount: number, sql: string): string {
  if (rowCount === 0) return 'Nenhum resultado encontrado.';

  // Pega colunas do primeiro resultado
  const columns = Object.keys(data[0]);

  // Header
  let output = columns.join(' | ') + '\n';
  output += columns.map(c => '-'.repeat(c.length)).join(' | ') + '\n';

  // Rows
  for (const row of data) {
    output += columns.map(c => {
      const val = row[c];
      if (val === null) return 'NULL';
      if (typeof val === 'object') return JSON.stringify(val);
      return String(val);
    }).join(' | ') + '\n';
  }

  output += `\n${rowCount} registro(s) encontrado(s)`;
  return output;
}

/**
 * Handler HTTP
 */
async function handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok', service: 'bot-sql' }));
    return;
  }

  // Schema endpoint
  if (req.method === 'GET' && req.url === '/schema') {
    try {
      const schema = await getSchema();
      res.writeHead(200);
      res.end(JSON.stringify({ schema }));
    } catch (err: any) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // Main query endpoint
  if (req.method === 'POST' && req.url === '/query') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { question, raw_sql } = JSON.parse(body);

        if (!question && !raw_sql) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Envie "question" ou "raw_sql"' }));
          return;
        }

        let sql: string;

        if (raw_sql) {
          // SQL direto (modo avancado)
          sql = raw_sql;
          const forbidden = /\b(INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|CREATE|GRANT|REVOKE|EXEC)\b/i;
          if (forbidden.test(sql)) {
            res.writeHead(403);
            res.end(JSON.stringify({ error: 'Apenas SELECT permitido.' }));
            return;
          }
        } else {
          // Linguagem natural -> SQL via Ollama
          sql = await questionToSQL(question);
        }

        // Executa
        const result = await executeSQL(sql);
        const formatted = formatResult(result.data, result.rowCount, sql);

        // Log
        await log('bot-sql', 'info', `Query: "${question || raw_sql}" -> ${result.rowCount} rows`, {
          sql,
          rowCount: result.rowCount,
        }).catch(() => {});

        res.writeHead(200);
        res.end(JSON.stringify({
          question: question || null,
          sql,
          data: result.data,
          rowCount: result.rowCount,
          formatted,
        }));

      } catch (err: any) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Refresh schema cache
  if (req.method === 'POST' && req.url === '/refresh-schema') {
    schemaCache = null;
    await getSchema();
    res.writeHead(200);
    res.end(JSON.stringify({ message: 'Schema cache atualizado' }));
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
}

// Start server
const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log('\n========================================');
  console.log('  BOT SQL - Doctor Auto');
  console.log('========================================');
  console.log(`  Porta: ${PORT}`);
  console.log(`  POST /query     { "question": "..." }`);
  console.log(`  POST /query     { "raw_sql": "SELECT ..." }`);
  console.log(`  GET  /schema    (ver tabelas)`);
  console.log(`  GET  /health    (status)`);
  console.log('========================================\n');
});
