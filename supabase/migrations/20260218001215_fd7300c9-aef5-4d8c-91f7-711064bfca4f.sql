-- Remove overly permissive SELECT policy on mecanicos
DROP POLICY "Todos autenticados podem ver mecânicos" ON public.mecanicos;
