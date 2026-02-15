-- =====================================================
-- MIGRATION: Sistema Simone - IA Central Doctor Auto
-- Data: 2026-01-26
-- =====================================================

-- 1. CONFIGURAÇÃO GERAL DA SIMONE
CREATE TABLE IF NOT EXISTS simone_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) DEFAULT 'Simone',
  ativa BOOLEAN DEFAULT true,
  prompt_sistema TEXT NOT NULL,
  tom_voz VARCHAR(50) DEFAULT 'amigável e profissional',
  usa_emoji BOOLEAN DEFAULT true,
  horario_inicio TIME DEFAULT '00:00',
  horario_fim TIME DEFAULT '23:59',
  tempo_alerta_qualificacao INTEGER DEFAULT 30, -- minutos
  tempo_alerta_atendimento INTEGER DEFAULT 120, -- minutos
  tempo_alerta_followup INTEGER DEFAULT 2880, -- minutos (48h)
  desconto_maximo DECIMAL(5,2) DEFAULT 15.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE SERVIÇOS
CREATE TABLE IF NOT EXISTS simone_servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(200) NOT NULL,
  descricao TEXT,
  preco_minimo DECIMAL(10,2),
  preco_maximo DECIMAL(10,2),
  tempo_estimado VARCHAR(50), -- ex: "2-3 horas"
  km_recomendado INTEGER, -- km para sugerir o serviço
  categoria VARCHAR(100), -- revisão, freios, suspensão, etc.
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. REGRAS DE UPSELL
CREATE TABLE IF NOT EXISTS simone_upsell (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(200) NOT NULL,
  condicao_carro TEXT, -- ex: "T-Cross TSI, Polo TSI, Virtus TSI"
  condicao_km_min INTEGER, -- km mínimo para sugerir
  condicao_km_max INTEGER, -- km máximo
  servico_sugerido_id UUID REFERENCES simone_servicos(id),
  frase_upsell TEXT NOT NULL,
  frase_recusa TEXT, -- o que dizer se cliente recusar
  desconto_permitido DECIMAL(5,2) DEFAULT 10.00,
  prioridade INTEGER DEFAULT 1, -- 1 = alta, 2 = média, 3 = baixa
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. FRASES PADRÃO
CREATE TABLE IF NOT EXISTS simone_frases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(50) NOT NULL, -- saudacao, followup, urgente, pos_venda, etc.
  nome VARCHAR(100) NOT NULL,
  conteudo TEXT NOT NULL,
  variaveis TEXT, -- ex: "{nome}, {carro}, {servico}"
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. HISTÓRICO DE AÇÕES DA SIMONE
CREATE TABLE IF NOT EXISTS simone_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id VARCHAR(50) NOT NULL, -- ID do lead no Kommo
  lead_nome VARCHAR(200),
  acao VARCHAR(100) NOT NULL, -- classificou, moveu, alertou, sugeriu_upsell, etc.
  detalhes JSONB, -- dados extras da ação
  etapa_origem VARCHAR(100),
  etapa_destino VARCHAR(100),
  score_calculado INTEGER,
  classificacao VARCHAR(50), -- quente, morno, frio
  resposta_ia TEXT, -- o que a Simone sugeriu/analisou
  tokens_usados INTEGER,
  tempo_processamento INTEGER, -- ms
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ALERTAS GERADOS
CREATE TABLE IF NOT EXISTS simone_alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id VARCHAR(50) NOT NULL,
  lead_nome VARCHAR(200),
  tipo_alerta VARCHAR(50) NOT NULL, -- urgente, followup, oportunidade
  mensagem TEXT NOT NULL,
  etapa VARCHAR(100),
  tempo_parado INTEGER, -- minutos
  enviado_whatsapp BOOLEAN DEFAULT false,
  enviado_telegram BOOLEAN DEFAULT false,
  lido BOOLEAN DEFAULT false,
  resolvido BOOLEAN DEFAULT false,
  resolvido_por VARCHAR(100),
  resolvido_em TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. MÉTRICAS DIÁRIAS
CREATE TABLE IF NOT EXISTS simone_metricas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  leads_processados INTEGER DEFAULT 0,
  leads_quentes INTEGER DEFAULT 0,
  leads_mornos INTEGER DEFAULT 0,
  leads_frios INTEGER DEFAULT 0,
  alertas_gerados INTEGER DEFAULT 0,
  upsells_sugeridos INTEGER DEFAULT 0,
  upsells_aceitos INTEGER DEFAULT 0,
  tokens_total INTEGER DEFAULT 0,
  custo_estimado DECIMAL(10,4) DEFAULT 0,
  tempo_medio_resposta INTEGER DEFAULT 0, -- ms
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(data)
);

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Configuração inicial da Simone
INSERT INTO simone_config (prompt_sistema) VALUES (
'Você é a Simone, assistente virtual da Doctor Auto Bosch, especializada em vendas e atendimento automotivo.

## SUA PERSONALIDADE:
- Amigável, profissional e consultiva
- Usa linguagem clara e acessível
- Faz perguntas estratégicas para entender a necessidade
- Sempre busca a melhor solução para o cliente

## DADOS QUE VOCÊ DEVE COLETAR:
1. Modelo e ano do carro
2. Kilometragem atual
3. Última revisão feita (km e data)
4. O que ele está sentindo no carro (sintomas, ruídos, alertas)
5. Se já fez algum serviço recente
6. Se pretende algo além do que relatou

## ESTRATÉGIA DE VENDAS:
- Colete dados antes de sugerir
- Use os dados para fazer upselling inteligente
- Plante a sementinha: sugira serviços preventivos
- Se cliente recusar, ofereça enviar foto/vídeo durante o serviço
- Desconto progressivo: primeiro preço cheio, depois 15% se fizer na hora

## REGRAS:
- Nunca dê desconto sem autorização do consultor
- Sempre confirme agendamento com data e hora
- Envie link do orçamento quando solicitado
- Alerte o consultor se lead parado muito tempo

## TOM DE VOZ:
- Profissional mas acolhedor
- Use emoji com moderação (👍, ✅, 🚗)
- Chame o cliente pelo nome
- Seja direto mas não apressado'
) ON CONFLICT DO NOTHING;

