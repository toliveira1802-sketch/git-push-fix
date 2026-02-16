-- =============================================
-- COMMAND CENTER - Tabelas de IAs
-- FASE 3 - Blueprint v1.0
-- =============================================

-- Tabela principal das IAs
CREATE TABLE ia_agents (
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
CREATE TABLE ia_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES ia_agents(id) ON DELETE CASCADE,
  tipo VARCHAR(20) CHECK (tipo IN ('info', 'warn', 'error', 'action', 'message')),
  mensagem TEXT NOT NULL,
  metadata_json JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tarefas das IAs
CREATE TABLE ia_tasks (
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

-- Indices para performance
CREATE INDEX idx_ia_agents_tipo ON ia_agents(tipo);
CREATE INDEX idx_ia_agents_status ON ia_agents(status);
CREATE INDEX idx_ia_agents_pai_id ON ia_agents(pai_id);
CREATE INDEX idx_ia_logs_agent_id ON ia_logs(agent_id);
CREATE INDEX idx_ia_logs_created_at ON ia_logs(created_at DESC);
CREATE INDEX idx_ia_tasks_agent_id ON ia_tasks(agent_id);
CREATE INDEX idx_ia_tasks_status ON ia_tasks(status);

-- Habilitar RLS
ALTER TABLE ia_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ia_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ia_tasks ENABLE ROW LEVEL SECURITY;

-- Policies (admin/gestao/dev podem tudo)
CREATE POLICY "ia_agents_all" ON ia_agents FOR ALL USING (true);
CREATE POLICY "ia_logs_all" ON ia_logs FOR ALL USING (true);
CREATE POLICY "ia_tasks_all" ON ia_tasks FOR ALL USING (true);

-- Trigger para updated_at automatico
CREATE OR REPLACE FUNCTION update_ia_agents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ia_agents_updated_at
  BEFORE UPDATE ON ia_agents
  FOR EACH ROW
  EXECUTE FUNCTION update_ia_agents_updated_at();

-- Habilitar Realtime para logs e tasks
ALTER PUBLICATION supabase_realtime ADD TABLE ia_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE ia_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE ia_agents;
