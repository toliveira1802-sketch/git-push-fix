-- =====================================================
-- SECURITY FIX: Comprehensive RLS Policy Update
-- Fixes: Company isolation, PII protection, view security
-- =====================================================

-- 1. Drop existing policies that need to be replaced
DROP POLICY IF EXISTS "Authenticated users can view clients" ON public.clientes;
DROP POLICY IF EXISTS "Authenticated users can insert clients" ON public.clientes;
DROP POLICY IF EXISTS "Authenticated users can update clients" ON public.clientes;
DROP POLICY IF EXISTS "Authenticated users can delete clients" ON public.clientes;

DROP POLICY IF EXISTS "Authenticated users can view vehicles" ON public.veiculos;
DROP POLICY IF EXISTS "Authenticated users can insert vehicles" ON public.veiculos;
DROP POLICY IF EXISTS "Authenticated users can update vehicles" ON public.veiculos;
DROP POLICY IF EXISTS "Authenticated users can delete vehicles" ON public.veiculos;

DROP POLICY IF EXISTS "Authenticated users can view service orders" ON public.ordens_servico;
DROP POLICY IF EXISTS "Authenticated users can insert service orders" ON public.ordens_servico;
DROP POLICY IF EXISTS "Authenticated users can update service orders" ON public.ordens_servico;
DROP POLICY IF EXISTS "Authenticated users can delete service orders" ON public.ordens_servico;

DROP POLICY IF EXISTS "Authenticated users can view service order items" ON public.itens_ordem_servico;
DROP POLICY IF EXISTS "Authenticated users can insert service order items" ON public.itens_ordem_servico;
DROP POLICY IF EXISTS "Authenticated users can update service order items" ON public.itens_ordem_servico;
DROP POLICY IF EXISTS "Authenticated users can delete service order items" ON public.itens_ordem_servico;

DROP POLICY IF EXISTS "Authenticated users can view appointments" ON public.agendamentos;
DROP POLICY IF EXISTS "Authenticated users can insert appointments" ON public.agendamentos;
DROP POLICY IF EXISTS "Authenticated users can update appointments" ON public.agendamentos;
DROP POLICY IF EXISTS "Authenticated users can delete appointments" ON public.agendamentos;

DROP POLICY IF EXISTS "Authenticated users can view empresas" ON public.empresas;
DROP POLICY IF EXISTS "Authenticated users can view colaboradores" ON public.colaboradores;

DROP POLICY IF EXISTS "Authenticated users can view mechanics" ON public.mecanicos;
DROP POLICY IF EXISTS "Authenticated users can view recursos" ON public.recursos;
DROP POLICY IF EXISTS "Authenticated users can view catalogo" ON public.catalogo_servicos;
DROP POLICY IF EXISTS "Authenticated users can view alerts" ON public.gestao_alerts;
DROP POLICY IF EXISTS "Authenticated users can view feedback" ON public.mechanic_daily_feedback;

-- =====================================================
-- 2. CLIENTES - Company isolation + client self-access
-- =====================================================

-- Staff (admin/gestao/dev) can view clients from their company
CREATE POLICY "Staff can view company clients"
ON public.clientes FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'gestao'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
);

-- Clients can view their own record
CREATE POLICY "Clients can view own record"
ON public.clientes FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Staff can insert clients
CREATE POLICY "Staff can insert clients"
ON public.clientes FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'gestao'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
);

-- Staff can update clients
CREATE POLICY "Staff can update clients"
ON public.clientes FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'gestao'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
);

-- Staff can delete clients
CREATE POLICY "Staff can delete clients"
ON public.clientes FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'gestao'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
);

-- =====================================================
-- 3. VEICULOS - Client can see own vehicles
-- =====================================================

-- Staff can view all vehicles
CREATE POLICY "Staff can view vehicles"
ON public.veiculos FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'gestao'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
);

-- Clients can view their own vehicles
CREATE POLICY "Clients can view own vehicles"
ON public.veiculos FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clientes c
    WHERE c.id = veiculos.client_id
    AND c.user_id = auth.uid()
  )
);

-- Staff can manage vehicles
CREATE POLICY "Staff can insert vehicles"
ON public.veiculos FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'gestao'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
);

CREATE POLICY "Staff can update vehicles"
ON public.veiculos FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'gestao'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
);

CREATE POLICY "Staff can delete vehicles"
ON public.veiculos FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'gestao'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
);

-- =====================================================
-- 4. ORDENS_SERVICO - Client can see own orders
-- =====================================================

-- Staff can view all orders
CREATE POLICY "Staff can view orders"
ON public.ordens_servico FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'gestao'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
);

-- Clients can view their own orders
CREATE POLICY "Clients can view own orders"
ON public.ordens_servico FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clientes c
    WHERE c.id = ordens_servico.client_id
    AND c.user_id = auth.uid()
  )
);

-- Staff can manage orders
CREATE POLICY "Staff can insert orders"
ON public.ordens_servico FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'gestao'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
);

CREATE POLICY "Staff can update orders"
ON public.ordens_servico FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'gestao'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
);

CREATE POLICY "Staff can delete orders"
ON public.ordens_servico FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'gestao'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
);

-- =====================================================
-- 5. ITENS_ORDEM_SERVICO - Follow parent order access
-- =====================================================