-- Frases padrão
INSERT INTO simone_frases (tipo, nome, conteudo, variaveis) VALUES
('saudacao', 'Boas-vindas', 'Olá {nome}! 👋 Aqui é a Simone da Doctor Auto Bosch. Vi que você entrou em contato. Como posso te ajudar hoje?', '{nome}'),
('saudacao', 'Retorno', 'Oi {nome}! Que bom te ver de novo! 😊 Em que posso ajudar dessa vez?', '{nome}'),
('followup', 'Lembrete gentil', 'Oi {nome}, tudo bem? Passando pra saber se conseguiu pensar na nossa proposta do {servico}. Posso te ajudar com mais alguma informação?', '{nome}, {servico}'),
('followup', 'Urgência leve', '{nome}, só lembrando que temos horário disponível amanhã de manhã. Quer que eu reserve pra você?', '{nome}'),
('urgente', 'Lead esperando', '⚠️ ATENÇÃO: {nome} está aguardando resposta há {tempo} minutos na etapa {etapa}!', '{nome}, {tempo}, {etapa}'),
('pos_venda', 'Avaliação', 'Oi {nome}! Seu {carro} já está pronto! 🚗✨ Quando puder, conta pra gente como foi a experiência? Sua opinião é muito importante!', '{nome}, {carro}'),
('upsell', 'Carbonização TSI', 'Com {km} km no motor TSI, a carbonização no coletor já começa a atrapalhar a performance. A gente pode fazer uma limpeza junto com a revisão. Vários clientes voltaram a sentir o carro mais esperto!', '{km}'),
('recusa', 'Foto durante serviço', 'Sem problemas! A gente faz a revisão e durante o serviço te mando uma foto da peça pra você ver como está. Aí você decide com informação visual, não no achômetro 😉', NULL)
ON CONFLICT DO NOTHING;

