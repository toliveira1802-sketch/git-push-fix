-- ============================================
-- MIGRAÇÃO: Dividir clientes em 3 tabelas
-- ============================================

-- 1. Criar tabela clientes_crm (dados de relacionamento)
CREATE TABLE public.clientes_crm (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL UNIQUE REFERENCES public.clientes(id) ON DELETE CASCADE,
  status_crm text DEFAULT 'ativo',
  origem text DEFAULT 'direto',
  ultima_interacao timestamp with time zone,
  indicacoes_feitas integer DEFAULT 0,
  indicado_por uuid REFERENCES public.clientes(id),
  tags text[] DEFAULT '{}',
  proximo_contato date,
  motivo_contato text,
  nivel_satisfacao integer CHECK (nivel_satisfacao >= 1 AND nivel_satisfacao <= 5),
  preferencias text,
  reclamacoes integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Criar tabela clientes_metricas (dados calculados/compilados)
CREATE TABLE public.clientes_metricas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL UNIQUE REFERENCES public.clientes(id) ON DELETE CASCADE,
  total_spent numeric DEFAULT 0,
  last_service_date timestamp with time zone,
  total_ordens integer DEFAULT 0,
  total_veiculos integer DEFAULT 0,
  ticket_medio numeric DEFAULT 0,
  dias_sem_visita integer,
  valor_medio_peca numeric DEFAULT 0,
  valor_medio_mao_obra numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. Migrar dados existentes para clientes_crm
INSERT INTO public.clientes_crm (
  cliente_id, status_crm, origem, ultima_interacao, indicacoes_feitas,
  indicado_por, tags, proximo_contato, motivo_contato, nivel_satisfacao,
  preferencias, reclamacoes
)
SELECT 
  id, status_crm, origem, ultima_interacao, indicacoes_feitas,
  indicado_por, tags, proximo_contato, motivo_contato, nivel_satisfacao,
  preferencias, reclamacoes
FROM public.clientes
WHERE id IS NOT NULL;

-- 4. Migrar dados existentes para clientes_metricas
INSERT INTO public.clientes_metricas (
  cliente_id, total_spent, last_service_date
)
SELECT 
  id, COALESCE(total_spent, 0), last_service_date
FROM public.clientes
WHERE id IS NOT NULL;

-- 5. RLS para clientes_crm
ALTER TABLE public.clientes_crm ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/gestao podem gerenciar clientes_crm"
ON public.clientes_crm FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestao') OR has_role(auth.uid(), 'dev'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestao') OR has_role(auth.uid(), 'dev'));

CREATE POLICY "Users can view own CRM data"
ON public.clientes_crm FOR SELECT
USING (
  cliente_id IN (SELECT id FROM clientes WHERE user_id = auth.uid())
  OR has_role(auth.uid(), 'admin') 
  OR has_role(auth.uid(), 'gestao') 
  OR has_role(auth.uid(), 'dev')
);

-- 6. RLS para clientes_metricas
ALTER TABLE public.clientes_metricas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/gestao podem gerenciar clientes_metricas"
ON public.clientes_metricas FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestao') OR has_role(auth.uid(), 'dev'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestao') OR has_role(auth.uid(), 'dev'));

CREATE POLICY "Users can view own metrics"
ON public.clientes_metricas FOR SELECT
USING (
  cliente_id IN (SELECT id FROM clientes WHERE user_id = auth.uid())
  OR has_role(auth.uid(), 'admin') 
  OR has_role(auth.uid(), 'gestao') 
  OR has_role(auth.uid(), 'dev')
);

-- 7. Remover colunas migradas da tabela clientes (mantém apenas cadastro)
ALTER TABLE public.clientes 
  DROP COLUMN IF EXISTS status_crm,
  DROP COLUMN IF EXISTS origem,
  DROP COLUMN IF EXISTS ultima_interacao,
  DROP COLUMN IF EXISTS indicacoes_feitas,
  DROP COLUMN IF EXISTS indicado_por,
  DROP COLUMN IF EXISTS tags,
  DROP COLUMN IF EXISTS proximo_contato,
  DROP COLUMN IF EXISTS motivo_contato,
  DROP COLUMN IF EXISTS nivel_satisfacao,
  DROP COLUMN IF EXISTS preferencias,
  DROP COLUMN IF EXISTS reclamacoes,
  DROP COLUMN IF EXISTS total_spent,
  DROP COLUMN IF EXISTS last_service_date;

-- 8. Índices para performance
CREATE INDEX idx_clientes_crm_cliente_id ON public.clientes_crm(cliente_id);
CREATE INDEX idx_clientes_crm_status ON public.clientes_crm(status_crm);
CREATE INDEX idx_clientes_metricas_cliente_id ON public.clientes_metricas(cliente_id);

-- 9. Triggers para updated_at
CREATE TRIGGER update_clientes_crm_updated_at
  BEFORE UPDATE ON public.clientes_crm
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_metricas_updated_at
  BEFORE UPDATE ON public.clientes_metricas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Comentários
COMMENT ON TABLE public.clientes_crm IS 'Dados de relacionamento/CRM do cliente';
COMMENT ON TABLE public.clientes_metricas IS 'Métricas calculadas e compiladas do cliente';