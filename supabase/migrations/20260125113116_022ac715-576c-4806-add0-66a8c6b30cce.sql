-- Adicionar campos na tabela clients para controle de origem do cadastro
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS registration_source text NOT NULL DEFAULT 'admin',
ADD COLUMN IF NOT EXISTS pending_review boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS reviewed_by uuid;

-- Adicionar comentários para documentação
COMMENT ON COLUMN public.clients.registration_source IS 'Origem do cadastro: admin (pela oficina) ou self (auto-cadastro pelo cliente)';
COMMENT ON COLUMN public.clients.pending_review IS 'Se true, aguarda ação/revisão do gestor';
COMMENT ON COLUMN public.clients.user_id IS 'Vínculo com usuário autenticado (para auto-cadastros)';

-- Adicionar campos de fidelização na tabela profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS loyalty_points integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS loyalty_level text NOT NULL DEFAULT 'bronze',
ADD COLUMN IF NOT EXISTS birthday date;

-- Criar índice para buscar clientes pendentes de revisão
CREATE INDEX IF NOT EXISTS idx_clients_pending_review ON public.clients(pending_review) WHERE pending_review = true;

-- Criar índice para buscar clientes por user_id
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id) WHERE user_id IS NOT NULL;