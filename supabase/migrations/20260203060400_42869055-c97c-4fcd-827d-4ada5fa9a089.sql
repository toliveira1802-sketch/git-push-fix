-- Tabela para veículos órfãos (sem proprietário vinculado)
CREATE TABLE public.veiculos_orfaos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id_original text, -- ID original do CSV para referência futura
  marca text,
  modelo text,
  versao text,
  ano text,
  cor text,
  placa text,
  chassi text,
  km integer,
  combustivel text,
  notas text,
  origem_contato text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.veiculos_orfaos ENABLE ROW LEVEL SECURITY;

-- Apenas admin/gestao/dev podem gerenciar veículos órfãos
CREATE POLICY "Admin/gestao podem gerenciar veiculos_orfaos"
ON public.veiculos_orfaos
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'dev'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gestao'::app_role) OR has_role(auth.uid(), 'dev'::app_role));

-- Visualização para todos autenticados
CREATE POLICY "Todos autenticados podem ver veiculos_orfaos"
ON public.veiculos_orfaos
FOR SELECT
USING (true);

-- Índices
CREATE INDEX idx_veiculos_orfaos_placa ON public.veiculos_orfaos(placa);
CREATE INDEX idx_veiculos_orfaos_client_id_original ON public.veiculos_orfaos(client_id_original);