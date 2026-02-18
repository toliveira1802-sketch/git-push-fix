-- =============================================
-- DOCTOR AUTO - SQL COMPLETO (UNICO)
-- Rodar no Supabase SQL Editor uma vez
-- =============================================
-- Combina todas as migrations:
--   1. Tabelas de IAs (agents, logs, tasks)
--   2. Seed dos 19 agentes
--   3. Knowledge Base + Decisoes (Sophia/IA Mae)
--   4. Funcoes Bot SQL (readonly query + schema)
-- =============================================

-- =============================================
-- PARTE 1: TABELAS PRINCIPAIS
-- =============================================

-- Tabela principal das IAs
CREATE TABLE IF NOT EXISTS ia_agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('lider', 'escravo', 'bot_local')),
  status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'erro', 'pausado')),
  llm_provider VARCHAR(50) NOT NULL CHECK (llm_provider IN ('ollama', 'kimi', 'claude', 'local')),
  modelo VARCHAR(100),
  temperatura DECIMAL(3,2) DEFAULT 0.7,
  prompt_sistema TEXT,
  tarefas_ativas INTEGER DEFAULT 0,
  ultimo_ping TIMESTAMP WITH TIME ZONE,
  config_json JSONB DEFAULT '{}',
  pai_id UUID REFERENCES ia_agents(id),
  avatar_url VARCHAR(500),
  descricao TEXT,
  canais TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logs das IAs
CREATE TABLE IF NOT EXISTS ia_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES ia_agents(id) ON DELETE CASCADE,
  tipo VARCHAR(20) CHECK (tipo IN ('info', 'warn', 'error', 'action', 'message')),
  mensagem TEXT NOT NULL,
  metadata_json JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tarefas das IAs
CREATE TABLE IF NOT EXISTS ia_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES ia_agents(id),
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'rodando', 'concluida', 'erro', 'cancelada')),
  prioridade INTEGER DEFAULT 5 CHECK (prioridade BETWEEN 1 AND 10),
  cron_expression VARCHAR(100),
  input_json JSONB DEFAULT '{}',
  resultado_json JSONB DEFAULT '{}',
  criado_por VARCHAR(100) DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Base de conhecimento (RAG + Connections do Command Center)
CREATE TABLE IF NOT EXISTS ia_knowledge_base (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  categoria VARCHAR(50) NOT NULL,
  subcategoria VARCHAR(100),
  titulo VARCHAR(255) NOT NULL,
  conteudo TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  metadata_json JSONB DEFAULT '{}',
  embedding_id VARCHAR(255),
  fonte VARCHAR(100),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Historico de decisoes da Sophia (IA Mae)
CREATE TABLE IF NOT EXISTS ia_mae_decisoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo_decisao VARCHAR(50) CHECK (tipo_decisao IN ('criar_agente', 'ajustar_agente', 'pausar_agente', 'eliminar_agente', 'executar_task', 'analise')),
  contexto TEXT,
  decisao TEXT NOT NULL,
  resultado TEXT,
  agente_afetado UUID REFERENCES ia_agents(id),
  aprovado_por VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'executado', 'rejeitado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PARTE 1.5: COLUNAS FALTANTES (tabelas ja existentes)
-- =============================================

-- Adiciona 'tags' na ia_knowledge_base se nao existir
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ia_knowledge_base' AND column_name = 'tags'
  ) THEN
    ALTER TABLE ia_knowledge_base ADD COLUMN tags TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- =============================================
-- PARTE 2: INDICES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_ia_agents_tipo ON ia_agents(tipo);
CREATE INDEX IF NOT EXISTS idx_ia_agents_status ON ia_agents(status);
CREATE INDEX IF NOT EXISTS idx_ia_agents_pai_id ON ia_agents(pai_id);
CREATE INDEX IF NOT EXISTS idx_ia_logs_agent_id ON ia_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_ia_logs_created_at ON ia_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ia_tasks_agent_id ON ia_tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_ia_tasks_status ON ia_tasks(status);
CREATE INDEX IF NOT EXISTS idx_kb_categoria ON ia_knowledge_base(categoria);
CREATE INDEX IF NOT EXISTS idx_kb_subcategoria ON ia_knowledge_base(subcategoria);
CREATE INDEX IF NOT EXISTS idx_kb_fonte ON ia_knowledge_base(fonte);
CREATE INDEX IF NOT EXISTS idx_kb_tags ON ia_knowledge_base USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_decisoes_tipo ON ia_mae_decisoes(tipo_decisao);
CREATE INDEX IF NOT EXISTS idx_decisoes_status ON ia_mae_decisoes(status);
CREATE INDEX IF NOT EXISTS idx_decisoes_agente ON ia_mae_decisoes(agente_afetado);

