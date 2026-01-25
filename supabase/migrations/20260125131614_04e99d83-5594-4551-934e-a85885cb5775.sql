-- Adicionar campo em_terceiros na tabela service_orders
ALTER TABLE public.service_orders 
ADD COLUMN em_terceiros BOOLEAN NOT NULL DEFAULT false;

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.service_orders.em_terceiros IS 'Indica se o veículo está em serviço terceirizado';