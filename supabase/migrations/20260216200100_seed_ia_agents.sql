-- =============================================
-- COMMAND CENTER - Seed Data v2.0
-- Time real: Sophia (rainha) + 3 princesas + Turma RAG
-- O RESTO, Sophia cria quando precisar
-- =============================================

-- RAINHA (1) - Sophia
-- (Sophia ja e criada pela migration 20260217300000_ensure_sophia_queen.sql)
-- Aqui so garantimos que ela existe como fallback
INSERT INTO ia_agents (nome, tipo, status, llm_provider, modelo, descricao, canais, config_json)
SELECT
  'Sophia', 'rainha', 'offline', 'ollama', 'llama3.1:8b',
  'IA Rainha - Cerebro central da Doctor Auto. Cria e gerencia princesas.',
  ARRAY['sistema', 'command-center'],
  '{
    "is_mother": true,
    "can_create_agents": true,
    "can_delete_agents": true,
    "can_adjust_prompts": true,
    "knowledge_base": "chromadb",
    "decision_mode": "semi-auto",
    "max_children": 20,
    "budget_mensal_llm": 200
  }'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM ia_agents WHERE nome = 'Sophia');

-- PRINCESAS (3) - filhas da Sophia
-- Anna - Atendimento
INSERT INTO ia_agents (nome, tipo, status, llm_provider, modelo, descricao, canais, pai_id, config_json)
SELECT
  'Anna', 'princesa', 'offline', 'ollama', 'llama3.1:8b',
  'Princesa de Atendimento - responde clientes, agenda, follow-up',
  ARRAY['whatsapp', 'chat', 'email'],
  (SELECT id FROM ia_agents WHERE nome = 'Sophia'),
  '{"cor": "#ec4899", "especialidade": "atendimento"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM ia_agents WHERE nome = 'Anna');

-- Simone - Financeiro
INSERT INTO ia_agents (nome, tipo, status, llm_provider, modelo, descricao, canais, pai_id, config_json)
SELECT
  'Simone', 'princesa', 'offline', 'ollama', 'llama3.1:8b',
  'Princesa Financeira - faturamento, inadimplencia, relatorios',
  ARRAY['interno'],
  (SELECT id FROM ia_agents WHERE nome = 'Sophia'),
  '{"cor": "#06b6d4", "especialidade": "financeiro"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM ia_agents WHERE nome = 'Simone');

-- Thamy - Marketing
INSERT INTO ia_agents (nome, tipo, status, llm_provider, modelo, descricao, canais, pai_id, config_json)
SELECT
  'Thamy', 'princesa', 'offline', 'ollama', 'llama3.1:8b',
  'Princesa de Marketing - campanhas, engajamento, posts',
  ARRAY['instagram', 'facebook', 'tiktok'],
  (SELECT id FROM ia_agents WHERE nome = 'Sophia'),
  '{"cor": "#f59e0b", "especialidade": "marketing"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM ia_agents WHERE nome = 'Thamy');

-- TURMA RAG (4) - bots locais de infraestrutura
INSERT INTO ia_agents (nome, tipo, status, llm_provider, modelo, descricao)
SELECT 'Ollama Engine', 'bot_local', 'offline', 'ollama', 'llama3.1:8b', 'Motor LLM local na VPS'
WHERE NOT EXISTS (SELECT 1 FROM ia_agents WHERE nome = 'Ollama Engine');

INSERT INTO ia_agents (nome, tipo, status, llm_provider, modelo, descricao)
SELECT 'OpenClaw Interface', 'bot_local', 'offline', 'local', 'openclaw', 'Interface multi-agent'
WHERE NOT EXISTS (SELECT 1 FROM ia_agents WHERE nome = 'OpenClaw Interface');

INSERT INTO ia_agents (nome, tipo, status, llm_provider, modelo, descricao)
SELECT 'RAG Retriever', 'bot_local', 'offline', 'local', 'chromadb', 'Retrieval - Conhecimento permanente'
WHERE NOT EXISTS (SELECT 1 FROM ia_agents WHERE nome = 'RAG Retriever');

INSERT INTO ia_agents (nome, tipo, status, llm_provider, modelo, descricao)
SELECT 'Claude Analyst', 'bot_local', 'offline', 'claude', 'haiku', 'IA Analista para tarefas complexas'
WHERE NOT EXISTS (SELECT 1 FROM ia_agents WHERE nome = 'Claude Analyst');
