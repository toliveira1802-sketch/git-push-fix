-- Add CRM fields to clients table
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS status_crm text DEFAULT 'ativo',
ADD COLUMN IF NOT EXISTS origem text DEFAULT 'direto',
ADD COLUMN IF NOT EXISTS ultima_interacao timestamp with time zone,
ADD COLUMN IF NOT EXISTS indicacoes_feitas integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS indicado_por uuid REFERENCES public.clients(id),
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS proximo_contato date,
ADD COLUMN IF NOT EXISTS motivo_contato text,
ADD COLUMN IF NOT EXISTS nivel_satisfacao integer CHECK (nivel_satisfacao >= 1 AND nivel_satisfacao <= 5),
ADD COLUMN IF NOT EXISTS preferencias text,
ADD COLUMN IF NOT EXISTS data_aniversario date,
ADD COLUMN IF NOT EXISTS reclamacoes integer DEFAULT 0;

-- Create index for CRM status filtering
CREATE INDEX IF NOT EXISTS idx_clients_status_crm ON public.clients(status_crm);
CREATE INDEX IF NOT EXISTS idx_clients_proximo_contato ON public.clients(proximo_contato);
CREATE INDEX IF NOT EXISTS idx_clients_tags ON public.clients USING GIN(tags);

-- Add comment for documentation
COMMENT ON COLUMN public.clients.status_crm IS 'CRM status: lead, ativo, em_risco, inativo, perdido';
COMMENT ON COLUMN public.clients.origem IS 'Lead source: indicacao, redes_sociais, google, passando, direto';
COMMENT ON COLUMN public.clients.nivel_satisfacao IS 'Customer satisfaction 1-5 stars';