-- Criar tabela companies para configurações por unidade
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL, -- POMBAL, CENTRO, MATRIZ
  name text NOT NULL,
  hora_abertura time NOT NULL DEFAULT '08:00',
  hora_fechamento time NOT NULL DEFAULT '18:00',
  dias_atendimento text[] NOT NULL DEFAULT ARRAY['seg', 'ter', 'qua', 'qui', 'sex', 'sab'],
  meta_mensal numeric DEFAULT 0,
  meta_diaria numeric DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Todos autenticados podem ver companies"
ON public.companies
FOR SELECT
USING (true);

CREATE POLICY "Admin/gestao podem gerenciar companies"
ON public.companies
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'dev'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'dev'::app_role));

-- Trigger para updated_at
CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir as unidades iniciais
INSERT INTO public.companies (code, name, hora_abertura, hora_fechamento, dias_atendimento)
VALUES 
  ('POMBAL', 'Unidade Pombal', '08:00', '18:00', ARRAY['seg', 'ter', 'qua', 'qui', 'sex', 'sab']),
  ('CENTRO', 'Unidade Centro', '08:00', '18:00', ARRAY['seg', 'ter', 'qua', 'qui', 'sex', 'sab']),
  ('MATRIZ', 'Matriz', '08:00', '18:00', ARRAY['seg', 'ter', 'qua', 'qui', 'sex', 'sab']);