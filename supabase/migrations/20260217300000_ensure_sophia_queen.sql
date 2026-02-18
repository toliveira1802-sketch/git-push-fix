-- =============================================
-- ENSURE SOPHIA (RAINHA) EXISTS
-- Roda SAFE - pode rodar varias vezes sem problema
-- =============================================

-- 1. Garante que a tabela ia_agents existe
CREATE TABLE IF NOT EXISTS ia_agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(20) DEFAULT 'escravo' CHECK (tipo IN ('lider', 'rainha', 'princesa', 'escravo', 'bot_local')),
  status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'erro', 'pausado')),
  llm_provider VARCHAR(20) DEFAULT 'ollama' CHECK (llm_provider IN ('ollama', 'kimi', 'claude', 'local')),
  modelo VARCHAR(50) DEFAULT 'llama3.1:8b',
  temperatura NUMERIC(3,2) DEFAULT 0.7,
  prompt_sistema TEXT DEFAULT '',
  tarefas_ativas INT DEFAULT 0,
  ultimo_ping TIMESTAMP WITH TIME ZONE,
  config_json JSONB DEFAULT '{}',
  pai_id UUID REFERENCES ia_agents(id),
  avatar_url TEXT,
  descricao TEXT,
  canais TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Garante que a tabela ia_logs existe
CREATE TABLE IF NOT EXISTS ia_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES ia_agents(id),
  tipo VARCHAR(20) DEFAULT 'info' CHECK (tipo IN ('info', 'warn', 'error', 'action', 'message')),
  mensagem TEXT NOT NULL,
  metadata_json JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Garante que a tabela ia_tasks existe
CREATE TABLE IF NOT EXISTS ia_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES ia_agents(id),
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  tipo VARCHAR(50) DEFAULT 'comando',
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'rodando', 'concluida', 'erro', 'cancelada')),
  prioridade INT DEFAULT 5,
  cron_expression VARCHAR(50),
  input_json JSONB DEFAULT '{}',
  resultado_json JSONB DEFAULT '{}',
  criado_por VARCHAR(100) DEFAULT 'sistema',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 4. Garante que ia_knowledge_base existe
