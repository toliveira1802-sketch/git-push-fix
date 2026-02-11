-- =====================================================
-- TESTE REAL: Doctor Auto - Dados de Teste Completos
-- =====================================================
-- Este script cria um cenário completo de teste incluindo:
-- - Empresa, usuários, colaboradores
-- - Cliente com veículos
-- - Ordem de serviço com itens
-- - Agendamentos
-- =====================================================

-- 0. LIMPEZA (OPCIONAL - descomente se precisar resetar)
-- DELETE FROM itens_ordem_servico WHERE service_order_id IN (SELECT id FROM ordens_servico WHERE client_id LIKE 'test%');
-- DELETE FROM ordens_servico WHERE client_id LIKE 'test%';
-- DELETE FROM agendamentos WHERE client_id LIKE 'test%';
-- DELETE FROM veiculos WHERE client_id LIKE 'test%';
-- DELETE FROM clientes_metricas WHERE cliente_id LIKE 'test%';
-- DELETE FROM clientes_crm WHERE cliente_id LIKE 'test%';
-- DELETE FROM clientes WHERE id LIKE 'test%';

-- =====================================================
-- 1. EMPRESA (Doctor Auto Bosch)
-- =====================================================
-- Primeiro, vamos usar ou criar uma empresa padrão
INSERT INTO empresas (name, code, cnpj, razao_social, telefone, is_active, hora_abertura, hora_fechamento, dias_atendimento, meta_diaria, meta_mensal)
VALUES (
  'Doctor Auto Bosch',
  'DAB',
  '12.345.678/0001-90',
  'Doctor Auto Bosch Serviços Automotivos LTDA',
  '(11) 3000-0000',
  true,
  '08:00',
  '18:30',
  ARRAY['seg', 'ter', 'qua', 'qui', 'sex', 'sab'],
  5000.00,
  100000.00
)
ON CONFLICT (code) DO UPDATE SET
  hora_abertura = '08:00',
  hora_fechamento = '18:30'
RETURNING id;

-- Obtém o ID da empresa (você pode usar este ID depois)
-- Para usar em queries: SELECT id FROM empresas WHERE code = 'DAB' LIMIT 1;

-- =====================================================
-- 2. MECÂNICOS
-- =====================================================
INSERT INTO mecanicos (name, company_id, phone, especialidade, grau_conhecimento, specialty, qtde_positivos, qtde_negativos, is_active)
SELECT
  'João da Silva',
  id as company_id,
  '(11) 98765-4321',
  'Motor e Transmissão',
  'Especialista',
  'Motor TSI',
  15,
  1,
  true
FROM empresas WHERE code = 'DAB'
ON CONFLICT DO NOTHING;

INSERT INTO mecanicos (name, company_id, phone, especialidade, grau_conhecimento, specialty, qtde_positivos, qtde_negativos, is_active)
SELECT
  'Maria Santos',
  id as company_id,
  '(11) 98765-4322',
  'Suspensão e Freios',
  'Especialista',
  'Freios ABS',
  12,
  0,
  true
FROM empresas WHERE code = 'DAB'
ON CONFLICT DO NOTHING;

-- =====================================================
-- 3. CLIENTE DE TESTE
-- =====================================================
INSERT INTO clientes (
  id,
  name,
  phone,
  email,
  cpf,
  address,
  city,
  data_aniversario,
  empresa_id,
  status,
  pending_review,
  reviewed_at,
  reviewed_by,
  registration_source,
  notes,
  created_at,
  updated_at
)
SELECT
  'test-client-001',
  'Pedro Oliveira Silva',
  '(11) 99999-8888',
  'pedro.oliveira@email.com',
  '123.456.789-00',
  'Rua das Flores, 123',
  'São Paulo',
  '1985-05-15',
  id,
  'active',
  false,
  NOW(),
  'admin',
  'walk-in',
  'Cliente VIP - Gosta de fazer manutenção preventiva',
  NOW(),
  NOW()
FROM empresas WHERE code = 'DAB'
ON CONFLICT (id) DO NOTHING;

