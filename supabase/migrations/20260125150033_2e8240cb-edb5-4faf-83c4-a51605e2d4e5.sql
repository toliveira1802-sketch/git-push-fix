-- Tabela para salvar snapshots da agenda dos mecânicos
CREATE TABLE public.agenda_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data_agenda DATE NOT NULL,
  snapshot JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.agenda_snapshots ENABLE ROW LEVEL SECURITY;

-- Políticas: admins podem ver e criar snapshots
CREATE POLICY "Admins can view snapshots" 
ON public.agenda_snapshots 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestao') OR public.has_role(auth.uid(), 'dev'));

CREATE POLICY "Admins can create snapshots" 
ON public.agenda_snapshots 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestao') OR public.has_role(auth.uid(), 'dev'));

-- Índice para busca por data
CREATE INDEX idx_agenda_snapshots_data ON public.agenda_snapshots(data_agenda);

-- Tabela para pendências (B.O em Peça)
CREATE TABLE public.pendencias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL DEFAULT 'bo_peca',
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  service_order_id UUID REFERENCES public.service_orders(id),
  vehicle_plate VARCHAR(20),
  mechanic_id UUID REFERENCES public.mechanics(id),
  status VARCHAR(50) NOT NULL DEFAULT 'pendente',
  prioridade VARCHAR(20) DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.pendencias ENABLE ROW LEVEL SECURITY;

-- Políticas para pendências
CREATE POLICY "Admins can manage pendencias" 
ON public.pendencias 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestao') OR public.has_role(auth.uid(), 'dev'));

-- Enable realtime para agenda_mecanicos
ALTER PUBLICATION supabase_realtime ADD TABLE public.agenda_mecanicos;