-- =============================================
-- PARTE 3: RLS (Row Level Security)
-- =============================================

ALTER TABLE ia_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ia_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ia_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ia_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE ia_mae_decisoes ENABLE ROW LEVEL SECURITY;

-- Policies abertas (admin/gestao/dev podem tudo)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'ia_agents_all') THEN
    CREATE POLICY "ia_agents_all" ON ia_agents FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'ia_logs_all') THEN
    CREATE POLICY "ia_logs_all" ON ia_logs FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'ia_tasks_all') THEN
    CREATE POLICY "ia_tasks_all" ON ia_tasks FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'kb_all') THEN
    CREATE POLICY "kb_all" ON ia_knowledge_base FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'decisoes_all') THEN
    CREATE POLICY "decisoes_all" ON ia_mae_decisoes FOR ALL USING (true);
  END IF;
END $$;

-- =============================================
-- PARTE 4: TRIGGER updated_at
-- =============================================

CREATE OR REPLACE FUNCTION update_ia_agents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ia_agents_updated_at ON ia_agents;
CREATE TRIGGER trigger_ia_agents_updated_at
  BEFORE UPDATE ON ia_agents
  FOR EACH ROW
  EXECUTE FUNCTION update_ia_agents_updated_at();

-- =============================================
-- PARTE 5: REALTIME
-- =============================================

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE ia_agents;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE ia_logs;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE ia_tasks;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE ia_mae_decisoes;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE ia_knowledge_base;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================
-- PARTE 6: SEED - 19 AGENTES IA
-- =============================================

-- Limpa agentes existentes pra evitar duplicata
DELETE FROM ia_agents WHERE nome IN (
  'Sophia', 'Athena', 'Thales', 'Simone', 'Anna Laura',
  'Bot Monitor', 'Bot Auditor', 'Bot Relatorios', 'Bot Pesquisa',
  'Avaliador Leads', 'Follow-up Bot', 'Upsell Bot',
  'Avaliador Pesquisa', 'Bot Lotacao', 'Chica da Silva', 'Reativador',
  'Ollama Engine', 'OpenClaw Interface', 'RAG Retriever', 'Claude Analyst'
);

-- SOPHIA (IA Mae - Rainha)
INSERT INTO ia_agents (nome, tipo, status, llm_provider, modelo, descricao, canais, config_json) VALUES
('Sophia', 'lider', 'online', 'ollama', 'llama3.1:8b',
 'IA Mae - Rainha da Doctor Auto. Cerebro central. Coordena todas as princesas e bots. Pesquisa e Estrategia.',
 ARRAY['whatsapp', 'sistema', 'command-center'],
 '{
   "is_mother": true,
   "can_create_agents": true,
   "can_delete_agents": true,
   "can_adjust_prompts": true,
   "knowledge_base": "chromadb",
   "decision_mode": "semi-auto",
   "max_children": 20,
   "budget_mensal_llm": 200,
   "fallback_provider": "claude",
   "fallback_model": "haiku"
 }');

-- LIDERES (Princesas)
INSERT INTO ia_agents (nome, tipo, status, llm_provider, modelo, descricao, canais) VALUES
('Thales', 'lider', 'online', 'ollama', 'llama3.1:8b', 'Controlador Central - Recebe comandos e delega', ARRAY['sistema']),
('Simone', 'lider', 'online', 'ollama', 'mistral:7b', 'Coordenadora ERP/CRM - Processos e RAG', ARRAY['telegram', 'kommo']),
('Anna Laura', 'lider', 'online', 'kimi', 'kimi-2.5', 'Especialista Vendas++ - Kommo CRM', ARRAY['whatsapp', 'kommo']);

-- ESCRAVOS do Thales (2)
INSERT INTO ia_agents (nome, tipo, status, llm_provider, modelo, descricao, pai_id) VALUES
('Bot Monitor', 'escravo', 'online', 'ollama', 'llama3.1:8b', 'Monitora sistema e alerta erros', (SELECT id FROM ia_agents WHERE nome='Thales')),
('Bot Auditor', 'escravo', 'online', 'ollama', 'mistral:7b', 'Audita acoes das IAs', (SELECT id FROM ia_agents WHERE nome='Thales'));

-- ESCRAVOS da Sophia (2) - Relatorios e Pesquisa agora sao da Sophia
INSERT INTO ia_agents (nome, tipo, status, llm_provider, modelo, descricao, pai_id) VALUES
('Bot Relatorios', 'escravo', 'online', 'ollama', 'llama3.1:8b', 'Gera relatorios automaticos', (SELECT id FROM ia_agents WHERE nome='Sophia')),
('Bot Pesquisa', 'escravo', 'online', 'ollama', 'mistral:7b', 'Pesquisa e analise de dados', (SELECT id FROM ia_agents WHERE nome='Sophia'));