-- 3.1 CRM do Cliente
INSERT INTO clientes_crm (
  cliente_id,
  status_crm,
  nivel_satisfacao,
  origem,
  motivo_contato,
  indicacoes_feitas,
  indicado_por,
  tags,
  preferencias,
  reclamacoes,
  proximo_contato,
  ultima_interacao,
  created_at,
  updated_at
)
VALUES (
  'test-client-001',
  'ativo',
  'muito_satisfeito',
  'indicacao',
  'Manutenção preventiva',
  2,
  'João Costa',
  ARRAY['vip', 'preventiva', 'leal'],
  ARRAY['horario_matinal', 'agendamento_rapido'],
  0,
  NOW() + INTERVAL '30 days',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (cliente_id) DO UPDATE SET
  ultima_interacao = NOW()
RETURNING cliente_id;

-- 3.2 Métricas do Cliente
INSERT INTO clientes_metricas (
  cliente_id,
  total_spent,
  total_ordens,
  ticket_medio,
  last_service_date,
  dias_sem_visita,
  total_veiculos,
  valor_medio_mao_obra,
  valor_medio_peca,
  created_at,
  updated_at
)
VALUES (
  'test-client-001',
  4500.00,
  5,
  900.00,
  NOW() - INTERVAL '45 days',
  45,
  2,
  850.00,
  1200.00,
  NOW(),
  NOW()
)
ON CONFLICT (cliente_id) DO UPDATE SET
  total_spent = 4500.00,
  total_ordens = 5,
  dias_sem_visita = 45,
  updated_at = NOW()
RETURNING cliente_id;

-- =====================================================
-- 4. VEÍCULOS DO CLIENTE
-- =====================================================
INSERT INTO veiculos (
  id,
  client_id,
  plate,
  brand,
  model,
  year,
  color,
  chassis,
  versao,
  fuel_type,
  km,
  ultimo_km,
  origem_contato,
  notes,
  is_active,
  created_at,
  updated_at
)
VALUES (
  'test-vehicle-001',
  'test-client-001',
  'ABC-1234',
  'Volkswagen',
  'T-Cross',
  2021,
  'Prata',
  '9BWAA01010A123456',
  '1.4 TSI Automática',
  'gasolina',
  67450,
  67450,
  'cliente',
  'Carro principal - Uso frequente em cidade',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (plate) DO UPDATE SET
  km = 67450,
  ultimo_km = 67450
RETURNING id;

INSERT INTO veiculos (
  id,
  client_id,
  plate,
  brand,
  model,
  year,
  color,
  chassis,
  versao,
  fuel_type,
  km,
  ultimo_km,
  origem_contato,
  notes,
  is_active,
  created_at,
  updated_at
)
VALUES (
  'test-vehicle-002',
  'test-client-001',
  'XYZ-9999',
  'Chevrolet',
  'Onix',
  2019,
  'Preto',
  '9BWAA01010A654321',
  '1.0 Flex',
  'flex',
  92300,
  92300,
  'cliente',
  'Segundo veículo - Carro de passeio',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (plate) DO UPDATE SET
  km = 92300,
  ultimo_km = 92300
RETURNING id;

-- =====================================================
-- 5. ORDEM DE SERVIÇO ABERTA (STATUS: diagnostico)
-- =====================================================
INSERT INTO ordens_servico (
  id,
  order_number,
  client_id,
  vehicle_id,
  status,
  diagnosis,
  problem_description,
  observations,
  mechanic_id,
  priority,
  em_terceiros,
  entry_km,
  total,
  total_labor,
  total_parts,
  total_discount,
  approved_total,
  payment_method,
  payment_status,
  budget_sent_at,
  budget_approved_at,
  estimated_completion,
  completed_at,
  created_at,
  updated_at
)
SELECT
  'test-os-001',
  'OS-2026-0001',
  'test-client-001',
  'test-vehicle-001',
  'diagnostico',
  NULL,
  'Cliente relata barulho estranho no motor durante aceleração. Possível carbonização ou válvulas sujas.',
  'Aguardando diagnóstico completo. Cliente está disponível para deixar o carro.',
  m.id,
  'alta',
  false,
  67450,
  0.00,
  0.00,
  0.00,
  0.00,
  0.00,
  NULL,
  'nao_iniciado',
  NULL,
  NULL,
  NOW() + INTERVAL '2 days',
  NULL,
  NOW(),
  NOW()
FROM mecanicos m WHERE m.name = 'João da Silva' LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- 5.1 ITENS DA OS (Serviços a fazer)
INSERT INTO itens_ordem_servico (
  id,
  service_order_id,
  type,
  description,
  quantity,
  unit_price,
  total_price,
  status,
  cost_price,
  margin_percent,
  suggested_price,
  budget_tier,
  priority,
  notes,
  created_at
)
VALUES
  -- Item 1: Diagnóstico
  (
    'test-os-001-item-001',
    'test-os-001',
    'servico',
    'Diagnóstico eletrônico e limpeza do motor',
    1,
    150.00,
    150.00,
    'pendente',
    50.00,
    66.67,
    150.00,
    'basico',
    'alta',
    'Inclui scanner e verificação de códigos de falha',
    NOW()
  ),
  -- Item 2: Serviço sugerido (Carbonização)
  (
    'test-os-001-item-002',
    'test-os-001',
    'servico',
    'Limpeza de carbonização - Motor TSI com ultrassom',
    1,
    500.00,
    500.00,
    'pendente',
    200.00,
    60.00,
    500.00,
    'recomendado',
    'alta',
    'Com {km} km, a carbonização no TSI afeta performance. Serviço recomendado.',
    NOW()
  ),
  -- Item 3: Peça
  (
    'test-os-001-item-003',
    'test-os-001',
    'peca',
    'Óleo Mobil 0W-30 (5L) - Volkswagen Original',
    1,
    320.00,
    320.00,
    'pendente',
    150.00,
    53.33,
    320.00,
    'basico',
    'media',
    'Óleo de troca conforme especificação do fabricante',
    NOW()
  ),
  -- Item 4: Peça
  (
    'test-os-001-item-004',
    'test-os-001',
    'peca',
    'Filtro de Óleo - Volkswagen Original',
    1,
    95.00,
    95.00,
    'pendente',
    35.00,
    63.16,
    95.00,
    'basico',
    'media',
    'Filtro original',
    NOW()
  );

-- 5.2 HISTÓRICO DA OS
INSERT INTO historico_ordem_servico (
  id,
  service_order_id,
  event_type,
  description,
  metadata,
  user_id,
  created_at
)
VALUES
  (
    'test-os-history-001',
    'test-os-001',
    'criacao',
    'Ordem de serviço criada pelo sistema',
    jsonb_build_object(
      'usuario' => 'admin@doctorauto.com',
      'origem' => 'walk-in',
      'km_entrada' => 67450
    ),
    NULL,
    NOW()
  ),
  (
    'test-os-history-002',
    'test-os-001',
    'diagnostico_iniciado',
    'Diagnóstico iniciado por João da Silva',
    jsonb_build_object(
      'mecanico' => 'João da Silva',
      'observacoes' => 'Cliente relatou barulho no motor'
    ),
    NULL,
    NOW() + INTERVAL '1 minute'
  );

-- =====================================================
-- 6. SEGUNDA OS (APROVADA - STATUS: em_execucao)
-- =====================================================
INSERT INTO ordens_servico (
  id,
  order_number,
  client_id,
  vehicle_id,
  status,
  diagnosis,
  problem_description,
  observations,
  mechanic_id,
  priority,
  em_terceiros,
  entry_km,
  total,
  total_labor,
  total_parts,
  total_discount,
  approved_total,
  payment_method,
  payment_status,
  budget_sent_at,
  budget_approved_at,
  estimated_completion,
  completed_at,
  created_at,
  updated_at
)
SELECT
  'test-os-002',
  'OS-2026-0002',
  'test-client-001',
  'test-vehicle-002',
  'em_execucao',
  'Pastilhas de freio dianteiras gastas - necessita troca urgente',
  'Cliente ouviu barulho de metal ao frear - Possível desgaste das pastilhas',
  'OS aprovada e em execução. Cliente será contatado para entrega.',
  m.id,
  'alta',
  false,
  92300,
  800.00,
  300.00,
  500.00,
  50.00,
  750.00,
  'credito',
  'pendente',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '3 days',
  NOW() + INTERVAL '1 day',
  NULL,
  NOW() - INTERVAL '10 days',
  NOW()
FROM mecanicos m WHERE m.name = 'Maria Santos' LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- 6.1 ITENS DA OS 2
INSERT INTO itens_ordem_servico (
  id,
  service_order_id,
  type,
  description,
  quantity,
  unit_price,
  total_price,
  status,
  cost_price,
  margin_percent,
  suggested_price,
  budget_tier,
  priority,
  notes,
  created_at
)
VALUES
  (
    'test-os-002-item-001',
    'test-os-002',
    'peca',
    'Jogo de Pastilhas de Freio Dianteiras - Bosch',
    1,
    420.00,
    420.00,
    'entregue',
    200.00,
    52.38,
    420.00,
    'basico',
    'alta',
    'Pastilhas Bosch Original - Qualidade premium',
    NOW()
  ),
  (
    'test-os-002-item-002',
    'test-os-002',
    'servico',
    'Instalação de Pastilhas de Freio (mão de obra)',
    1,
    300.00,
    300.00,
    'entregue',
    100.00,
    66.67,
    300.00,
    'basico',
    'alta',
    'Inclui verificação de discos e alinhamento',
    NOW()
  ),
  (
    'test-os-002-item-003',
    'test-os-002',
    'peca',
    'Disco de Freio Dianteiro Direito - Bosch',
    1,
    280.00,
    280.00,
    'pendente_entrega',
    150.00,
    46.43,
    280.00,
    'opcional',
    'media',
    'Disco apresenta desgaste - Recomendado trocar em breve',
    NOW()
  );

-- =====================================================
-- 7. AGENDAMENTOS
-- =====================================================
INSERT INTO agendamentos (
  id,
  client_id,
  vehicle_id,
  scheduled_date,
  scheduled_time,
  service_type,
  status,
  description,
  notes,
  origin,
  confirmed_at,
  created_at,
  updated_at
)
VALUES
  (
    'test-appt-001',
    'test-client-001',
    'test-vehicle-001',
    CURRENT_DATE + INTERVAL '3 days',
    '09:00',
    'diagnóstico',
    'confirmado',
    'Diagnóstico do barulho no motor',
    'Cliente preferencia manhã. Deixará o carro o dia todo.',
    'call',
    NOW(),
    NOW(),
    NOW()
  ),
  (
    'test-appt-002',
    'test-client-001',
    'test-vehicle-002',
    CURRENT_DATE + INTERVAL '2 days',
    '14:00',
    'preventiva',
    'confirmado',
    'Revisão preventiva 10k km',
    'Cliente está com 92.300 km. Agendamento preventivo.',
    'whatsapp',
    NOW(),
    NOW(),
    NOW()
  );

-- =====================================================
-- 8. RECURSO (PÁTIO/EQUIPAMENTO)
-- =====================================================
INSERT INTO recursos (
  id,
  nome,
  empresa_id,
  tipo,
  is_active,
  horas_utilizadas_mes,
  ultima_manutencao,
  valor_produzido_mes,
  created_at,
  updated_at
)
SELECT
  'test-recurso-001',
  'Pátio - Setor A',
  empresas.id,
  'patio',
  true,
  120,
  NOW() - INTERVAL '20 days',
  15000.00,
  NOW(),
  NOW()
FROM empresas WHERE code = 'DAB'
ON CONFLICT DO NOTHING;

-- =====================================================
-- 9. INFORMAÇÕES ÚTEIS PARA TESTE
-- =====================================================
-- Para fazer login com colaborador, você precisa:
-- 1. Fazer login via Supabase Auth com email e senha
-- 2. Depois associar uma role ao user_id

-- Exemplo: Se seu user_id é "xyz123abc", inserir:
-- INSERT INTO user_roles (user_id, role) VALUES ('xyz123abc', 'gestao');

-- Para consultar seus dados de teste:
-- SELECT * FROM clientes WHERE id = 'test-client-001';
-- SELECT * FROM veiculos WHERE client_id = 'test-client-001';
-- SELECT * FROM ordens_servico WHERE client_id = 'test-client-001';

-- =====================================================
-- FIM DOS DADOS DE TESTE
-- =====================================================
