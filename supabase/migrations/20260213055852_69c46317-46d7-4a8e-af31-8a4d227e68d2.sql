-- Add policy for mechanics to view pendencias assigned to them
CREATE POLICY "Mechanics can view their assigned pendencias"
ON public.pendencias
FOR SELECT
TO authenticated
USING (
  mechanic_id IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.mecanicos m
    JOIN public.colaboradores c ON c.company_id = m.company_id
    WHERE m.id = pendencias.mechanic_id
    AND c.user_id = auth.uid()
  )
);