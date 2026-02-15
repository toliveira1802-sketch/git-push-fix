
-- Tabela de Clientes
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  cpf TEXT,
  address TEXT,
  city TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  total_spent NUMERIC(10,2) DEFAULT 0,
  last_service_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Veículos (vinculados a clientes)
CREATE TABLE public.vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  color TEXT,
  plate TEXT NOT NULL,
  chassis TEXT,
  km INTEGER DEFAULT 0,
  fuel_type TEXT DEFAULT 'flex',
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Ordens de Serviço
CREATE TABLE public.service_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  client_id UUID NOT NULL REFERENCES public.clients(id),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id),
  mechanic_id UUID REFERENCES public.mechanics(id),
  status TEXT NOT NULL DEFAULT 'orcamento',
  priority TEXT DEFAULT 'normal',
  problem_description TEXT,
  diagnosis TEXT,
  observations TEXT,
  entry_km INTEGER,
  entry_checklist JSONB DEFAULT '{}',
  total_parts NUMERIC(10,2) DEFAULT 0,
  total_labor NUMERIC(10,2) DEFAULT 0,
  total_discount NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) DEFAULT 0,
  payment_status TEXT DEFAULT 'pendente',
  payment_method TEXT,
  estimated_completion TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Itens da Ordem de Serviço (peças e serviços)
CREATE TABLE public.service_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_order_id UUID NOT NULL REFERENCES public.service_orders(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'part' ou 'service'
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'orcamento', -- orcamento, aprovado, recusado, executado
  priority TEXT DEFAULT 'normal',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Agendamentos de Clientes
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id),
  vehicle_id UUID REFERENCES public.vehicles(id),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  service_type TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'agendado',
  origin TEXT DEFAULT 'sistema', -- sistema, whatsapp, telefone, site
  notes TEXT,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancel_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Histórico de eventos da OS
CREATE TABLE public.service_order_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_order_id UUID NOT NULL REFERENCES public.service_orders(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  description TEXT NOT NULL,
  user_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS em todas as tabelas
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_order_history ENABLE ROW LEVEL SECURITY;

-- Policies para CLIENTES
CREATE POLICY "Admin/gestao podem gerenciar clientes"
ON public.clients FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestao') OR has_role(auth.uid(), 'dev'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestao') OR has_role(auth.uid(), 'dev'));

CREATE POLICY "Autenticados podem ver clientes"
ON public.clients FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Policies para VEÍCULOS
CREATE POLICY "Admin/gestao podem gerenciar veículos"
ON public.vehicles FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestao') OR has_role(auth.uid(), 'dev'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestao') OR has_role(auth.uid(), 'dev'));

CREATE POLICY "Autenticados podem ver veículos"
ON public.vehicles FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Policies para ORDENS DE SERVIÇO
CREATE POLICY "Admin/gestao podem gerenciar OS"
ON public.service_orders FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestao') OR has_role(auth.uid(), 'dev'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestao') OR has_role(auth.uid(), 'dev'));

CREATE POLICY "Autenticados podem ver OS"
ON public.service_orders FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Policies para ITENS DA OS
CREATE POLICY "Admin/gestao podem gerenciar itens OS"
ON public.service_order_items FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestao') OR has_role(auth.uid(), 'dev'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestao') OR has_role(auth.uid(), 'dev'));

CREATE POLICY "Autenticados podem ver itens OS"
ON public.service_order_items FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Policies para AGENDAMENTOS
CREATE POLICY "Admin/gestao podem gerenciar agendamentos"
ON public.appointments FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestao') OR has_role(auth.uid(), 'dev'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestao') OR has_role(auth.uid(), 'dev'));

CREATE POLICY "Autenticados podem ver agendamentos"
ON public.appointments FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Policies para HISTÓRICO
CREATE POLICY "Admin/gestao podem gerenciar histórico"
ON public.service_order_history FOR ALL
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestao') OR has_role(auth.uid(), 'dev'))
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestao') OR has_role(auth.uid(), 'dev'));

CREATE POLICY "Autenticados podem ver histórico"
ON public.service_order_history FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Triggers para updated_at
CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at
BEFORE UPDATE ON public.vehicles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_orders_updated_at
BEFORE UPDATE ON public.service_orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_vehicles_client_id ON public.vehicles(client_id);
CREATE INDEX idx_vehicles_plate ON public.vehicles(plate);
CREATE INDEX idx_service_orders_client_id ON public.service_orders(client_id);
CREATE INDEX idx_service_orders_vehicle_id ON public.service_orders(vehicle_id);
CREATE INDEX idx_service_orders_status ON public.service_orders(status);
CREATE INDEX idx_service_orders_order_number ON public.service_orders(order_number);
CREATE INDEX idx_service_order_items_order_id ON public.service_order_items(service_order_id);
CREATE INDEX idx_appointments_client_id ON public.appointments(client_id);
CREATE INDEX idx_appointments_date ON public.appointments(scheduled_date);
CREATE INDEX idx_appointments_status ON public.appointments(status);

-- Função para gerar número da OS automaticamente
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  new_number TEXT;
  year_prefix TEXT;
  last_number INTEGER;
BEGIN
  year_prefix := TO_CHAR(NOW(), 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 6) AS INTEGER)), 0)
  INTO last_number
  FROM public.service_orders
  WHERE order_number LIKE year_prefix || '-%';
  
  new_number := year_prefix || '-' || LPAD((last_number + 1)::TEXT, 5, '0');
  NEW.order_number := new_number;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER set_order_number
BEFORE INSERT ON public.service_orders
FOR EACH ROW
WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
EXECUTE FUNCTION public.generate_order_number();
