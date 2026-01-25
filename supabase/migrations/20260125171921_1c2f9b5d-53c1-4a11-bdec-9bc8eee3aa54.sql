-- Add new columns to service_order_items for complete budget functionality
-- Following the spec from ANALISE_ORCAMENTO.md

-- Add cost column (custo da peça/serviço para cálculo de margem)
ALTER TABLE public.service_order_items 
ADD COLUMN IF NOT EXISTS cost_price numeric DEFAULT 0;

-- Add suggested price (valor calculado automaticamente com margem padrão)
ALTER TABLE public.service_order_items 
ADD COLUMN IF NOT EXISTS suggested_price numeric;

-- Add applied margin percentage
ALTER TABLE public.service_order_items 
ADD COLUMN IF NOT EXISTS margin_percent numeric DEFAULT 40;

-- Add refusal reason (when status = 'recusado')
ALTER TABLE public.service_order_items 
ADD COLUMN IF NOT EXISTS refusal_reason text;

-- Add discount justification (when margin < standard)
ALTER TABLE public.service_order_items 
ADD COLUMN IF NOT EXISTS discount_justification text;

-- Add estimated return date (for non-urgent items)
ALTER TABLE public.service_order_items 
ADD COLUMN IF NOT EXISTS estimated_return_date date;

-- Add budget version for multi-tier quotes (premium, standard, eco)
ALTER TABLE public.service_order_items 
ADD COLUMN IF NOT EXISTS budget_tier text DEFAULT 'standard' CHECK (budget_tier IN ('premium', 'standard', 'eco'));

-- Update priority to use the correct values (verde, amarelo, vermelho)
-- First drop the existing constraint if any
ALTER TABLE public.service_order_items 
DROP CONSTRAINT IF EXISTS service_order_items_priority_check;

-- Add constraint for priority values
ALTER TABLE public.service_order_items 
ADD CONSTRAINT service_order_items_priority_check 
CHECK (priority IN ('verde', 'amarelo', 'vermelho', 'normal'));

-- Update existing 'normal' priorities to 'amarelo'
UPDATE public.service_order_items 
SET priority = 'amarelo' 
WHERE priority = 'normal';

-- Add columns to service_orders for budget tracking
ALTER TABLE public.service_orders 
ADD COLUMN IF NOT EXISTS budget_sent_at timestamp with time zone;

ALTER TABLE public.service_orders 
ADD COLUMN IF NOT EXISTS budget_approved_at timestamp with time zone;

ALTER TABLE public.service_orders 
ADD COLUMN IF NOT EXISTS approved_total numeric DEFAULT 0;

-- Create index for faster queries on budget tier
CREATE INDEX IF NOT EXISTS idx_service_order_items_budget_tier 
ON public.service_order_items(budget_tier);

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_service_order_items_status 
ON public.service_order_items(status);

-- Create index for priority filtering
CREATE INDEX IF NOT EXISTS idx_service_order_items_priority 
ON public.service_order_items(priority);