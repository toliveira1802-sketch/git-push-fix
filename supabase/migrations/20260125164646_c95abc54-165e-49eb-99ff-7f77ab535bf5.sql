-- Fix 1: Update clients table RLS to restrict SELECT to admin/gestao/dev only
-- (regular authenticated users should not see all clients data)

-- First, drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Autenticados podem ver clientes" ON public.clients;

-- Create a new policy that only allows clients to see their OWN record (if user_id matches)
-- And admin/gestao/dev can see all clients
CREATE POLICY "Users can view own client record"
ON public.clients
FOR SELECT
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'gestao'::app_role) 
  OR has_role(auth.uid(), 'dev'::app_role)
);

-- Fix 2: The client_service_history is a VIEW, not a table
-- It already has security_invoker=on which means it uses the RLS of underlying tables
-- But we need to ensure users can only see their own service history

-- First, let's check if it's a view and recreate with proper security
-- The view already exists with security_invoker, but the underlying tables need proper RLS

-- Update service_orders to be more restrictive for regular users
-- Keep the existing policy for clients to see their own orders
-- But ensure general authenticated access is removed for non-admin users

DROP POLICY IF EXISTS "Autenticados podem ver OS" ON public.service_orders;

-- Service orders: clients can see their own, admin/gestao/dev can see all
CREATE POLICY "Users can view service orders"
ON public.service_orders
FOR SELECT
USING (
  client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'gestao'::app_role) 
  OR has_role(auth.uid(), 'dev'::app_role)
);

-- Update vehicles to be more restrictive
DROP POLICY IF EXISTS "Autenticados podem ver veículos" ON public.vehicles;

-- Vehicles: clients can see their own vehicles, admin/gestao/dev can see all
CREATE POLICY "Users can view vehicles"
ON public.vehicles
FOR SELECT
USING (
  client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'gestao'::app_role) 
  OR has_role(auth.uid(), 'dev'::app_role)
);

-- Update service_order_items to be more restrictive
DROP POLICY IF EXISTS "Autenticados podem ver itens OS" ON public.service_order_items;

-- Service order items: only accessible via service orders the user can see
CREATE POLICY "Users can view service order items"
ON public.service_order_items
FOR SELECT
USING (
  service_order_id IN (
    SELECT id FROM public.service_orders 
    WHERE client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
  )
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'gestao'::app_role) 
  OR has_role(auth.uid(), 'dev'::app_role)
);

-- Update service_order_history to be more restrictive
DROP POLICY IF EXISTS "Autenticados podem ver histórico" ON public.service_order_history;

-- History: only accessible via service orders the user can see
CREATE POLICY "Users can view service order history"
ON public.service_order_history
FOR SELECT
USING (
  service_order_id IN (
    SELECT id FROM public.service_orders 
    WHERE client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
  )
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'gestao'::app_role) 
  OR has_role(auth.uid(), 'dev'::app_role)
);

-- Update appointments to be more restrictive
DROP POLICY IF EXISTS "Autenticados podem ver agendamentos" ON public.appointments;

-- Appointments: clients can see their own, admin/gestao/dev can see all
CREATE POLICY "Users can view appointments"
ON public.appointments
FOR SELECT
USING (
  client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'gestao'::app_role) 
  OR has_role(auth.uid(), 'dev'::app_role)
);