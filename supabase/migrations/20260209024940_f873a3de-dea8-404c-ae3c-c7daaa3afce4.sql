
-- ============================================================
-- FIX 1: Clean up duplicate RLS policies on 'clientes' table
-- Problem: Multiple overlapping SELECT, INSERT, UPDATE, DELETE 
-- policies create confusion and risk of misconfiguration
-- ============================================================

-- Drop all existing policies on clientes
DROP POLICY IF EXISTS "Admin roles can delete clients" ON public.clientes;
DROP POLICY IF EXISTS "Admin roles can insert clients" ON public.clientes;
DROP POLICY IF EXISTS "Admin roles can update clients" ON public.clientes;
DROP POLICY IF EXISTS "Admin roles can view all clients" ON public.clientes;
DROP POLICY IF EXISTS "Admin/gestao podem gerenciar clientes" ON public.clientes;
DROP POLICY IF EXISTS "Clients can view own record" ON public.clientes;
DROP POLICY IF EXISTS "Staff can delete clients" ON public.clientes;
DROP POLICY IF EXISTS "Staff can insert clients" ON public.clientes;
DROP POLICY IF EXISTS "Staff can update clients" ON public.clientes;
DROP POLICY IF EXISTS "Staff can view company clients" ON public.clientes;
DROP POLICY IF EXISTS "Users can view own client record" ON public.clientes;
DROP POLICY IF EXISTS "Users can view own linked client" ON public.clientes;

-- Create clean, non-overlapping policies for clientes
CREATE POLICY "Staff can manage clients"
  ON public.clientes FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'dev'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'dev'::app_role));

CREATE POLICY "Users can view own client record only"
  ON public.clientes FOR SELECT
  USING (user_id = auth.uid());

-- ============================================================
-- FIX 2: Clean up duplicate RLS policies on 'ordens_servico'
-- Problem: Multiple overlapping SELECT policies + duplicate 
-- management policies create risk of data leakage
-- ============================================================

-- Drop all existing policies on ordens_servico
DROP POLICY IF EXISTS "Admin/gestao podem gerenciar OS" ON public.ordens_servico;
DROP POLICY IF EXISTS "Clientes podem ver seu próprio histórico" ON public.ordens_servico;
DROP POLICY IF EXISTS "Clients can view own orders" ON public.ordens_servico;
DROP POLICY IF EXISTS "Staff can delete orders" ON public.ordens_servico;
DROP POLICY IF EXISTS "Staff can insert orders" ON public.ordens_servico;
DROP POLICY IF EXISTS "Staff can update orders" ON public.ordens_servico;
DROP POLICY IF EXISTS "Staff can view orders" ON public.ordens_servico;
DROP POLICY IF EXISTS "Users can view service orders" ON public.ordens_servico;

-- Create clean, non-overlapping policies for ordens_servico
CREATE POLICY "Staff can manage service orders"
  ON public.ordens_servico FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'dev'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'dev'::app_role));

CREATE POLICY "Clients can view own service orders"
  ON public.ordens_servico FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.clientes c
      WHERE c.id = ordens_servico.client_id
      AND c.user_id = auth.uid()
    )
  );

-- ============================================================
-- FIX 3: Clean up duplicate RLS policies on 'colaboradores'
-- Problem: Duplicate SELECT and UPDATE policies
-- ============================================================

-- Drop all existing policies on colaboradores
DROP POLICY IF EXISTS "Staff can manage colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "Staff can view colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "Users can update own profile" ON public.colaboradores;
DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON public.colaboradores;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio profile" ON public.colaboradores;
DROP POLICY IF EXISTS "Usuários podem inserir seu próprio profile" ON public.colaboradores;

-- Create clean, non-overlapping policies for colaboradores
CREATE POLICY "Staff can manage colaboradores"
  ON public.colaboradores FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'dev'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'dev'::app_role));

CREATE POLICY "Users can view own profile"
  ON public.colaboradores FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.colaboradores FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON public.colaboradores FOR INSERT
  WITH CHECK (user_id = auth.uid());
