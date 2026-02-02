-- ========================================
-- ETAPA 1: RENOMEAR TABELAS PRINCIPAIS
-- ========================================

-- Renomear companies -> empresas
ALTER TABLE public.companies RENAME TO empresas;

-- Renomear clients -> clientes
ALTER TABLE public.clients RENAME TO clientes;

-- Renomear vehicles -> veiculos
ALTER TABLE public.vehicles RENAME TO veiculos;

-- Renomear mechanics -> mecanicos
ALTER TABLE public.mechanics RENAME TO mecanicos;

-- Renomear profiles -> colaboradores
ALTER TABLE public.profiles RENAME TO colaboradores;

-- Renomear appointments -> agendamentos
ALTER TABLE public.appointments RENAME TO agendamentos;

-- Renomear service_orders -> ordens_servico
ALTER TABLE public.service_orders RENAME TO ordens_servico;

-- Renomear service_order_items -> itens_ordem_servico
ALTER TABLE public.service_order_items RENAME TO itens_ordem_servico;

-- Renomear service_order_history -> historico_ordem_servico
ALTER TABLE public.service_order_history RENAME TO historico_ordem_servico;

-- ========================================
-- ETAPA 2: ADICIONAR NOVOS CAMPOS (do Excel)
-- ========================================

-- empresas: adicionar campos do Excel
ALTER TABLE public.empresas 
ADD COLUMN IF NOT EXISTS razao_social TEXT,
ADD COLUMN IF NOT EXISTS cnpj TEXT,
ADD COLUMN IF NOT EXISTS telefone TEXT;

-- mecanicos: adicionar campos de avaliação
ALTER TABLE public.mecanicos 
ADD COLUMN IF NOT EXISTS grau_conhecimento TEXT DEFAULT 'jr',
ADD COLUMN IF NOT EXISTS especialidade TEXT,
ADD COLUMN IF NOT EXISTS qtde_positivos INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS qtde_negativos INTEGER DEFAULT 0;

-- clientes: adicionar empresa_id
ALTER TABLE public.clientes 
ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id);

-- veiculos: adicionar campos do Excel
ALTER TABLE public.veiculos 
ADD COLUMN IF NOT EXISTS versao TEXT,
ADD COLUMN IF NOT EXISTS ultimo_km INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS origem_contato TEXT;

-- colaboradores: adicionar campos do Excel
ALTER TABLE public.colaboradores 
ADD COLUMN IF NOT EXISTS cargo TEXT,
ADD COLUMN IF NOT EXISTS cpf TEXT,
ADD COLUMN IF NOT EXISTS primeiro_acesso BOOLEAN DEFAULT true;

-- ========================================
-- ETAPA 3: CRIAR TABELA RECURSOS (elevadores, boxes)
-- ========================================

CREATE TABLE IF NOT EXISTS public.recursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresas(id) NOT NULL,
  nome TEXT NOT NULL,
  tipo TEXT DEFAULT 'elevador', -- elevador, box, rampa, equipamento
  ultima_manutencao TIMESTAMP WITH TIME ZONE,
  horas_utilizadas_mes NUMERIC DEFAULT 0,
  valor_produzido_mes NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS para recursos
ALTER TABLE public.recursos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para recursos
CREATE POLICY "Admin/gestao podem gerenciar recursos"
ON public.recursos FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'dev'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'dev'::app_role));

CREATE POLICY "Todos autenticados podem ver recursos"
ON public.recursos FOR SELECT
USING (true);

-- ========================================
-- ETAPA 4: CRIAR TABELA PROMOCOES
-- ========================================

CREATE TABLE IF NOT EXISTS public.promocoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresas(id),
  nome TEXT NOT NULL,
  descricao TEXT,
  data_inicio DATE,
  data_fim DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.promocoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/gestao podem gerenciar promocoes"
ON public.promocoes FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'dev'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'dev'::app_role));

CREATE POLICY "Todos autenticados podem ver promocoes"
ON public.promocoes FOR SELECT
USING (true);

-- ========================================
-- ETAPA 5: CRIAR TABELA PROMOCOES_TRACKING
-- ========================================

CREATE TABLE IF NOT EXISTS public.promocoes_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promocao_id UUID REFERENCES public.promocoes(id),
  cliente_id UUID REFERENCES public.clientes(id),
  veio_pela_promocao BOOLEAN DEFAULT false,
  cliente_retornou BOOLEAN DEFAULT false,
  quantas_vezes_retornou INTEGER DEFAULT 0,
  total_gasto NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.promocoes_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/gestao podem gerenciar tracking"
ON public.promocoes_tracking FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'dev'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'dev'::app_role));

-- ========================================
-- ETAPA 6: CRIAR TABELA CATALOGO_SERVICOS
-- ========================================

CREATE TABLE IF NOT EXISTS public.catalogo_servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT, -- mao_de_obra, peca, pacote
  valor_base NUMERIC DEFAULT 0,
  tempo_estimado INTEGER, -- em minutos
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.catalogo_servicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/gestao podem gerenciar catalogo"
ON public.catalogo_servicos FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'dev'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'dev'::app_role));

CREATE POLICY "Todos autenticados podem ver catalogo"
ON public.catalogo_servicos FOR SELECT
USING (true);

-- ========================================
-- ETAPA 7: RECRIAR VIEW client_service_history
-- ========================================

DROP VIEW IF EXISTS public.client_service_history;

