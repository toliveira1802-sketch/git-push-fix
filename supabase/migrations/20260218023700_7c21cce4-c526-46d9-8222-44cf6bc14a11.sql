
-- Fix order number generation to be non-sequential (prevent enumeration attacks)
-- Use a random 6-char alphanumeric suffix instead of sequential numbers
CREATE OR REPLACE FUNCTION public.generate_order_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_number TEXT;
  year_prefix TEXT;
  random_suffix TEXT;
  attempts INTEGER := 0;
BEGIN
  year_prefix := TO_CHAR(NOW(), 'YYYY');
  
  -- Generate a random 6-character alphanumeric suffix to prevent enumeration
  LOOP
    random_suffix := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 6));
    new_number := year_prefix || '-' || random_suffix;
    
    -- Ensure uniqueness
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.ordens_servico WHERE order_number = new_number
    );
    
    attempts := attempts + 1;
    IF attempts > 100 THEN
      -- Fallback: use timestamp-based suffix
      random_suffix := UPPER(SUBSTRING(MD5(NOW()::TEXT || RANDOM()::TEXT) FROM 1 FOR 6));
      new_number := year_prefix || '-' || random_suffix;
      EXIT;
    END IF;
  END LOOP;
  
  NEW.order_number := new_number;
  RETURN NEW;
END;
$function$;
