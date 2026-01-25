-- View para histórico completo do cliente
CREATE OR REPLACE VIEW public.client_service_history AS
SELECT 
  so.id as service_order_id,
  so.order_number,
  so.status as order_status,
  so.created_at as order_date,
  so.completed_at,
  so.total,
  so.total_parts,
  so.total_labor,
  so.total_discount,
  so.problem_description,
  so.diagnosis,
  so.payment_status,
  so.payment_method,
  c.id as client_id,
  c.user_id,
  c.name as client_name,
  c.phone as client_phone,
  c.email as client_email,
  v.id as vehicle_id,
  v.brand as vehicle_brand,
  v.model as vehicle_model,
  v.plate as vehicle_plate,
  v.year as vehicle_year,
  v.color as vehicle_color,
  v.km as vehicle_km,
  COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', soi.id,
        'description', soi.description,
        'type', soi.type,
        'quantity', soi.quantity,
        'unit_price', soi.unit_price,
        'total_price', soi.total_price,
        'status', soi.status,
        'priority', soi.priority
      )
    ) FILTER (WHERE soi.id IS NOT NULL),
    '[]'::jsonb
  ) as items
FROM public.service_orders so
JOIN public.clients c ON so.client_id = c.id
JOIN public.vehicles v ON so.vehicle_id = v.id
LEFT JOIN public.service_order_items soi ON soi.service_order_id = so.id
GROUP BY 
  so.id, so.order_number, so.status, so.created_at, so.completed_at,
  so.total, so.total_parts, so.total_labor, so.total_discount,
  so.problem_description, so.diagnosis, so.payment_status, so.payment_method,
  c.id, c.user_id, c.name, c.phone, c.email,
  v.id, v.brand, v.model, v.plate, v.year, v.color, v.km;

-- Política RLS para a VIEW (clientes veem apenas seu próprio histórico)
CREATE POLICY "Clientes podem ver seu próprio histórico"
ON public.service_orders
FOR SELECT
USING (
  client_id IN (
    SELECT id FROM public.clients WHERE user_id = auth.uid()
  )
);