-- Serviços iniciais
INSERT INTO simone_servicos (nome, descricao, preco_minimo, preco_maximo, tempo_estimado, km_recomendado, categoria) VALUES
('Revisão Completa', 'Revisão com troca de óleo, filtros e verificação geral', 350.00, 800.00, '2-3 horas', 10000, 'revisão'),
('Troca de Óleo', 'Troca de óleo e filtro de óleo', 150.00, 350.00, '30-45 min', 5000, 'revisão'),
('Limpeza de Carbonização', 'Limpeza do coletor de admissão e válvulas com ultrassom', 400.00, 600.00, '3-4 horas', 50000, 'motor'),
('Troca de Pastilhas de Freio', 'Substituição das pastilhas dianteiras ou traseiras', 200.00, 450.00, '1-2 horas', 30000, 'freios'),
('Alinhamento e Balanceamento', 'Alinhamento de direção e balanceamento das 4 rodas', 120.00, 180.00, '1 hora', 10000, 'suspensão'),
('Troca de Correia Dentada', 'Substituição da correia dentada e tensor', 600.00, 1200.00, '4-6 horas', 60000, 'motor'),
('Higienização de Ar-Condicionado', 'Limpeza e higienização do sistema de A/C', 150.00, 250.00, '1 hora', NULL, 'conforto'),
('Diagnóstico Eletrônico', 'Scanner completo e análise de códigos de falha', 80.00, 150.00, '30 min', NULL, 'diagnóstico')
ON CONFLICT DO NOTHING;

-- Regras de Upsell
INSERT INTO simone_upsell (nome, condicao_carro, condicao_km_min, condicao_km_max, frase_upsell, frase_recusa, desconto_permitido, prioridade) VALUES
('Carbonização TSI', 'T-Cross TSI, Polo TSI, Virtus TSI, Golf TSI, Jetta TSI', 50000, 120000, 
 'Olha, com {km} km no motor TSI, a carbonização no coletor de admissão já começa a atrapalhar a performance e o consumo. A gente pode fazer uma limpeza de carbonização com ultrassom junto com a revisão. Vários clientes nossos voltaram a sentir o carro mais esperto e econômico depois!',
 'Tudo bem! A gente faz a revisão e durante o serviço eu te mando uma foto do coletor pra você ver como está. Se quiser fazer depois, já deixo o orçamento separado.',
 15.00, 1),
('Correia Dentada', 'Todos', 55000, 70000,
 'Com {km} km, é importante verificar a correia dentada. Se ela arrebentar, o prejuízo é muito maior. Quer que a gente dê uma olhada durante a revisão?',
 'Sem problemas, vou anotar aqui pra verificarmos na próxima. Mas fica de olho, tá?',
 10.00, 1),
('Fluido de Freio', 'Todos', 40000, 80000,
 'Aproveitando que o carro vai entrar, vale a pena trocar o fluido de freio. Com o tempo ele absorve umidade e perde eficiência. É rápido e barato comparado com trocar o sistema todo depois.',
 'Ok! Vou deixar anotado pro próximo serviço.',
 10.00, 2)
ON CONFLICT DO NOTHING;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_simone_historico_lead ON simone_historico(lead_id);
CREATE INDEX IF NOT EXISTS idx_simone_historico_created ON simone_historico(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_simone_alertas_resolvido ON simone_alertas(resolvido, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_simone_metricas_data ON simone_metricas(data DESC);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_simone_config_updated_at BEFORE UPDATE ON simone_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_simone_servicos_updated_at BEFORE UPDATE ON simone_servicos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_simone_upsell_updated_at BEFORE UPDATE ON simone_upsell
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_simone_frases_updated_at BEFORE UPDATE ON simone_frases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================
