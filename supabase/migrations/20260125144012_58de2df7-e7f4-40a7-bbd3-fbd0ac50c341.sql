CREATE OR REPLACE FUNCTION public.check_retorno_45_dias()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  ultima_entrega TIMESTAMP WITH TIME ZONE;
  dias_desde_entrega INTEGER;
  vehicle_info RECORD;
  client_info RECORD;
  alerta_existente UUID;
BEGIN
  -- Verificar se já existe alerta para esta OS (evitar duplicados)
  SELECT id INTO alerta_existente
  FROM public.gestao_alerts
  WHERE service_order_id = NEW.id
    AND tipo = 'retorno_45_dias';
  
  -- Se já existe alerta, não criar outro
  IF alerta_existente IS NOT NULL THEN
    RETURN NEW;
  END IF;

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
$function$