CREATE VIEW public.client_service_history
WITH (security_invoker = on)
AS
SELECT 
  c.id as client_id,
  c.user_id,
  c.name as client_name,
  c.phone as client_phone,
  c.email as client_email,
  v.id as vehicle_id,
  v.plate as vehicle_plate,
  v.brand as vehicle_brand,
  v.model as vehicle_model,
  v.color as vehicle_color,
  v.year as vehicle_year,
  v.km as vehicle_km,
  so.id as service_order_id,
  so.order_number,
  so.status as order_status,
  so.created_at as order_date,
  so.completed_at,
  so.problem_description,
  so.diagnosis,
  so.total,
  so.total_parts,
  so.total_labor,
  so.total_discount,
  so.payment_method,
  so.payment_status,
  (
    SELECT jsonb_agg(jsonb_build_object(
      'id', soi.id,
      'description', soi.description,
      'type', soi.type,
      'quantity', soi.quantity,
      'unit_price', soi.unit_price,
      'total_price', soi.total_price,
      'status', soi.status
    ))
    FROM public.itens_ordem_servico soi
    WHERE soi.service_order_id = so.id
  ) as items
FROM public.clientes c
LEFT JOIN public.veiculos v ON v.client_id = c.id
LEFT JOIN public.ordens_servico so ON so.vehicle_id = v.id;

-- ========================================
-- ETAPA 8: ATUALIZAR TRIGGERS E FUNÇÕES
-- ========================================

-- Atualizar trigger handle_new_user para usar colaboradores
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.colaboradores (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Atualizar função check_retorno_45_dias
CREATE OR REPLACE FUNCTION public.check_retorno_45_dias()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ultima_entrega TIMESTAMP WITH TIME ZONE;
  dias_desde_entrega INTEGER;
  vehicle_info RECORD;
  client_info RECORD;
  alerta_existente UUID;
BEGIN
  SELECT id INTO alerta_existente
  FROM public.gestao_alerts
  WHERE service_order_id = NEW.id
    AND tipo = 'retorno_45_dias';
  
  IF alerta_existente IS NOT NULL THEN
    RETURN NEW;
  END IF;

  SELECT completed_at INTO ultima_entrega
  FROM public.ordens_servico
  WHERE vehicle_id = NEW.vehicle_id
    AND id != NEW.id
    AND status = 'entregue'
    AND completed_at IS NOT NULL
  ORDER BY completed_at DESC
  LIMIT 1;
  
  IF ultima_entrega IS NOT NULL THEN
    dias_desde_entrega := EXTRACT(DAY FROM (NOW() - ultima_entrega));
    
    IF dias_desde_entrega < 45 THEN
      SELECT plate, model, brand INTO vehicle_info
      FROM public.veiculos WHERE id = NEW.vehicle_id;
      
      SELECT name INTO client_info
      FROM public.clientes WHERE id = NEW.client_id;
      
      INSERT INTO public.gestao_alerts (
        tipo,
        titulo,
        descricao,
        service_order_id,
        vehicle_id,
        client_id,
        metadata
      ) VALUES (
        'retorno_45_dias',
        'Veículo retornou em menos de 45 dias',
        format('O veículo %s %s (%s) do cliente %s retornou após apenas %s dias desde a última entrega.',
          vehicle_info.brand, vehicle_info.model, vehicle_info.plate, client_info.name, dias_desde_entrega),
        NEW.id,
        NEW.vehicle_id,
        NEW.client_id,
        jsonb_build_object(
          'dias_desde_entrega', dias_desde_entrega,
          'ultima_entrega', ultima_entrega,
          'order_number', NEW.order_number
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Atualizar função cleanup_old_entregues
CREATE OR REPLACE FUNCTION public.cleanup_old_entregues()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  IF NOT (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'dev'::app_role)) THEN
    RAISE EXCEPTION 'Acesso negado. Apenas admin/gestao/dev podem executar esta função.';
  END IF;
  
  DELETE FROM public.ordens_servico
  WHERE status = 'entregue'
    AND completed_at IS NOT NULL
    AND DATE_TRUNC('month', completed_at) < DATE_TRUNC('month', CURRENT_DATE);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Atualizar função generate_order_number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_number TEXT;
  year_prefix TEXT;
  last_number INTEGER;
BEGIN
  year_prefix := TO_CHAR(NOW(), 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 6) AS INTEGER)), 0)
  INTO last_number
  FROM public.ordens_servico
  WHERE order_number LIKE year_prefix || '-%';
  
  new_number := year_prefix || '-' || LPAD((last_number + 1)::TEXT, 5, '0');
  NEW.order_number := new_number;
  
  RETURN NEW;
END;
$$;

-- Atualizar função log_entrega_to_history
CREATE OR REPLACE FUNCTION public.log_entrega_to_history()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'entregue' AND (OLD.status IS NULL OR OLD.status != 'entregue') THEN
    INSERT INTO public.historico_ordem_servico (
      service_order_id,
      event_type,
      description,
      user_id,
      metadata
    ) VALUES (
      NEW.id,
      'entrega',
      'Ordem de serviço entregue ao cliente',
      auth.uid(),
      jsonb_build_object(
        'order_number', NEW.order_number,
        'total', NEW.total,
        'completed_at', NEW.completed_at,
        'vehicle_id', NEW.vehicle_id,
        'client_id', NEW.client_id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;