CREATE TABLE IF NOT EXISTS ia_knowledge_base (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  categoria VARCHAR(50) NOT NULL,
  subcategoria VARCHAR(100),
  titulo VARCHAR(255) NOT NULL,
  conteudo TEXT NOT NULL,
  metadata_json JSONB DEFAULT '{}',
  embedding_id VARCHAR(255),
  fonte VARCHAR(100),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Garante que ia_mae_decisoes existe
CREATE TABLE IF NOT EXISTS ia_mae_decisoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo_decisao VARCHAR(50),
  contexto TEXT,
  decisao TEXT NOT NULL,
  resultado TEXT,
  agente_afetado UUID REFERENCES ia_agents(id),
  aprovado_por VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'executado', 'rejeitado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Indices (IF NOT EXISTS nao funciona em todos os PG, uso DO block)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_agents_nome') THEN
    CREATE INDEX idx_agents_nome ON ia_agents(nome);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_agents_tipo') THEN
    CREATE INDEX idx_agents_tipo ON ia_agents(tipo);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_agents_pai') THEN
    CREATE INDEX idx_agents_pai ON ia_agents(pai_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_logs_agent') THEN
    CREATE INDEX idx_logs_agent ON ia_logs(agent_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_logs_tipo') THEN
    CREATE INDEX idx_logs_tipo ON ia_logs(tipo);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tasks_agent') THEN
    CREATE INDEX idx_tasks_agent ON ia_tasks(agent_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tasks_status') THEN
    CREATE INDEX idx_tasks_status ON ia_tasks(status);
  END IF;
END $$;

-- 7. RLS (idempotent)
ALTER TABLE ia_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ia_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ia_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ia_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE ia_mae_decisoes ENABLE ROW LEVEL SECURITY;

-- Policies (DROP IF EXISTS + CREATE)
DROP POLICY IF EXISTS "agents_all" ON ia_agents;
CREATE POLICY "agents_all" ON ia_agents FOR ALL USING (true);

DROP POLICY IF EXISTS "logs_all" ON ia_logs;
CREATE POLICY "logs_all" ON ia_logs FOR ALL USING (true);

DROP POLICY IF EXISTS "tasks_all" ON ia_tasks;
CREATE POLICY "tasks_all" ON ia_tasks FOR ALL USING (true);

DROP POLICY IF EXISTS "kb_all" ON ia_knowledge_base;
CREATE POLICY "kb_all" ON ia_knowledge_base FOR ALL USING (true);

DROP POLICY IF EXISTS "decisoes_all" ON ia_mae_decisoes;
CREATE POLICY "decisoes_all" ON ia_mae_decisoes FOR ALL USING (true);

-- 8. Realtime (safe - ignora se ja existe)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE ia_agents;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE ia_logs;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE ia_tasks;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE ia_mae_decisoes;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================
-- 9. SOPHIA - A RAINHA
-- Se "Sophia" ja existe, atualiza pra config de Rainha
-- Se nao existe, cria
-- Se "Athena" existe, renomeia pra Sophia
-- =============================================

-- Primeiro: se existe Athena mas nao Sophia, renomeia
UPDATE ia_agents
SET nome = 'Sophia',
    tipo = 'rainha',
    llm_provider = 'ollama',
    modelo = 'llama3.1:8b',
    descricao = 'IA Rainha - Cerebro central da Doctor Auto. Cria e gerencia princesas.',
    canais = ARRAY['sistema', 'command-center'],
    config_json = jsonb_build_object(
      'is_mother', true,
      'can_create_agents', true,
      'can_delete_agents', true,
      'can_adjust_prompts', true,
      'knowledge_base', 'chromadb',
      'decision_mode', 'semi-auto',
      'max_children', 20,
      'budget_mensal_llm', 200
    )
WHERE nome = 'Athena'
  AND NOT EXISTS (SELECT 1 FROM ia_agents WHERE nome = 'Sophia');

-- Segundo: se Sophia ja existe, garante que tem config de Rainha
UPDATE ia_agents
SET tipo = 'rainha',
    descricao = COALESCE(NULLIF(descricao, ''), 'IA Rainha - Cerebro central da Doctor Auto. Cria e gerencia princesas.'),
    config_json = config_json || jsonb_build_object(
      'is_mother', true,
      'can_create_agents', true,
      'can_delete_agents', true,
      'can_adjust_prompts', true,
      'decision_mode', COALESCE(config_json->>'decision_mode', 'semi-auto')
    )
WHERE nome = 'Sophia';

-- Terceiro: se nenhuma existe, cria do zero
INSERT INTO ia_agents (nome, tipo, status, llm_provider, modelo, descricao, canais, config_json)
SELECT
  'Sophia',
  'rainha',
  'offline',
  'ollama',
  'llama3.1:8b',
  'IA Rainha - Cerebro central da Doctor Auto. Cria e gerencia princesas.',
  ARRAY['sistema', 'command-center'],
  '{
    "is_mother": true,
    "can_create_agents": true,
    "can_delete_agents": true,
    "can_adjust_prompts": true,
    "knowledge_base": "chromadb",
    "decision_mode": "semi-auto",
    "max_children": 20,
    "budget_mensal_llm": 200
  }'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM ia_agents WHERE nome = 'Sophia');

-- =============================================
-- 10. LOG DE CONFIRMACAO
-- =============================================
DO $$
DECLARE
  sophia_id UUID;
BEGIN
  SELECT id INTO sophia_id FROM ia_agents WHERE nome = 'Sophia';
  IF sophia_id IS NOT NULL THEN
    INSERT INTO ia_logs (agent_id, tipo, mensagem, metadata_json)
    VALUES (sophia_id, 'info', 'Sophia (Rainha) configurada com sucesso via migration', '{"source": "migration"}');
    RAISE NOTICE 'Sophia ID: %', sophia_id;
  END IF;
END $$;
