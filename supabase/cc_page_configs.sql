-- =============================================
-- COMMAND CENTER - Tabela de configs por pagina
-- Cada pagina/rota pode ter suas anotacoes,
-- KPIs, status, prioridade, tags, etc.
-- =============================================

CREATE TABLE IF NOT EXISTS cc_page_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Identificador da rota (ex: 'route-1', 'route-42')
  route_id VARCHAR(100) NOT NULL UNIQUE,

  -- Dados da rota (override do hardcoded)
  path VARCHAR(255),
  component VARCHAR(150),
  file_name VARCHAR(255),
  description TEXT,
  status VARCHAR(30) DEFAULT 'active',
  category VARCHAR(30),
  requires_auth BOOLEAN DEFAULT true,
  roles TEXT[] DEFAULT '{}',

  -- Posicao visual no mapa (drag & drop)
  pos_x NUMERIC DEFAULT 0,
  pos_y NUMERIC DEFAULT 0,

  -- Anotacoes do Thales
  notes TEXT DEFAULT '',
  priority VARCHAR(20) DEFAULT 'nenhuma' CHECK (priority IN ('alta', 'media', 'baixa', 'nenhuma')),
  tags TEXT[] DEFAULT '{}',

  -- KPIs (array JSON)
  kpis JSONB DEFAULT '[]',

  -- Conexoes desta pagina (IDs das rotas conectadas)
  connections TEXT[] DEFAULT '{}',

  -- Meta
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_cc_pages_route_id ON cc_page_configs(route_id);
CREATE INDEX IF NOT EXISTS idx_cc_pages_category ON cc_page_configs(category);
CREATE INDEX IF NOT EXISTS idx_cc_pages_status ON cc_page_configs(status);
CREATE INDEX IF NOT EXISTS idx_cc_pages_priority ON cc_page_configs(priority);
CREATE INDEX IF NOT EXISTS idx_cc_pages_tags ON cc_page_configs USING GIN(tags);

-- RLS
ALTER TABLE cc_page_configs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'cc_pages_all') THEN
    CREATE POLICY "cc_pages_all" ON cc_page_configs FOR ALL USING (true);
  END IF;
END $$;

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_cc_page_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cc_page_configs_updated_at ON cc_page_configs;
CREATE TRIGGER trigger_cc_page_configs_updated_at
  BEFORE UPDATE ON cc_page_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_cc_page_configs_updated_at();

-- Realtime
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE cc_page_configs;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Verificacao
SELECT 'cc_page_configs criada com sucesso!' AS resultado;