CREATE POLICY "Staff can view order items"
ON public.itens_ordem_servico FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'gestao'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
);

CREATE POLICY "Clients can view own order items"
ON public.itens_ordem_servico FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.ordens_servico os
    JOIN public.clientes c ON c.id = os.client_id
    WHERE os.id = itens_ordem_servico.service_order_id
    AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Staff can insert order items"
ON public.itens_ordem_servico FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'gestao'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
);

CREATE POLICY "Staff can update order items"
ON public.itens_ordem_servico FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'gestao'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
);

CREATE POLICY "Staff can delete order items"
ON public.itens_ordem_servico FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'gestao'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
);

-- =====================================================
-- 6. AGENDAMENTOS - Client can see own appointments
-- =====================================================

CREATE POLICY "Staff can view appointments"
ON public.agendamentos FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'gestao'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
);

CREATE POLICY "Clients can view own appointments"
ON public.agendamentos FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.clientes c
    WHERE c.id = agendamentos.client_id
    AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Staff can insert appointments"
ON public.agendamentos FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'gestao'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
);

CREATE POLICY "Clients can insert own appointments"
ON public.agendamentos FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.clientes c
    WHERE c.id = client_id
    AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Staff can update appointments"
ON public.agendamentos FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'gestao'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
);

CREATE POLICY "Staff can delete appointments"
ON public.agendamentos FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'gestao'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
);

-- =====================================================
-- 7. EMPRESAS - Staff only
-- =====================================================

CREATE POLICY "Staff can view empresas"
ON public.empresas FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'gestao'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
);

CREATE POLICY "Dev can manage empresas"
ON public.empresas FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'dev'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'dev'::app_role));

-- =====================================================
-- 8. COLABORADORES - Staff only (hide sensitive data)
-- =====================================================

CREATE POLICY "Staff can view colaboradores"
ON public.colaboradores FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'gestao'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role) OR
  user_id = auth.uid()
);

CREATE POLICY "Users can update own profile"
ON public.colaboradores FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Staff can manage colaboradores"
ON public.colaboradores FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
);

-- =====================================================
-- 9. MECANICOS - Staff only
-- =====================================================

CREATE POLICY "Staff can view mecanicos"
ON public.mecanicos FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'gestao'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
);

CREATE POLICY "Staff can manage mecanicos"
ON public.mecanicos FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
);

-- =====================================================
-- 10. RECURSOS - Staff only
-- =====================================================

CREATE POLICY "Staff can view recursos"
ON public.recursos FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'gestao'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
);

CREATE POLICY "Staff can manage recursos"
ON public.recursos FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
);

-- =====================================================
-- 11. CATALOGO_SERVICOS - Public read, staff manage
-- =====================================================

CREATE POLICY "Anyone can view catalogo"
ON public.catalogo_servicos FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Staff can manage catalogo"
ON public.catalogo_servicos FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
);

-- =====================================================
-- 12. GESTAO_ALERTS - Staff only
-- =====================================================

CREATE POLICY "Staff can view alerts"
ON public.gestao_alerts FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'gestao'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
);

CREATE POLICY "Staff can manage alerts"
ON public.gestao_alerts FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'gestao'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'gestao'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
);

-- =====================================================
-- 13. MECHANIC_DAILY_FEEDBACK - Staff only
-- =====================================================

CREATE POLICY "Staff can view feedback"
ON public.mechanic_daily_feedback FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'gestao'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
);

CREATE POLICY "Staff can manage feedback"
ON public.mechanic_daily_feedback FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'gestao'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'gestao'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
);

-- =====================================================
-- 14. CLIENTES_CRM - Staff only
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can view clientes_crm" ON public.clientes_crm;
DROP POLICY IF EXISTS "Authenticated users can manage clientes_crm" ON public.clientes_crm;

CREATE POLICY "Staff can view crm"
ON public.clientes_crm FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'gestao'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
);

CREATE POLICY "Staff can manage crm"
ON public.clientes_crm FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'gestao'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  public.has_role(auth.uid(), 'gestao'::app_role) OR
  public.has_role(auth.uid(), 'dev'::app_role)
);

-- =====================================================
-- 15. Recreate client_service_history view with security_invoker
-- =====================================================

DROP VIEW IF EXISTS public.client_service_history;

CREATE VIEW public.client_service_history
WITH (security_invoker = on)
AS
SELECT 
  c.id as client_id,
  c.name as client_name,
  c.email as client_email,
  c.phone as client_phone,
  c.user_id,
  v.id as vehicle_id,
  v.plate as vehicle_plate,
  v.brand as vehicle_brand,
  v.model as vehicle_model,
  v.year as vehicle_year,
  v.color as vehicle_color,
  v.km as vehicle_km,
  os.id as service_order_id,
  os.order_number,
  os.status as order_status,
  os.created_at as order_date,
  os.completed_at,
  os.problem_description,
  os.diagnosis,
  os.total,
  os.total_parts,
  os.total_labor,
  os.total_discount,
  os.payment_method,
  os.payment_status,
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
LEFT JOIN public.ordens_servico os ON os.client_id = c.id AND os.vehicle_id = v.id;

-- Grant access to the view
GRANT SELECT ON public.client_service_history TO authenticated;