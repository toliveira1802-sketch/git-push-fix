-- Fix 1: Recreate client_service_history view with security_invoker = on
-- This ensures RLS policies are respected when querying through the view

DROP VIEW IF EXISTS public.client_service_history;

CREATE VIEW public.client_service_history
WITH (security_invoker = on)
AS
SELECT 
  c.id as client_id,
  c.user_id,
  c.name as client_name,
  c.email as client_email,
  c.phone as client_phone,
  v.id as vehicle_id,
  v.plate as vehicle_plate,
  v.brand as vehicle_brand,
  v.model as vehicle_model,
  v.year as vehicle_year,
  v.color as vehicle_color,
  v.km as vehicle_km,
  os.id as service_order_id,
  os.order_number,
  os.created_at as order_date,
  os.status as order_status,
  os.problem_description,
  os.diagnosis,
  os.total,
  os.total_parts,
  os.total_labor,
  os.total_discount,
  os.payment_method,
  os.payment_status,
  os.completed_at,
  (
    SELECT jsonb_agg(jsonb_build_object(
      'id', i.id,
      'type', i.type,
      'description', i.description,
      'quantity', i.quantity,
      'unit_price', i.unit_price,
      'total_price', i.total_price,
      'status', i.status
    ))
    FROM public.itens_ordem_servico i
    WHERE i.service_order_id = os.id
  ) as items
FROM public.clientes c
LEFT JOIN public.veiculos v ON v.client_id = c.id
LEFT JOIN public.ordens_servico os ON os.vehicle_id = v.id;

-- Fix 2: Drop existing policies on clientes to recreate with proper restrictions
DROP POLICY IF EXISTS "Users can view their own client record" ON public.clientes;
DROP POLICY IF EXISTS "Users can update their own client record" ON public.clientes;
DROP POLICY IF EXISTS "Admins can view all clients" ON public.clientes;
DROP POLICY IF EXISTS "Admins can manage all clients" ON public.clientes;
DROP POLICY IF EXISTS "Allow admins to manage clients" ON public.clientes;
DROP POLICY IF EXISTS "Allow users to view own client" ON public.clientes;

-- New restrictive policies for clientes table
-- Only admin/gestao/dev can view ALL clients
CREATE POLICY "Admin roles can view all clients"
ON public.clientes FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'gestao') OR 
  public.has_role(auth.uid(), 'dev')
);

-- Regular users can ONLY view their own linked client record
CREATE POLICY "Users can view own linked client"
ON public.clientes FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Only admin/gestao/dev can insert clients
CREATE POLICY "Admin roles can insert clients"
ON public.clientes FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'gestao') OR 
  public.has_role(auth.uid(), 'dev')
);

-- Only admin/gestao/dev can update any client
CREATE POLICY "Admin roles can update clients"
ON public.clientes FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'gestao') OR 
  public.has_role(auth.uid(), 'dev')
);

-- Only admin/gestao/dev can delete clients
CREATE POLICY "Admin roles can delete clients"
ON public.clientes FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'gestao') OR 
  public.has_role(auth.uid(), 'dev')
);