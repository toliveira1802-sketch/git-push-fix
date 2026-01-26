-- =============================================
-- FIX: Restringir acesso às tabelas de IA
-- =============================================

-- Drop políticas permissivas existentes
DROP POLICY IF EXISTS "Admin pode gerenciar anna" ON ia_anna_atendimentos;
DROP POLICY IF EXISTS "Admin pode gerenciar joao" ON ia_joao_qualidade;
DROP POLICY IF EXISTS "Admin pode gerenciar luiz" ON ia_luiz_base_leads;
DROP POLICY IF EXISTS "Admin pode gerenciar pedro" ON ia_pedro_reativacoes;
DROP POLICY IF EXISTS "Admin pode gerenciar zoraide" ON ia_zoraide_monitor;
DROP POLICY IF EXISTS "Admin pode ver metricas" ON ia_metricas_diarias;

-- Criar políticas restritivas para tabelas de IA
CREATE POLICY "Admin/gestao/dev podem gerenciar anna"
  ON ia_anna_atendimentos FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'dev'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'dev'::app_role));

CREATE POLICY "Admin/gestao/dev podem gerenciar joao"
  ON ia_joao_qualidade FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'dev'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'dev'::app_role));

CREATE POLICY "Admin/gestao/dev podem gerenciar luiz"
  ON ia_luiz_base_leads FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'dev'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'dev'::app_role));

CREATE POLICY "Admin/gestao/dev podem gerenciar pedro"
  ON ia_pedro_reativacoes FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'dev'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'dev'::app_role));

CREATE POLICY "Admin/gestao/dev podem gerenciar zoraide"
  ON ia_zoraide_monitor FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'dev'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'dev'::app_role));

CREATE POLICY "Admin/gestao/dev podem ver metricas"
  ON ia_metricas_diarias FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'dev'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'dev'::app_role));

-- =============================================
-- FIX: Recriar view client_service_history com security_invoker
-- =============================================

DROP VIEW IF EXISTS client_service_history;

CREATE VIEW client_service_history
WITH (security_invoker = on)
AS
SELECT 
  c.id AS client_id,
  c.user_id,
  c.name AS client_name,
  c.email AS client_email,
  c.phone AS client_phone,
  v.id AS vehicle_id,
  v.plate AS vehicle_plate,
  v.brand AS vehicle_brand,
  v.model AS vehicle_model,
  v.year AS vehicle_year,
  v.color AS vehicle_color,
  v.km AS vehicle_km,
  so.id AS service_order_id,
  so.order_number,
  so.created_at AS order_date,
  so.status AS order_status,
  so.problem_description,
  so.diagnosis,
  so.total,
  so.total_parts,
  so.total_labor,
  so.total_discount,
  so.payment_method,
  so.payment_status,
  so.completed_at,
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', soi.id,
        'type', soi.type,
        'description', soi.description,
        'quantity', soi.quantity,
        'unit_price', soi.unit_price,
        'total_price', soi.total_price,
        'status', soi.status
      )
    )
    FROM service_order_items soi
    WHERE soi.service_order_id = so.id
  ) AS items
FROM clients c
LEFT JOIN vehicles v ON v.client_id = c.id
LEFT JOIN service_orders so ON so.client_id = c.id AND so.vehicle_id = v.id;