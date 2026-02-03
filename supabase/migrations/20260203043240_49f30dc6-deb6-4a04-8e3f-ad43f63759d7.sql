-- Fix #1: Remove overly permissive policy from empresas table
DROP POLICY IF EXISTS "Todos autenticados podem ver companies" ON public.empresas;

-- Create a more restrictive policy for empresas - only admin/gestao/dev can see sensitive business data
-- Regular authenticated users only need to see basic company info (id, code, name) for UI
CREATE POLICY "Only admins can view full company data"
ON public.empresas
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'gestao'::app_role) OR 
  has_role(auth.uid(), 'dev'::app_role)
);

-- Fix #2: Recreate client_service_history view with security_invoker to inherit RLS from underlying tables
DROP VIEW IF EXISTS public.client_service_history;

CREATE VIEW public.client_service_history
WITH (security_invoker = on)
AS
SELECT 
    c.id AS client_id,
    c.user_id,
    c.name AS client_name,
    c.phone AS client_phone,
    c.email AS client_email,
    v.id AS vehicle_id,
    v.plate AS vehicle_plate,
    v.brand AS vehicle_brand,
    v.model AS vehicle_model,
    v.color AS vehicle_color,
    v.year AS vehicle_year,
    v.km AS vehicle_km,
    so.id AS service_order_id,
    so.order_number,
    so.status AS order_status,
    so.created_at AS order_date,
    so.completed_at,
    so.problem_description,
    so.diagnosis,
    so.total,
    so.total_parts,
    so.total_labor,
    so.total_discount,
    so.payment_method,
    so.payment_status,
    (SELECT jsonb_agg(jsonb_build_object(
        'id', soi.id, 
        'description', soi.description, 
        'type', soi.type, 
        'quantity', soi.quantity, 
        'unit_price', soi.unit_price, 
        'total_price', soi.total_price, 
        'status', soi.status
    )) FROM itens_ordem_servico soi WHERE soi.service_order_id = so.id) AS items
FROM clientes c
LEFT JOIN veiculos v ON v.client_id = c.id
LEFT JOIN ordens_servico so ON so.vehicle_id = v.id;

-- Grant SELECT to authenticated users (RLS on underlying tables will filter)
GRANT SELECT ON public.client_service_history TO authenticated;