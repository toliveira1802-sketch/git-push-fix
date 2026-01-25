-- Habilitar realtime para as tabelas de ordens de serviço
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_order_items;