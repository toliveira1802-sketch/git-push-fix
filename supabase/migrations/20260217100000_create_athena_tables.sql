-- =============================================
-- IA RAINHA (SOPHIA) - Tabelas adicionais
-- FASE A - Blueprint IA Mae v2.0
-- Nota: Athena foi substituida por Sophia (rainha)
-- =============================================

-- Base de conhecimento da IA Mae
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

-- Historico de decisoes da Sophia
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

-- Indices (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_kb_categoria') THEN
    CREATE INDEX idx_kb_categoria ON ia_knowledge_base(categoria);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_kb_subcategoria') THEN
    CREATE INDEX idx_kb_subcategoria ON ia_knowledge_base(subcategoria);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_kb_fonte') THEN
    CREATE INDEX idx_kb_fonte ON ia_knowledge_base(fonte);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_decisoes_tipo') THEN
    CREATE INDEX idx_decisoes_tipo ON ia_mae_decisoes(tipo_decisao);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_decisoes_status') THEN
    CREATE INDEX idx_decisoes_status ON ia_mae_decisoes(status);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_decisoes_agente') THEN
    CREATE INDEX idx_decisoes_agente ON ia_mae_decisoes(agente_afetado);
  END IF;
END $$;

-- RLS
ALTER TABLE ia_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE ia_mae_decisoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kb_all" ON ia_knowledge_base;
CREATE POLICY "kb_all" ON ia_knowledge_base FOR ALL USING (true);

DROP POLICY IF EXISTS "decisoes_all" ON ia_mae_decisoes;
CREATE POLICY "decisoes_all" ON ia_mae_decisoes FOR ALL USING (true);

-- Realtime
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE ia_mae_decisoes;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- NOTA: Sophia (rainha) e criada pela migration 20260217300000_ensure_sophia_queen.sql
-- Athena nao e mais usada. Se existir, sera renomeada pra Sophia automaticamente.
