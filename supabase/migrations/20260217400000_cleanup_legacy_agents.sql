-- =============================================
-- LIMPEZA DE AGENTES LEGADO
-- Remove os 19 agentes antigos do Blueprint v1.0
-- Mantem APENAS: Sophia (rainha) + 3 princesas + 4 RAG bots
-- =============================================

-- 0. Garante que check constraint aceita 'rainha' e 'princesa'
ALTER TABLE ia_agents DROP CONSTRAINT IF EXISTS ia_agents_tipo_check;
ALTER TABLE ia_agents ADD CONSTRAINT ia_agents_tipo_check
  CHECK (tipo IN ('lider', 'rainha', 'princesa', 'escravo', 'bot_local'));

-- 1. Deleta logs dos agentes que vao sumir (pra nao ter FK violation)
DELETE FROM ia_logs
WHERE agent_id IN (
  SELECT id FROM ia_agents
  WHERE nome IN (
    'Thales', 'Anna Laura', 'Athena',
    'Bot Monitor', 'Bot Auditor',
    'Bot Relatorios', 'Bot Pesquisa',
    'Avaliador Leads', 'Follow-up Bot', 'Upsell Bot',
    'Avaliador Pesquisa', 'Bot Lotacao', 'Chica da Silva', 'Reativador'
  )
);

-- 2. Deleta tasks dos agentes legado
DELETE FROM ia_tasks
WHERE agent_id IN (
  SELECT id FROM ia_agents
  WHERE nome IN (
    'Thales', 'Anna Laura', 'Athena',
    'Bot Monitor', 'Bot Auditor',
    'Bot Relatorios', 'Bot Pesquisa',
    'Avaliador Leads', 'Follow-up Bot', 'Upsell Bot',
    'Avaliador Pesquisa', 'Bot Lotacao', 'Chica da Silva', 'Reativador'
  )
);

-- 3. Deleta decisoes referenciando agentes legado
DELETE FROM ia_mae_decisoes
WHERE agente_afetado IN (
  SELECT id FROM ia_agents
  WHERE nome IN (
    'Thales', 'Anna Laura', 'Athena',
    'Bot Monitor', 'Bot Auditor',
    'Bot Relatorios', 'Bot Pesquisa',
    'Avaliador Leads', 'Follow-up Bot', 'Upsell Bot',
    'Avaliador Pesquisa', 'Bot Lotacao', 'Chica da Silva', 'Reativador'
  )
);

-- 4. Remove referencia pai_id dos escravos que apontam pra liders legado
UPDATE ia_agents SET pai_id = NULL
WHERE pai_id IN (
  SELECT id FROM ia_agents
  WHERE nome IN ('Thales', 'Anna Laura', 'Athena')
);

-- 5. Deleta os agentes legado
DELETE FROM ia_agents
WHERE nome IN (
  'Thales', 'Anna Laura', 'Athena',
  'Bot Monitor', 'Bot Auditor',
  'Bot Relatorios', 'Bot Pesquisa',
  'Avaliador Leads', 'Follow-up Bot', 'Upsell Bot',
  'Avaliador Pesquisa', 'Bot Lotacao', 'Chica da Silva', 'Reativador'
);

-- 6. Garante Sophia como rainha (se ainda era 'lider')
UPDATE ia_agents
SET tipo = 'rainha'
WHERE nome = 'Sophia' AND tipo != 'rainha';

-- 7. Garante que Simone antiga (se era 'lider') vira princesa da Sophia
UPDATE ia_agents
SET tipo = 'princesa',
    pai_id = (SELECT id FROM ia_agents WHERE nome = 'Sophia'),
    descricao = COALESCE(NULLIF(descricao, ''), 'Princesa Financeira - faturamento, inadimplencia, relatorios'),
    config_json = COALESCE(config_json, '{}'::jsonb) || '{"cor": "#06b6d4", "especialidade": "financeiro"}'::jsonb
WHERE nome = 'Simone' AND tipo != 'princesa';

-- 8. Cria as 3 princesas se nao existem
INSERT INTO ia_agents (nome, tipo, status, llm_provider, modelo, descricao, canais, pai_id, config_json)
SELECT 'Anna', 'princesa', 'offline', 'ollama', 'llama3.1:8b',
  'Princesa de Atendimento - responde clientes, agenda, follow-up',
  ARRAY['whatsapp', 'chat', 'email'],
  (SELECT id FROM ia_agents WHERE nome = 'Sophia'),
  '{"cor": "#ec4899", "especialidade": "atendimento"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM ia_agents WHERE nome = 'Anna');

INSERT INTO ia_agents (nome, tipo, status, llm_provider, modelo, descricao, canais, pai_id, config_json)
SELECT 'Simone', 'princesa', 'offline', 'ollama', 'llama3.1:8b',
  'Princesa Financeira - faturamento, inadimplencia, relatorios',
  ARRAY['interno'],
  (SELECT id FROM ia_agents WHERE nome = 'Sophia'),
  '{"cor": "#06b6d4", "especialidade": "financeiro"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM ia_agents WHERE nome = 'Simone');

INSERT INTO ia_agents (nome, tipo, status, llm_provider, modelo, descricao, canais, pai_id, config_json)
SELECT 'Thamy', 'princesa', 'offline', 'ollama', 'llama3.1:8b',
  'Princesa de Marketing - campanhas, engajamento, posts',
  ARRAY['instagram', 'facebook', 'tiktok'],
  (SELECT id FROM ia_agents WHERE nome = 'Sophia'),
  '{"cor": "#f59e0b", "especialidade": "marketing"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM ia_agents WHERE nome = 'Thamy');

-- 9. Log
DO $$
DECLARE
  total INT;
BEGIN
  SELECT COUNT(*) INTO total FROM ia_agents;
  RAISE NOTICE 'Limpeza concluida. Total de agentes: %', total;
END $$;