-- ESCRAVOS da Simone (3)
INSERT INTO ia_agents (nome, tipo, status, llm_provider, modelo, descricao, pai_id) VALUES
('Avaliador Leads', 'escravo', 'online', 'ollama', 'llama3.1:8b', 'Classifica leads quentes/mornos/frios', (SELECT id FROM ia_agents WHERE nome='Simone')),
('Follow-up Bot', 'escravo', 'online', 'local', 'cron-job', 'Gerencia follow-ups automaticos', (SELECT id FROM ia_agents WHERE nome='Simone')),
('Upsell Bot', 'escravo', 'online', 'ollama', 'mistral:7b', 'Identifica oportunidades de upsell', (SELECT id FROM ia_agents WHERE nome='Simone'));

-- ESCRAVOS da Anna Laura (4)
INSERT INTO ia_agents (nome, tipo, status, llm_provider, modelo, descricao, pai_id) VALUES
('Avaliador Pesquisa', 'escravo', 'online', 'ollama', 'llama3.1:8b', 'Pesquisa precos e fornecedores', (SELECT id FROM ia_agents WHERE nome='Anna Laura')),
('Bot Lotacao', 'escravo', 'online', 'local', 'cron-job', 'Monitora estoque e lotacao', (SELECT id FROM ia_agents WHERE nome='Anna Laura')),
('Chica da Silva', 'escravo', 'online', 'ollama', 'llama3.1:8b', 'Mapeadora de leads no Kommo', (SELECT id FROM ia_agents WHERE nome='Anna Laura')),
('Reativador', 'escravo', 'offline', 'kimi', 'kimi-2.5', 'Reativacao de clientes inativos', (SELECT id FROM ia_agents WHERE nome='Anna Laura'));

-- TURMA RAG (4)
INSERT INTO ia_agents (nome, tipo, status, llm_provider, modelo, descricao) VALUES
('Ollama Engine', 'bot_local', 'online', 'ollama', 'llama3.1:8b', 'Motor LLM local na VPS'),
('OpenClaw Interface', 'bot_local', 'online', 'local', 'openclaw', 'Interface multi-agent'),
('RAG Retriever', 'bot_local', 'online', 'local', 'chromadb', 'Retrieval - Conhecimento permanente'),
('Claude Analyst', 'bot_local', 'online', 'claude', 'haiku', 'IA Analista para tarefas complexas');

-- =============================================
-- PARTE 7: FUNCOES BOT SQL (Read-Only)
-- =============================================

-- Funcao pra executar SELECT (somente leitura)
CREATE OR REPLACE FUNCTION execute_readonly_query(query_text TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Bloqueia qualquer coisa que nao seja SELECT
  IF query_text ~* '^\s*(INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|CREATE|GRANT|REVOKE|EXEC)' THEN
    RAISE EXCEPTION 'Apenas queries SELECT sao permitidas';
  END IF;

  -- Executa e retorna como JSONB
  EXECUTE 'SELECT jsonb_agg(row_to_json(t)) FROM (' || query_text || ') t'
  INTO result;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- Funcao pra listar schema do banco (tabelas + colunas)
CREATE OR REPLACE FUNCTION get_schema_info()
RETURNS TABLE(table_name TEXT, column_name TEXT, data_type TEXT, is_nullable TEXT)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    c.table_name::TEXT,
    c.column_name::TEXT,
    c.data_type::TEXT,
    c.is_nullable::TEXT
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
  ORDER BY c.table_name, c.ordinal_position;
$$;

-- Permissoes: so service_role pode executar
REVOKE ALL ON FUNCTION execute_readonly_query(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION execute_readonly_query(TEXT) TO service_role;

REVOKE ALL ON FUNCTION get_schema_info() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_schema_info() TO service_role;

-- =============================================
-- PRONTO! Resultado esperado:
-- =============================================
-- Tabelas: ia_agents, ia_logs, ia_tasks, ia_knowledge_base, ia_mae_decisoes
-- Agentes: 19 (Sophia + 3 lideres + 11 escravos + 4 bots)
-- Funcoes: execute_readonly_query, get_schema_info
-- Realtime: Habilitado em todas as tabelas
-- RLS: Habilitado (policy aberta pra agora)
-- =============================================

-- Verificacao final:
SELECT nome, tipo, status, llm_provider, modelo FROM ia_agents ORDER BY tipo, nome;
