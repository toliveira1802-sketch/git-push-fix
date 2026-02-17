
DROP POLICY "Todos autenticados podem ver veiculos_orfaos" ON public.veiculos_orfaos;

CREATE POLICY "Only admins can view orphan vehicles"
ON public.veiculos_orfaos FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'gestao'::app_role) OR 
  has_role(auth.uid(), 'dev'::app_role)
);
