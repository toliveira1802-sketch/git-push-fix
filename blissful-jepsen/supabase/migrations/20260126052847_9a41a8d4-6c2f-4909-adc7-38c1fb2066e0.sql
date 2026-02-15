-- Fix 1: Add role check to cleanup_old_entregues function
CREATE OR REPLACE FUNCTION public.cleanup_old_entregues()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Check if user has admin, gestao, or dev role
  IF NOT (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'dev'::app_role)) THEN
    RAISE EXCEPTION 'Acesso negado. Apenas admin/gestao/dev podem executar esta função.';
  END IF;
  
  DELETE FROM public.service_orders
  WHERE status = 'entregue'
    AND completed_at IS NOT NULL
    AND DATE_TRUNC('month', completed_at) < DATE_TRUNC('month', CURRENT_DATE);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix 2: Restrict profiles SELECT policy to own profile or admin/gestao/dev
DROP POLICY IF EXISTS "Usuários podem ver todos os profiles" ON profiles;

CREATE POLICY "Users can view own profile or admins can view all"
ON profiles
FOR SELECT
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'gestao'::app_role) 
  OR has_role(auth.uid(), 'dev'::app_role)
);