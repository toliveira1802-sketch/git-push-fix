-- Função para atualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Tabela de mecânicos
CREATE TABLE public.mechanics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de etapas do workflow operacional
CREATE TABLE public.workflow_etapas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  ordem INTEGER NOT NULL,
  cor TEXT NOT NULL DEFAULT '#3b82f6',
  icone TEXT NOT NULL DEFAULT 'clock',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir etapas padrão do workflow
INSERT INTO public.workflow_etapas (nome, ordem, cor, icone) VALUES
  ('Diagnóstico', 1, '#8b5cf6', 'search'),
  ('Orçamento', 2, '#f59e0b', 'file-text'),
  ('Aguardando Aprovação', 3, '#eab308', 'clock'),
  ('Aguardando Peças', 4, '#f97316', 'package'),
  ('Pronto Iniciar', 5, '#3b82f6', 'check-circle'),
  ('Em Execução', 6, '#10b981', 'wrench'),
  ('Pronto Retirada', 7, '#22c55e', 'car');

-- Tabela de agenda dos mecânicos
CREATE TABLE public.agenda_mecanicos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mechanic_id UUID NOT NULL REFERENCES public.mechanics(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  vehicle_id UUID,
  tipo TEXT NOT NULL DEFAULT 'normal' CHECK (tipo IN ('normal', 'encaixe')),
  status TEXT NOT NULL DEFAULT 'agendado' CHECK (status IN ('agendado', 'em_andamento', 'concluido', 'cancelado')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(mechanic_id, data, hora_inicio)
);

-- Tabela de feedback diário dos mecânicos
CREATE TABLE public.mechanic_daily_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mechanic_id UUID NOT NULL REFERENCES public.mechanics(id) ON DELETE CASCADE,
  feedback_date DATE NOT NULL,
  given_by UUID REFERENCES auth.users(id),
  performance_score INTEGER NOT NULL CHECK (performance_score >= 1 AND performance_score <= 5),
  punctuality_score INTEGER NOT NULL CHECK (punctuality_score >= 1 AND punctuality_score <= 5),
  quality_score INTEGER NOT NULL CHECK (quality_score >= 1 AND quality_score <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(mechanic_id, feedback_date)
);

-- Tabela de configurações do sistema
CREATE TABLE public.system_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir configurações padrão
INSERT INTO public.system_config (key, value) VALUES
  ('patio_capacidade', '{"maxima": 20}'),
  ('meta_mensal', '{"valor": 100000, "dias_uteis": 22}');

-- Enable RLS
ALTER TABLE public.mechanics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_etapas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_mecanicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mechanic_daily_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Políticas para mechanics (admin/gestao podem gerenciar)
CREATE POLICY "Todos autenticados podem ver mecânicos" ON public.mechanics
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin/gestao podem gerenciar mecânicos" ON public.mechanics
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestao') OR public.has_role(auth.uid(), 'dev'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestao') OR public.has_role(auth.uid(), 'dev'));

-- Políticas para workflow_etapas
CREATE POLICY "Todos autenticados podem ver etapas" ON public.workflow_etapas
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin/gestao podem gerenciar etapas" ON public.workflow_etapas
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestao') OR public.has_role(auth.uid(), 'dev'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestao') OR public.has_role(auth.uid(), 'dev'));

-- Políticas para agenda_mecanicos
CREATE POLICY "Todos autenticados podem ver agenda" ON public.agenda_mecanicos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin/gestao podem gerenciar agenda" ON public.agenda_mecanicos
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestao') OR public.has_role(auth.uid(), 'dev'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestao') OR public.has_role(auth.uid(), 'dev'));

-- Políticas para mechanic_daily_feedback
CREATE POLICY "Todos autenticados podem ver feedbacks" ON public.mechanic_daily_feedback
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin/gestao podem gerenciar feedbacks" ON public.mechanic_daily_feedback
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestao') OR public.has_role(auth.uid(), 'dev'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestao') OR public.has_role(auth.uid(), 'dev'));

-- Políticas para system_config
CREATE POLICY "Todos autenticados podem ver config" ON public.system_config
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin/gestao podem gerenciar config" ON public.system_config
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestao') OR public.has_role(auth.uid(), 'dev'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestao') OR public.has_role(auth.uid(), 'dev'));

-- Triggers para atualizar updated_at
CREATE TRIGGER update_mechanics_updated_at
  BEFORE UPDATE ON public.mechanics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at
  BEFORE UPDATE ON public.system_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();