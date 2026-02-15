-- Adicionar campo recurso (local físico no pátio) na service_orders
ALTER TABLE public.service_orders 
ADD COLUMN IF NOT EXISTS recurso TEXT DEFAULT NULL;

-- Comentário explicativo
COMMENT ON COLUMN public.service_orders.recurso IS 'Local físico no pátio: Box A, Box B, Elevador 1, etc.';