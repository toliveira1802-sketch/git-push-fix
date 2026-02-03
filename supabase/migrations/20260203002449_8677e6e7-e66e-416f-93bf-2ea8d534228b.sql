-- Fix 1: Recreate client_service_history VIEW with security_invoker = on
-- This ensures the view respects RLS policies of underlying tables

DROP VIEW IF EXISTS public.client_service_history;

CREATE VIEW public.client_service_history
WITH (security_invoker = on) AS
SELECT 
    c.id AS client_id,
    c.user_id,
    c.name AS client_name,
    c.phone AS client_phone,
    c.email AS client_email,
    v.id AS vehicle_id,
    v.plate AS vehicle_plate,
    v.brand AS vehicle_brand,
    v.model AS vehicle_model,
    v.color AS vehicle_color,
    v.year AS vehicle_year,
    v.km AS vehicle_km,
    so.id AS service_order_id,
    so.order_number,
    so.status AS order_status,
    so.created_at AS order_date,
    so.completed_at,
    so.problem_description,
    so.diagnosis,
    so.total,
    so.total_parts,
    so.total_labor,
    so.total_discount,
    so.payment_method,
    so.payment_status,
    (
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', soi.id,
                'description', soi.description,
                'type', soi.type,
                'quantity', soi.quantity,
                'unit_price', soi.unit_price,
                'total_price', soi.total_price,
                'status', soi.status
            )
        )
        FROM itens_ordem_servico soi
        WHERE soi.service_order_id = so.id
    ) AS items
FROM clientes c
LEFT JOIN veiculos v ON v.client_id = c.id
LEFT JOIN ordens_servico so ON so.vehicle_id = v.id;

-- Fix 2: Add unique constraint on user_id in clientes table
-- This prevents users from associating their user_id with multiple client records
ALTER TABLE public.clientes 
ADD CONSTRAINT clientes_user_id_unique UNIQUE (user_id);

-- Add comment for documentation
COMMENT ON VIEW public.client_service_history IS 'Aggregated view of client service history with security_invoker=on to inherit RLS from underlying tables';
COMMENT ON CONSTRAINT clientes_user_id_unique ON public.clientes IS 'Prevents users from associating their user_id with multiple client records - security measure';