-- Recreate the client_service_history view with security_invoker enabled
-- This ensures RLS policies are enforced based on the querying user's permissions

DROP VIEW IF EXISTS public.client_service_history;

CREATE VIEW public.client_service_history 
WITH (security_invoker = on) AS
SELECT 
  so.id as service_order_id,
  so.order_number,
  so.status as order_status,
  so.created_at as order_date,
  so.completed_at,
  so.total,
  so.total_parts,
  so.total_labor,
  so.total_discount,
  so.payment_method,
  so.payment_status,
  so.diagnosis,
  so.problem_description,
  c.id as client_id,
  c.user_id,
  c.name as client_name,
  c.email as client_email,
  c.phone as client_phone,
  v.id as vehicle_id,
  v.brand as vehicle_brand,
  v.model as vehicle_model,
  v.plate as vehicle_plate,
  v.year as vehicle_year,
  v.color as vehicle_color,
  v.km as vehicle_km,
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', soi.id,
        'type', soi.type,
        'description', soi.description,
        'quantity', soi.quantity,
        'unit_price', soi.unit_price,
        'total_price', soi.total_price,
        'status', soi.status
      )
    )
    FROM public.service_order_items soi
    WHERE soi.service_order_id = so.id
  ) as items
FROM public.service_orders so
JOIN public.clients c ON so.client_id = c.id
JOIN public.vehicles v ON so.vehicle_id = v.id;