-- Adicionar coluna company_id na tabela mechanics
ALTER TABLE public.mechanics
ADD COLUMN company_id UUID REFERENCES public.companies(id);

-- Criar índice para melhor performance
CREATE INDEX idx_mechanics_company_id ON public.mechanics(company_id);

-- Comentário para documentação
COMMENT ON COLUMN public.mechanics.company_id IS 'Empresa/unidade a que o mecânico pertence';