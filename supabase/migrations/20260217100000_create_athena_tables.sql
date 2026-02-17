-- =============================================
-- IA MAE (ATHENA) - Tabelas adicionais
-- FASE A - Blueprint IA Mae v1.0
-- =============================================

-- Base de conhecimento da IA Mae
CREATE TABLE ia_knowledge_base (
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

-- Historico de decisoes da Athena
CREATE TABLE ia_mae_decisoes (
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

-- Indices
CREATE INDEX idx_kb_categoria ON ia_knowledge_base(categoria);
CREATE INDEX idx_kb_subcategoria ON ia_knowledge_base(subcategoria);
CREATE INDEX idx_kb_fonte ON ia_knowledge_base(fonte);
CREATE INDEX idx_decisoes_tipo ON ia_mae_decisoes(tipo_decisao);
CREATE INDEX idx_decisoes_status ON ia_mae_decisoes(status);
CREATE INDEX idx_decisoes_agente ON ia_mae_decisoes(agente_afetado);

-- RLS
ALTER TABLE ia_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE ia_mae_decisoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kb_all" ON ia_knowledge_base FOR ALL USING (true);
CREATE POLICY "decisoes_all" ON ia_mae_decisoes FOR ALL USING (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE ia_mae_decisoes;

-- Seed: A IA Mae (Athena)
INSERT INTO ia_agents (nome, tipo, status, llm_provider, modelo, descricao, canais, config_json) VALUES
('Athena', 'lider', 'offline', 'claude', 'sonnet',
 'IA Mae - Cerebro central da Doctor Auto. Conhece tudo da empresa. Cria e gerencia agentes autonomamente.',
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
 }'
);
