-- 1. Criar tabela de alertas para gestão
CREATE TABLE public.gestao_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL, -- 'retorno_45_dias', 'outro'
  titulo TEXT NOT NULL,
  descricao TEXT,
  service_order_id UUID REFERENCES public.service_orders(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  lido BOOLEAN NOT NULL DEFAULT false,
  lido_por UUID,
  lido_em TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.gestao_alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Gestao/admin podem ver alertas"
  ON public.gestao_alerts FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'dev'::app_role));

CREATE POLICY "Gestao/admin podem gerenciar alertas"
  ON public.gestao_alerts FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'dev'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'dev'::app_role));

-- 2. Trigger: Copiar para service_order_history quando status = 'entregue'
CREATE OR REPLACE FUNCTION public.log_entrega_to_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Só executa quando status muda para 'entregue'
  IF NEW.status = 'entregue' AND (OLD.status IS NULL OR OLD.status != 'entregue') THEN
    INSERT INTO public.service_order_history (
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_log_entrega
  AFTER UPDATE ON public.service_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.log_entrega_to_history();

-- 3. Trigger: Alerta quando veículo retorna em menos de 45 dias
CREATE OR REPLACE FUNCTION public.check_retorno_45_dias()
RETURNS TRIGGER AS $$
DECLARE
  ultima_entrega TIMESTAMP WITH TIME ZONE;
  dias_desde_entrega INTEGER;
  vehicle_info RECORD;
  client_info RECORD;
BEGIN
  -- Buscar última entrega deste veículo (diferente da OS atual)
  SELECT completed_at INTO ultima_entrega
  FROM public.service_orders
  WHERE vehicle_id = NEW.vehicle_id
    AND id != NEW.id
    AND status = 'entregue'
    AND completed_at IS NOT NULL
  ORDER BY completed_at DESC
  LIMIT 1;
  
  -- Se tem entrega anterior
  IF ultima_entrega IS NOT NULL THEN
    dias_desde_entrega := EXTRACT(DAY FROM (NOW() - ultima_entrega));
    
    -- Se menos de 45 dias, criar alerta
    IF dias_desde_entrega < 45 THEN
      -- Buscar info do veículo
      SELECT plate, model, brand INTO vehicle_info
      FROM public.vehicles WHERE id = NEW.vehicle_id;
      
      -- Buscar info do cliente
      SELECT name INTO client_info
      FROM public.clients WHERE id = NEW.client_id;
      
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_check_retorno_45_dias
  AFTER INSERT ON public.service_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.check_retorno_45_dias();

-- 4. Função para limpar OSs entregues de meses anteriores (chamar via cron ou manualmente)
CREATE OR REPLACE FUNCTION public.cleanup_old_entregues()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Deletar OSs entregues de meses anteriores ao atual
  DELETE FROM public.service_orders
  WHERE status = 'entregue'
    AND completed_at IS NOT NULL
    AND DATE_TRUNC('month', completed_at) < DATE_TRUNC('month', CURRENT_DATE);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;