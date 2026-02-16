# BLUEPRINT - COMMAND CENTER DOCTOR AUTO
# Versao 1.0 - 16/02/2026
# Autor: Claude + Thales Oliveira

---

## 1. VISAO GERAL

O Command Center e o cockpit central do projeto Doctor Auto.
Ele unifica 3 funcionalidades em uma unica ferramenta:

1. **MAPA DE ROTAS** - Visualizacao e edicao das 88 paginas do sistema (base do Kimi)
2. 2. **PAGE PREVIEW** - Emulacao/preview das paginas em iframe (o que faltava)
   3. 3. **PAINEL DE IAs** - Gerenciamento dos bots e IAs do projeto (inspirado no Manus)
     
      4. ### Principio fundamental
      5. - NENHUMA pagina orfan sera descartada
         - - As 36 paginas orfas sao originais da Lovable que quebraram
           - - A missao e RECUPERAR e RECONECTAR, nao descartar
            
             - ---

             ## 2. ARQUITETURA - MONOREPO (Opcao B)

             ```
             git-push-fix/
             |-- src/                              # Site Doctor Auto (MANTEM TUDO)
             |-- server/_core/                     # Server existente
             |-- supabase/                         # Edge functions existentes
             |-- tools/                            # NOVA PASTA
             |   +-- command-center/               # App do Kimi evoluido
             |       |-- src/
             |       |   |-- components/
             |       |   |   |-- Sidebar.tsx        # do Kimi (lista paginas)
             |       |   |   |-- RouteNode.tsx      # do Kimi (cards visuais)
             |       |   |   |-- DetailPanel.tsx    # do Kimi (editor card)
             |       |   |   |-- Connections.tsx    # do Kimi (setas)
             |       |   |   |-- Toolbar.tsx        # do Kimi (toolbar)
             |       |   |   |-- MiniMap.tsx        # do Kimi (minimapa)
             |       |   |   |-- StatsDialog.tsx    # do Kimi (estatisticas)
             |       |   |   |-- PresentationMode.tsx # do Kimi
             |       |   |   |-- PagePreview.tsx    # NOVO - iframe preview
             |       |   |   |-- IAPanel.tsx        # NOVO - painel IAs
             |       |   |   |-- IACard.tsx         # NOVO - card de cada IA
             |       |   |   |-- IALogs.tsx         # NOVO - logs tempo real
             |       |   |   |-- TaskManager.tsx    # NOVO - voce escreve IA executa
             |       |   |   +-- ui/               # shadcn components
             |       |   |-- hooks/
             |       |   |   |-- useRouteMap.ts     # do Kimi (logica mapa)
             |       |   |   |-- usePanZoom.ts      # do Kimi (zoom/pan)
             |       |   |   |-- useIAManager.ts    # NOVO - CRUD IAs
             |       |   |   |-- useGitHub.ts       # NOVO - sync repo
             |       |   |   +-- useSupabase.ts     # NOVO - conexao banco
             |       |   |-- data/
             |       |   |   +-- routes.ts          # do Kimi (88 rotas)
             |       |   |-- types/
             |       |   |   |-- routes.ts          # do Kimi
             |       |   |   +-- ia.ts             # NOVO - tipos IAs
             |       |   |-- App.tsx
             |       |   +-- main.tsx
             |       |-- package.json
             |       |-- vite.config.ts
             |       +-- tailwind.config.ts
             |-- documentos/
             +-- package.json                       # root workspace
             ```

             ---

             ## 3. O QUE REAPROVEITAR DO KIMI (100%)

             | Arquivo Kimi | Tamanho | Funcao | Modificacao |
             |---|---|---|---|
             | Sidebar.tsx | 5.6KB | Lista 88 paginas | Adicionar aba IAs |
             | RouteNode.tsx | 5.7KB | Card visual | Adicionar badge status |
             | DetailPanel.tsx | 8.6KB | Editor do card | Adicionar botao Preview |
             | Connections.tsx | 2KB | Setas entre paginas | Manter como esta |
             | Toolbar.tsx | 6.2KB | Barra ferramentas | Adicionar botao IAs |
             | MiniMap.tsx | 3KB | Minimapa | Manter como esta |
             | StatsDialog.tsx | 6.6KB | Estatisticas | Expandir com metricas IA |
             | PresentationMode.tsx | 4.1KB | Modo apresentacao | Manter como esta |
             | useRouteMap.ts | 10.3KB | Hook principal | Adicionar sync Supabase |
             | routes.ts | 18KB | Dados 88 rotas | Enriquecer status real |

             Fonte: Chat Kimi https://www.kimi.com/chat/19c4c52f-ec12-890a-8000-098f081bf76e

             ---

             ## 4. MODULOS NOVOS

             ### 4A. PAGE PREVIEW (PagePreview.tsx)

             O que faltava no Kimi. Quando clica "Abrir" no card, abre iframe com a pagina real.

             - Command Center roda na porta 5174 (ou cmd.doctorauto.com)
             - - Site principal na Vercel (git-push-fix.vercel.app)
               - - Preview carrega URL real da pagina num iframe responsivo
                 - - Controles: mobile/desktop/tablet, refresh, abrir em nova aba
                   - - Permite testar a pagina sem sair da ferramenta
                    
                     - ### 4B. PAINEL DE IAs (IAPanel.tsx + IACard.tsx + IALogs.tsx)
                    
                     - Tabelas novas no Supabase:
                    
                     - ```sql
                       -- Tabela principal das IAs
                       CREATE TABLE ia_agents (
                         id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                         nome VARCHAR(100) NOT NULL,
                         tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('lider', 'escravo', 'bot_local')),
                         status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'erro', 'pausado')),
                         llm_provider VARCHAR(50) NOT NULL CHECK (llm_provider IN ('ollama', 'kimi', 'claude', 'local')),
                         modelo VARCHAR(100),
                         temperatura DECIMAL(3,2) DEFAULT 0.7,
                         prompt_sistema TEXT,
                         tarefas_ativas INTEGER DEFAULT 0,
                         ultimo_ping TIMESTAMP WITH TIME ZONE,
                         config_json JSONB DEFAULT '{}',
                         pai_id UUID REFERENCES ia_agents(id),
                         avatar_url VARCHAR(500),
                         descricao TEXT,
                         canais TEXT[] DEFAULT '{}',
                         created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                         updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                       );

                       -- Logs das IAs
                       CREATE TABLE ia_logs (
                         id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                         agent_id UUID REFERENCES ia_agents(id) ON DELETE CASCADE,
                         tipo VARCHAR(20) CHECK (tipo IN ('info', 'warn', 'error', 'action', 'message')),
                         mensagem TEXT NOT NULL,
                         metadata_json JSONB DEFAULT '{}',
                         created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                       );

                       -- Tarefas das IAs
                       CREATE TABLE ia_tasks (
                         id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                         agent_id UUID REFERENCES ia_agents(id),
                         titulo VARCHAR(255) NOT NULL,
                         descricao TEXT,
                         status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'rodando', 'concluida', 'erro', 'cancelada')),
                         prioridade INTEGER DEFAULT 5 CHECK (prioridade BETWEEN 1 AND 10),
                         cron_expression VARCHAR(100),
                         input_json JSONB DEFAULT '{}',
                         resultado_json JSONB DEFAULT '{}',
                         criado_por VARCHAR(100) DEFAULT 'manual',
                         created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                         started_at TIMESTAMP WITH TIME ZONE,
                         completed_at TIMESTAMP WITH TIME ZONE
                       );

                       -- Habilitar RLS
                       ALTER TABLE ia_agents ENABLE ROW LEVEL SECURITY;
                       ALTER TABLE ia_logs ENABLE ROW LEVEL SECURITY;
                       ALTER TABLE ia_tasks ENABLE ROW LEVEL SECURITY;

                       -- Policies (admin/gestao/dev podem tudo)
                       CREATE POLICY "ia_agents_all" ON ia_agents FOR ALL USING (true);
                       CREATE POLICY "ia_logs_all" ON ia_logs FOR ALL USING (true);
                       CREATE POLICY "ia_tasks_all" ON ia_tasks FOR ALL USING (true);
                       ```

                       ### IAs iniciais (seed data):

                       ```sql
                       -- LIDERES
                       INSERT INTO ia_agents (nome, tipo, status, llm_provider, modelo, descricao, canais) VALUES
                       ('Thales', 'lider', 'online', 'ollama', 'llama3.1:8b', 'Controlador Central - Recebe comandos e delega', ARRAY['sistema']),
                       ('Sophia', 'lider', 'online', 'kimi', 'kimi-2.5', 'Coordenadora Geral - Pesquisa e Estrategia', ARRAY['whatsapp', 'sistema']),
                       ('Simone', 'lider', 'online', 'ollama', 'mistral:7b', 'Coordenadora ERP/CRM - Processos e RAG', ARRAY['telegram', 'kommo']),
                       ('Anna Laura', 'lider', 'online', 'kimi', 'kimi-2.5', 'Especialista Vendas++ - Kommo CRM', ARRAY['whatsapp', 'kommo']);

                       -- ESCRAVOS (vinculados aos lideres via pai_id)
                       -- Escravos do Thales
                       INSERT INTO ia_agents (nome, tipo, status, llm_provider, modelo, descricao, pai_id) VALUES
                       ('Bot Monitor', 'escravo', 'online', 'ollama', 'llama3.1:8b', 'Monitora sistema e alerta erros', (SELECT id FROM ia_agents WHERE nome='Thales')),
                       ('Bot Auditor', 'escravo', 'online', 'ollama', 'mistral:7b', 'Audita acoes das IAs', (SELECT id FROM ia_agents WHERE nome='Thales'));

                       -- Escravos da Sophia
                       INSERT INTO ia_agents (nome, tipo, status, llm_provider, modelo, descricao, pai_id) VALUES
                       ('Bot Relatorios', 'escravo', 'online', 'ollama', 'llama3.1:8b', 'Gera relatorios automaticos', (SELECT id FROM ia_agents WHERE nome='Sophia')),
                       ('Bot Pesquisa', 'escravo', 'online', 'ollama', 'mistral:7b', 'Pesquisa e analise de dados', (SELECT id FROM ia_agents WHERE nome='Sophia'));

                       -- Escravos da Simone
                       INSERT INTO ia_agents (nome, tipo, status, llm_provider, modelo, descricao, pai_id) VALUES
                       ('Avaliador Leads', 'escravo', 'online', 'ollama', 'llama3.1:8b', 'Classifica leads quentes/mornos/frios', (SELECT id FROM ia_agents WHERE nome='Simone')),
                       ('Follow-up Bot', 'escravo', 'online', 'local', 'cron-job', 'Gerencia follow-ups automaticos', (SELECT id FROM ia_agents WHERE nome='Simone')),
                       ('Upsell Bot', 'escravo', 'online', 'ollama', 'mistral:7b', 'Identifica oportunidades de upsell', (SELECT id FROM ia_agents WHERE nome='Simone'));

                       -- Escravos da Anna Laura
                       INSERT INTO ia_agents (nome, tipo, status, llm_provider, modelo, descricao, pai_id) VALUES
                       ('Avaliador Pesquisa', 'escravo', 'online', 'ollama', 'llama3.1:8b', 'Pesquisa precos e fornecedores', (SELECT id FROM ia_agents WHERE nome='Anna Laura')),
                       ('Bot Lotacao', 'escravo', 'online', 'local', 'cron-job', 'Monitora estoque e lotacao', (SELECT id FROM ia_agents WHERE nome='Anna Laura')),
                       ('Chica da Silva', 'escravo', 'online', 'ollama', 'llama3.1:8b', 'Mapeadora de leads no Kommo', (SELECT id FROM ia_agents WHERE nome='Anna Laura')),
                       ('Reativador', 'escravo', 'offline', 'kimi', 'kimi-2.5', 'Reativacao de clientes inativos', (SELECT id FROM ia_agents WHERE nome='Anna Laura'));

                       -- TURMA RAG
                       INSERT INTO ia_agents (nome, tipo, status, llm_provider, modelo, descricao) VALUES
                       ('Ollama Engine', 'bot_local', 'online', 'ollama', 'llama3.1:8b', 'Motor LLM local na VPS'),
                       ('OpenClaw Interface', 'bot_local', 'online', 'local', 'openclaw', 'Interface multi-agent'),
                       ('RAG Retriever', 'bot_local', 'online', 'local', 'chromadb', 'Retrieval - Conhecimento permanente'),
                       ('Claude Analyst', 'bot_local', 'online', 'claude', 'haiku', 'IA Analista para tarefas complexas');
                       ```

                       ### 4C. TASK MANAGER (TaskManager.tsx)

                       Voce escreve um comando natural, o sistema despacha pra IA correta.

                       Fluxo:
                       ```
                       Voce (Command Center)
                         -> TaskManager (escreve comando)
                           -> Parser identifica IA destino
                             -> INSERT em ia_tasks (Supabase)
                               -> Worker na VPS (Node.js 24/7) consome a task
                                 -> Seleciona LLM (Ollama/Kimi/Claude)
                                   -> Executa
                                     -> UPDATE ia_tasks + INSERT ia_logs
                                       -> Voce ve resultado no Command Center (realtime)
                       ```

                       ---

                       ## 5. STACK DE LLMs - CUSTO MINIMO

                       | LLM | Onde roda | Custo mensal | Uso principal |
                       |---|---|---|---|
                       | Ollama (Llama 3.1 8B) | VPS Hostinger 8c/32GB | R$ 0 | Tarefas repetitivas, classificacao, resumos |
                       | Ollama (Mistral 7B) | VPS Hostinger | R$ 0 | Analise de texto, RAG queries |
                       | Kimi 2.5 | API Moonshot | ~R$ 125 ($25) | Conversacao, WhatsApp, follow-up |
                       | Claude Haiku | API Anthropic | ~R$ 25-50 (uso esporadico) | Diagnostico tecnico, analise complexa |
                       | ChromaDB | VPS Hostinger | R$ 0 | Memoria permanente RAG |

                       **CUSTO TOTAL ESTIMADO: R$ 150-200/mes**

                       ---

                       ## 6. FASES DE IMPLEMENTACAO

                       ### FASE 1 - SETUP (1 dia)
                       - [ ] Criar pasta tools/command-center/ no repo
                       - [ ] - [ ] Baixar codigo do Kimi (app inteiro do chat)
                       - [ ] - [ ] Colocar dentro de tools/command-center/
                       - [ ] - [ ] Configurar package.json com scripts
                       - [ ] - [ ] Testar rodando local (npm run dev)
                       - [ ] - [ ] Executor: Claude Code
                      
                       - [ ] ### FASE 2 - PAGE PREVIEW (1-2 dias)
                       - [ ] - [ ] Criar PagePreview.tsx com iframe responsivo
                       - [ ] - [ ] Conectar botao "Abrir" do DetailPanel ao Preview
                       - [ ] - [ ] Adicionar controles (mobile/desktop/tablet/refresh)
                       - [ ] - [ ] Testar com paginas do site na Vercel
                       - [ ] - [ ] Executor: Claude Code
                      
                       - [ ] ### FASE 3 - SUPABASE (2-3 dias)
                       - [ ] - [ ] Executar SQL das tabelas ia_agents, ia_logs, ia_tasks
                       - [ ] - [ ] Executar seed data das IAs iniciais
                       - [ ] - [ ] Criar useSupabase.ts hook no Command Center
                       - [ ] - [ ] Fazer cards sincronizarem status com banco
                       - [ ] - [ ] Criar useIAManager.ts para CRUD das IAs
                       - [ ] - [ ] Executor: Claude Code + Lovable
                      
                       - [ ] ### FASE 4 - PAINEL IAs (2-3 dias)
                       - [ ] - [ ] Criar IAPanel.tsx (visao geral das IAs)
                       - [ ] - [ ] Criar IACard.tsx (card individual com toggle ON/OFF)
                       - [ ] - [ ] Criar IALogs.tsx (logs em tempo real via Supabase Realtime)
                       - [ ] - [ ] Adicionar aba "IAs" na Sidebar
                       - [ ] - [ ] Toggle ON/OFF funcional (update no banco)
                       - [ ] - [ ] Hierarquia visual (lideres > escravos)
                       - [ ] - [ ] Executor: Lovable + Claude Code
                      
                       - [ ] ### FASE 5 - TASK MANAGER (3-5 dias)
                       - [ ] - [ ] Criar TaskManager.tsx (input + historico)
                       - [ ] - [ ] Criar parser de comandos (identifica IA destino)
                       - [ ] - [ ] Criar worker Node.js na VPS (consome ia_tasks)
                       - [ ] - [ ] Integrar Ollama local como primeiro LLM
                       - [ ] - [ ] Integrar Kimi 2.5 como segundo LLM
                       - [ ] - [ ] Testar fluxo completo
                       - [ ] - [ ] Executor: Kimi Code + Claude Code
                      
                       - [ ] ### FASE 6 - DEPLOY (1 dia)
                       - [ ] - [ ] Deploy Command Center separado
                       - [ ] - [ ] Opcao A: Vercel (subdominio cmd.doctorauto.com)
                       - [ ] - [ ] Opcao B: VPS Hostinger (porta 5174)
                       - [ ] - [ ] Configurar CORS para permitir iframe do site principal
                       - [ ] - [ ] Executor: Claude Code
                      
                       - [ ] ### FASE 7 - WORKER VPS (2-3 dias)
                       - [ ] - [ ] Instalar Ollama na VPS Hostinger
                       - [ ] - [ ] Baixar modelos (llama3.1:8b, mistral:7b)
                       - [ ] - [ ] Instalar ChromaDB
                       - [ ] - [ ] Criar worker Node.js (servico systemd)
                       - [ ] - [ ] Configurar polling de ia_tasks no Supabase
                       - [ ] - [ ] Testar execucao de tasks
                       - [ ] - [ ] Executor: Claude Code + manual na VPS
                      
                       - [ ] ---
                      
                       - [ ] ## 7. DISTRIBUICAO DO EXERCITO
                      
                       - [ ] | Ferramenta | Fase | O que faz |
                       - [ ] |---|---|---|
                       - [ ] | Claude Code | 1, 2, 3, 6, 7 | Setup, preview, supabase, deploy, worker |
                       - [ ] | Lovable | 3, 4 | UI do painel IAs (forte em UI rapida) |
                       - [ ] | Kimi Code | 5 | Evoluir o codigo que ele criou + Task Manager |
                       - [ ] | Claude Desktop (eu) | Todas | Arquitetura, revisao, debugging, decisoes |
                       - [ ] | Gemini/Genspark | Apoio | Pesquisa e documentacao |
                      
                       - [ ] ---
                      
                       - [ ] ## 8. ESTRATEGIA PAGINAS ORFAS
                      
                       - [ ] As 36 paginas orfas estao em /__orphan/* no router.
                       - [ ] No Command Center, cada uma aparece como card com bolinha VERMELHA (status: orfa).
                      
                       - [ ] Processo de recuperacao:
                       - [ ] 1. Voce abre o card da orfa no Command Center
                       - [ ] 2. Clica "Preview" pra ver como ela ta
                       - [ ] 3. Compara com a versao ativa (se existir duplicata)
                       - [ ] 4. Decide: reconectar no lugar original OU manter como referencia
                       - [ ] 5. Edita o path no card (ex: /__orphan/xxx -> /admin/xxx)
                       - [ ] 6. Manda Claude Code atualizar o App.tsx
                      
                       - [ ] Paginas orfas prioritarias para reconexao:
                       - [ ] - AdminDashboardIAs -> /admin/ia-dashboard (conectar ao Painel IAs)
                       - [ ] - AdminMonitoramentoKommo -> /admin/kommo (monitoramento real)
                       - [ ] - AdminPainelTV -> /admin/painel-tv (util para oficina)
                       - [ ] - Portal Cliente: Home, Veiculos, Historico -> /cliente/*
                      
                       - [ ] ---
                      
                       - [ ] ## 9. COMANDOS PARA COMECAR
                      
                       - [ ] ### Passo 1 - Claude Code (Terminal):
                       - [ ] ```bash
                       - [ ] cd /path/to/git-push-fix
                       - [ ] mkdir -p tools/command-center
                       - [ ] ```
                      
                       - [ ] ### Passo 2 - Baixar codigo do Kimi:
                       - [ ] Acessar https://www.kimi.com/chat/19c4c52f-ec12-890a-8000-098f081bf76e
                       - [ ] Baixar "All files" > "app" (1.09MB)
                       - [ ] Extrair dentro de tools/command-center/
                      
                       - [ ] ### Passo 3 - Instalar e testar:
                       - [ ] ```bash
                       - [ ] cd tools/command-center
                       - [ ] npm install
                       - [ ] npm run dev
                       - [ ] ```
                      
                       - [ ] ### Passo 4 - Commitar:
                       - [ ] ```bash
                       - [ ] cd ../..
                       - [ ] git add tools/
                       - [ ] git commit -m "feat: add Command Center (base Kimi + blueprint)"
                       - [ ] git push
                       - [ ] ```
                      
                       - [ ] ---
                      
                       - [ ] ## 10. URLs E REFERENCIAS
                      
                       - [ ] | Item | URL |
                       - [ ] |---|---|
                       - [ ] | Repo GitHub | https://github.com/toliveira1802-sketch/git-push-fix |
                       - [ ] | Site Vercel | https://git-push-fix.vercel.app |
                       - [ ] | Dashboard Manus | https://kommohub-pmdfeabq.manus.space |
                       - [ ] | Kimi Code (ferramenta) | https://www.kimi.com/chat/19c4c52f-ec12-890a-8000-098f081bf76e |
                       - [ ] | Supabase Project | anlazsytwwedfayfwupu.supabase.co |
                      
                       - [ ] ---
                      
                       - [ ] ## 11. METRICAS DE SUCESSO
                      
                       - [ ] - [ ] Command Center rodando local com mapa de 88 paginas
                       - [ ] - [ ] Preview funcional de qualquer pagina
                       - [ ] - [ ] Painel IAs mostrando 19 agentes com status real
                       - [ ] - [ ] Toggle ON/OFF funcionando no banco
                       - [ ] - [ ] Task Manager enviando comandos para Worker
                       - [ ] - [ ] Worker executando tasks via Ollama
                       - [ ] - [ ] Logs aparecendo em tempo real
                       - [ ] - [ ] Custo mensal abaixo de R$ 200
                      
                       - [ ] ---
                      
                       - [ ] Documento vivo. Atualizar conforme evolucao do projeto.
                       - [ ] Gerado em 16/02/2026 por Claude Opus 4.6 + Thales Oliveira.
