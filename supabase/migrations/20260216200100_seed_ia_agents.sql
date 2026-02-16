-- =============================================
-- COMMAND CENTER - Seed Data: 19 Agentes IA
-- FASE 3 - Blueprint v1.0
-- =============================================

-- LIDERES (4)
INSERT INTO ia_agents (nome, tipo, status, llm_provider, modelo, descricao, canais) VALUES
('Thales', 'lider', 'online', 'ollama', 'llama3.1:8b', 'Controlador Central - Recebe comandos e delega', ARRAY['sistema']),
('Sophia', 'lider', 'online', 'kimi', 'kimi-2.5', 'Coordenadora Geral - Pesquisa e Estrategia', ARRAY['whatsapp', 'sistema']),
('Simone', 'lider', 'online', 'ollama', 'mistral:7b', 'Coordenadora ERP/CRM - Processos e RAG', ARRAY['telegram', 'kommo']),
('Anna Laura', 'lider', 'online', 'kimi', 'kimi-2.5', 'Especialista Vendas++ - Kommo CRM', ARRAY['whatsapp', 'kommo']);

-- ESCRAVOS do Thales (2)
INSERT INTO ia_agents (nome, tipo, status, llm_provider, modelo, descricao, pai_id) VALUES
('Bot Monitor', 'escravo', 'online', 'ollama', 'llama3.1:8b', 'Monitora sistema e alerta erros', (SELECT id FROM ia_agents WHERE nome='Thales')),
('Bot Auditor', 'escravo', 'online', 'ollama', 'mistral:7b', 'Audita acoes das IAs', (SELECT id FROM ia_agents WHERE nome='Thales'));

-- ESCRAVOS da Sophia (2)
INSERT INTO ia_agents (nome, tipo, status, llm_provider, modelo, descricao, pai_id) VALUES
('Bot Relatorios', 'escravo', 'online', 'ollama', 'llama3.1:8b', 'Gera relatorios automaticos', (SELECT id FROM ia_agents WHERE nome='Sophia')),
('Bot Pesquisa', 'escravo', 'online', 'ollama', 'mistral:7b', 'Pesquisa e analise de dados', (SELECT id FROM ia_agents WHERE nome='Sophia'));

-- ESCRAVOS da Simone (3)
INSERT INTO ia_agents (nome, tipo, status, llm_provider, modelo, descricao, pai_id) VALUES
('Avaliador Leads', 'escravo', 'online', 'ollama', 'llama3.1:8b', 'Classifica leads quentes/mornos/frios', (SELECT id FROM ia_agents WHERE nome='Simone')),
('Follow-up Bot', 'escravo', 'online', 'local', 'cron-job', 'Gerencia follow-ups automaticos', (SELECT id FROM ia_agents WHERE nome='Simone')),
('Upsell Bot', 'escravo', 'online', 'ollama', 'mistral:7b', 'Identifica oportunidades de upsell', (SELECT id FROM ia_agents WHERE nome='Simone'));

-- ESCRAVOS da Anna Laura (4)
INSERT INTO ia_agents (nome, tipo, status, llm_provider, modelo, descricao, pai_id) VALUES
('Avaliador Pesquisa', 'escravo', 'online', 'ollama', 'llama3.1:8b', 'Pesquisa precos e fornecedores', (SELECT id FROM ia_agents WHERE nome='Anna Laura')),
('Bot Lotacao', 'escravo', 'online', 'local', 'cron-job', 'Monitora estoque e lotacao', (SELECT id FROM ia_agents WHERE nome='Anna Laura')),
('Chica da Silva', 'escravo', 'online', 'ollama', 'llama3.1:8b', 'Mapeadora de leads no Kommo', (SELECT id FROM ia_agents WHERE nome='Anna Laura')),
('Reativador', 'escravo', 'offline', 'kimi', 'kimi-2.5', 'Reativacao de clientes inativos', (SELECT id FROM ia_agents WHERE nome='Anna Laura'));

-- TURMA RAG (4)
INSERT INTO ia_agents (nome, tipo, status, llm_provider, modelo, descricao) VALUES
('Ollama Engine', 'bot_local', 'online', 'ollama', 'llama3.1:8b', 'Motor LLM local na VPS'),
('OpenClaw Interface', 'bot_local', 'online', 'local', 'openclaw', 'Interface multi-agent'),
('RAG Retriever', 'bot_local', 'online', 'local', 'chromadb', 'Retrieval - Conhecimento permanente'),
('Claude Analyst', 'bot_local', 'online', 'claude', 'haiku', 'IA Analista para tarefas complexas');
