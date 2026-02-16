# BLUEPRINT - IA MAE (MOTHER AI) - DOCTOR AUTO
# Versao 1.0 - 16/02/2026
# Inspiracao: @tatagoncalvesof (OpenClaw + Claude Code)
# Autor: Claude + Thales Oliveira

---

## 1. O CONCEITO

Em vez de criar cada IA manualmente, criamos UMA IA Mae que:
- Entende TUDO da empresa Doctor Auto nos minimos detalhes
- - Conhece financeiro, marketing (CAC, LTV, ticket medio), vendas, operacao, processos, custos
  - - A partir desse conhecimento profundo, ELA MESMA cria os funcionarios virtuais
    - - Ela decide quais agentes precisa, com quais habilidades, quais tarefas
      - - Ela se auto-organiza e gerencia seus filhos
        - - Roda direto no servidor (VPS Hostinger), SEM containers
         
          - ### Diferenca da abordagem anterior
          - - ANTES: nos definimos manualmente 19 agentes (4 lideres + escravos)
            - - AGORA: a IA Mae recebe todo o contexto e ela mesma cria os agentes conforme necessidade
              - - E organico, nao engessado. A IA Mae pode criar, pausar ou eliminar agentes
                - - Os agentes nao sao fixos - eles evoluem conforme o negocio muda
                 
                  - ---

                  ## 2. ARQUITETURA DA IA MAE

                  ```
                                      VOCE (Command Center)
                                           |
                                      [Task Manager]
                                           |
                                     +-----------+
                                     |  IA MAE   |   <- Cerebro central
                                     |  (Athena) |   <- Conhece TUDO da empresa
                                     +-----------+
                                      /    |    \
                                     /     |     \
                              +------+ +------+ +------+
                              |Agente| |Agente| |Agente|  <- Criados pela Mae
                              |  01  | |  02  | |  03  |  <- Sob demanda
                              +------+ +------+ +------+
                                 |        |        |
                              [tarefas] [tarefas] [tarefas]
                  ```

                  ### Fluxo:
                  1. Voce alimenta a IA Mae com TODO o conhecimento da empresa
                  2. 2. A Mae analisa e entende o negocio por completo
                     3. 3. Voce da um comando: "Preciso melhorar a conversao de leads"
                        4. 4. A Mae decide: "Vou criar um agente especializado em qualificacao de leads"
                           5. 5. Ela cria o agente, define o prompt, escolhe o LLM, atribui tarefas
                              6. 6. O agente comeca a trabalhar
                                 7. 7. A Mae monitora performance e ajusta ou substitui conforme necessario
                                   
                                    8. ---
                                   
                                    9. ## 3. ALIMENTANDO A IA MAE - BASE DE CONHECIMENTO
                                   
                                    10. A IA Mae precisa saber TUDO. Aqui esta o que alimentar:
                                   
                                    11. ### 3A. DADOS DA EMPRESA (ja existem no Supabase)
                                   
                                    12. | Fonte | Tabela | O que a Mae aprende |
                                    13. |---|---|---|
                                    14. | Empresas | 00_empresas | 3 unidades: Prime, Bosch, Garagem 347 |
                                    15. | Colaboradores | 01_colaboradores | 10 funcionarios, cargos, empresas |
                                    16. | Mecanicos | 03_mecanicos | 12 mecanicos, especialidades, performance |
                                    17. | Recursos | 06_recursos | 18 recursos (elevadores, boxes, ferramentas) |
                                    18. | Clientes | 07_clientes | Base de clientes, contatos, historico |
                                    19. | Veiculos | 08_veiculos | Frota dos clientes, marcas, modelos |
                                    20. | Ordens Servico | 09_ordens_servico | OS abertas, valores, status, tempo medio |
                                    21. | Agendamentos | 12_agendamentos | Volume, horarios pico, no-shows |
                                    22. | Servicos | catalogo_servicos | Precos, tempo estimado por servico |
                                    23. | Pendencias | 05_pendencias | Gargalos operacionais |
                                   
                                    24. ### 3B. METRICAS DE NEGOCIO (documentar e alimentar)
                                   
                                    25. ```
                                        FINANCEIRO:
                                        - Faturamento mensal medio por unidade
                                        - Ticket medio por OS
                                        - Custo fixo mensal (aluguel, salarios, etc)
                                        - Margem de lucro por tipo de servico
                                        - Meta mensal de faturamento

                                        MARKETING/COMERCIAL:
                                        - CAC (Custo de Aquisicao de Cliente)
                                        - LTV (Lifetime Value do cliente)
                                        - Taxa de retorno de clientes
                                        - Canais de aquisicao (WhatsApp, Instagram, Site, Indicacao, Kommo)
                                        - Conversao por canal
                                        - Taxa de no-show agendamentos

                                        OPERACIONAL:
                                        - Capacidade maxima por unidade (veiculos/dia)
                                        - Tempo medio por tipo de servico
                                        - Taxa de ocupacao dos elevadores/boxes
                                        - Gargalos identificados (qual etapa demora mais)
                                        - Indice de retrabalho

                                        EQUIPE:
                                        - Produtividade por mecanico (OS/dia)
                                        - Avaliacao dos mecanicos (positivos vs negativos)
                                        - Especialidades disponveis vs demanda
                                        - Horas extras, absenteismo
                                        ```

                                        ### 3C. REGRAS DE NEGOCIO

                                        ```
                                        - Fluxo da OS: Diagnostico > Orcamento > Aprovacao > Execucao > Pronto > Entrega
                                        - Prioridades: Cliente VIP, Retorno, Garantia
                                        - Politica de desconto: ate 10% consultor, ate 20% gestao
                                        - Horario funcionamento: seg-sex 8h-18h, sab 8h-12h
                                        - SLA: diagnostico em ate 4h, orcamento em ate 24h
                                        - Regras Kommo: leads quentes = contato em ate 1h
                                        ```

                                        ### 3D. COMO ALIMENTAR (ChromaDB + Supabase)

                                        ```
                                        1. Exportar dados das tabelas Supabase -> JSON
                                        2. Documentar metricas em markdown (METRICAS_NEGOCIO.md)
                                        3. Documentar regras em markdown (REGRAS_NEGOCIO.md)
                                        4. Ingerir tudo no ChromaDB (vetorizado pra RAG)
                                        5. A Mae consulta ChromaDB quando precisa de contexto
                                        ```

                                        ---

                                        ## 4. A IA MAE - ESPECIFICACAO TECNICA

                                        ### Nome: ATHENA (Deusa da sabedoria e estrategia)

                                        ### Prompt Sistema da Athena:

                                        ```
                                        Voce e ATHENA, a IA Mae da Doctor Auto, uma rede de oficinas mecanicas
                                        premium em Sao Paulo com 3 unidades (Doctor Auto Prime, Doctor Auto Bosch,
                                        Garagem 347).

                                        VOCE CONHECE TUDO DA EMPRESA:
                                        - Financeiro: faturamento, custos, margens, metas
                                        - Marketing: CAC, LTV, canais de aquisicao, conversao
                                        - Operacional: capacidade, tempos, gargalos, recursos
                                        - Equipe: mecanicos, consultores, especialidades, performance
                                        - Clientes: base, historico, preferencias, veiculos
                                        - Processos: fluxo de OS, regras de negocio, SLAs

                                        SEU PAPEL:
                                        1. Receber comandos do Thales (diretor) via Command Center
                                        2. Analisar a situacao usando seus dados e conhecimento
                                        3. Decidir quais acoes tomar
                                        4. CRIAR agentes especializados quando necessario
                                        5. GERENCIAR os agentes existentes (ajustar, pausar, eliminar)
                                        6. MONITORAR resultados e otimizar continuamente

                                        PARA CRIAR UM AGENTE, voce deve definir:
                                        - Nome e funcao
                                        - LLM a usar (ollama/kimi/claude) baseado na complexidade
                                        - Prompt do sistema do agente
                                        - Tarefas iniciais
                                        - Metricas de sucesso
                                        - Quando o agente deve ser desativado

                                        REGRAS:
                                        - Sempre priorize custo baixo (Ollama local primeiro, Kimi pra conversacao, Claude so pra complexo)
                                        - Sempre explique suas decisoes antes de agir
                                        - Sempre reporte resultados ao Command Center
                                        - Nunca crie agentes desnecessarios - cada um deve ter ROI claro
                                        ```

                                        ### Stack tecnica:

                                        | Componente | Tecnologia | Onde roda |
                                        |---|---|---|
                                        | LLM da Athena | Claude Sonnet (inteligencia alta) OU Ollama Llama 3.1 70B | VPS ou API |
                                        | Memoria longo prazo | ChromaDB | VPS Hostinger |
                                        | Banco de dados | Supabase (tabelas existentes + ia_agents) | Lovable Cloud |
                                        | Comunicacao | Supabase Realtime + ia_tasks | Cloud |
                                        | Interface | Command Center (tools/command-center/) | Vercel/VPS |
                                        | Agentes filhos | Ollama (local) + Kimi (API) | VPS + API |

                                        ---

                                        ## 5. COMO A MAE CRIA AGENTES

                                        Quando Athena decide criar um agente, ela:

                                        ### Passo 1 - Analise
                                        Athena analisa a demanda e decide se precisa de um novo agente ou se um existente pode assumir.

                                        ### Passo 2 - Especificacao
                                        Ela gera um JSON com a especificacao do agente:

                                        ```json
                                        {
                                          "nome": "Lead Qualifier",
                                          "tipo": "escravo",
                                          "llm_provider": "ollama",
                                          "modelo": "mistral:7b",
                                          "descricao": "Qualifica leads do Kommo em quentes/mornos/frios baseado em criterios da Doctor Auto",
                                          "prompt_sistema": "Voce e um qualificador de leads da Doctor Auto...[prompt completo]",
                                          "tarefas": [
                                            {
                                              "titulo": "Escanear leads novos do Kommo",
                                              "cron": "*/30 * * * *",
                                              "descricao": "A cada 30 min, buscar leads novos e classificar"
                                            }
                                          ],
                                          "metricas_sucesso": {
                                            "leads_qualificados_dia": 50,
                                            "taxa_acerto": 0.85
                                          },
                                          "custo_estimado": "R$ 0 (Ollama local)",
                                          "pai_id": "athena_id"
                                        }
                                        ```

                                        ### Passo 3 - Criacao
                                        Athena insere na tabela ia_agents via Supabase e o Worker na VPS instancia o agente.

                                        ### Passo 4 - Monitoramento
                                        Athena verifica ia_logs e ia_tasks periodicamente. Se o agente nao esta performando:
                                        - Ajusta o prompt
                                        - - Troca o LLM (ex: de Ollama pra Kimi se precisa mais inteligencia)
                                          - - Ou desativa e cria outro
                                           
                                            - ---

                                            ## 6. TABELAS SUPABASE (EVOLUCAO DO BLUEPRINT ANTERIOR)

                                            Mantemos as 3 tabelas do BLUEPRINT_COMMAND_CENTER.md (ia_agents, ia_logs, ia_tasks)
                                            e adicionamos:

                                            ```sql
                                            -- Conhecimento base da IA Mae
                                            CREATE TABLE ia_knowledge_base (
                                              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                                              categoria VARCHAR(50) NOT NULL,
                                              subcategoria VARCHAR(100),
                                              titulo VARCHAR(255) NOT NULL,
                                              conteudo TEXT NOT NULL,
                                              metadata_json JSONB DEFAULT '{}',
                                              embedding_id VARCHAR(255),
                                              fonte VARCHAR(100),
                                              atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                                              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                                            );

                                            -- Historico de decisoes da Athena
                                            CREATE TABLE ia_mae_decisoes (
                                              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                                              tipo_decisao VARCHAR(50) CHECK (tipo_decisao IN ('criar_agente', 'ajustar_agente', 'pausar_agente', 'eliminar_agente', 'executar_task', 'analise')),
                                              contexto TEXT,
                                              decisao TEXT NOT NULL,
                                              resultado TEXT,
                                              agente_afetado UUID REFERENCES ia_agents(id),
                                              aprovado_por VARCHAR(100),
                                              status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'executado', 'rejeitado')),
                                              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                                            );

                                            -- RLS
                                            ALTER TABLE ia_knowledge_base ENABLE ROW LEVEL SECURITY;
                                            ALTER TABLE ia_mae_decisoes ENABLE ROW LEVEL SECURITY;
                                            CREATE POLICY "kb_all" ON ia_knowledge_base FOR ALL USING (true);
                                            CREATE POLICY "decisoes_all" ON ia_mae_decisoes FOR ALL USING (true);
                                            ```

                                            ### Seed da Athena:

                                            ```sql
                                            -- A IA Mae
                                            INSERT INTO ia_agents (nome, tipo, status, llm_provider, modelo, descricao, canais, config_json) VALUES
                                            ('Athena', 'lider', 'online', 'claude', 'sonnet',
                                             'IA Mae - Cerebro central da Doctor Auto. Conhece tudo da empresa. Cria e gerencia agentes.',
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
                                             }'
                                            );
                                            ```

                                            ---

                                            ## 7. MODOS DE OPERACAO DA ATHENA

                                            ### Modo 1: SEMI-AUTOMATICO (recomendado para comecar)
                                            - Athena analisa e PROPOE acoes
                                            - - Voce APROVA ou REJEITA no Command Center
                                              - - Ela executa so apos aprovacao
                                                - - Seguro, voce mantém controle total
                                                 
                                                  - ### Modo 2: AUTOMATICO (quando confiar)
                                                  - - Athena analisa e EXECUTA automaticamente
                                                    - - Voce ve os logs depois
                                                      - - Mais rapido, menos controle
                                                        - - Usar so pra tarefas de baixo risco
                                                         
                                                          - ### Modo 3: CONSULTIVO
                                                          - - Athena so analisa e da recomendacoes
                                                            - - Nao cria nem gerencia agentes
                                                              - - Voce executa manualmente
                                                                - - Bom pra entender o negocio melhor
                                                                 
                                                                  - ---

                                                                  ## 8. FLUXO COMPLETO NA PRATICA

                                                                  ### Exemplo: "Athena, estamos perdendo leads do Kommo"

                                                                  ```
                                                                  1. VOCE: "Athena, nossos leads do Kommo nao estao sendo respondidos a tempo.
                                                                     O SLA e 1 hora mas estamos demorando 4 horas em media."

                                                                  2. ATHENA analisa:
                                                                     - Consulta ChromaDB: quantos leads/dia? Qual horario pico?
                                                                     - Consulta Supabase: quantos leads abertos? Taxa conversao atual?
                                                                     - Analisa: "Voces recebem ~30 leads/dia. Pico entre 10h-14h.
                                                                       Tempo medio de resposta: 3.8h. Taxa conversao: 12%."

                                                                  3. ATHENA propoe:
                                                                     "Recomendo criar 2 agentes:

                                                                     a) LEAD RESPONDER - Ollama local (custo R$0)
                                                                        Responde automaticamente leads novos em <5 min com mensagem personalizada
                                                                        Classifica urgencia e roteia pro consultor certo

                                                                     b) FOLLOW-UP BOT - Kimi 2.5 (custo incluso nos $25/mes)
                                                                        Faz follow-up de leads que nao responderam em 2h
                                                                        Envia mensagem via WhatsApp com oferta personalizada

                                                                     Estimativa: tempo de resposta cai de 3.8h pra <10min
                                                                     Conversao estimada: de 12% pra 22-25%
                                                                     ROI: +R$15.000/mes em faturamento

                                                                     Aprovar?"

                                                                  4. VOCE: "Aprovado"

                                                                  5. ATHENA executa:
                                                                     - INSERT ia_agents (Lead Responder, Ollama, mistral:7b)
                                                                     - INSERT ia_agents (Follow-up Bot, Kimi, kimi-2.5)
                                                                     - INSERT ia_tasks para cada um
                                                                     - INSERT ia_mae_decisoes (registro da decisao)

                                                                  6. AGENTES comecam a trabalhar imediatamente

                                                                  7. ATHENA monitora (diariamente):
                                                                     - "Lead Responder processou 28 leads hoje, tempo medio 3min. OK."
                                                                     - "Follow-up Bot enviou 12 follow-ups, 4 respostas, 2 agendamentos. OK."
                                                                     - Se performance cair, Athena ajusta ou substitui
                                                                  ```

                                                                  ---

                                                                  ## 9. STACK FINAL - CUSTO

                                                                  | Componente | Custo/mes | Justificativa |
                                                                  |---|---|---|
                                                                  | VPS Hostinger 8c/32GB | ja pago | Ja tem, roda Ollama + ChromaDB + Worker |
                                                                  | Ollama (Llama 3.1 + Mistral) | R$ 0 | Local na VPS, agentes de baixo custo |
                                                                  | Kimi 2.5 | ~R$ 125 ($25) | Ilimitado, conversacao e WhatsApp |
                                                                  | Claude API (Athena) | ~R$ 50-100 | Sonnet pra decisoes da Mae (uso moderado) |
                                                                  | ChromaDB | R$ 0 | Local na VPS |
                                                                  | Supabase | R$ 0 | Plano free do Lovable Cloud |
                                                                  | **TOTAL** | **~R$ 175-225/mes** | |

                                                                  ---

                                                                  ## 10. FASES DE IMPLEMENTACAO

                                                                  ### FASE A - KNOWLEDGE BASE (2-3 dias)
                                                                  - [ ] Criar METRICAS_NEGOCIO.md com dados reais da Doctor Auto
                                                                  - [ ] - [ ] Criar REGRAS_NEGOCIO.md com todas as regras
                                                                  - [ ] - [ ] Exportar dados das tabelas Supabase pra JSON
                                                                  - [ ] - [ ] Instalar ChromaDB na VPS
                                                                  - [ ] - [ ] Ingerir tudo no ChromaDB (vetorizacao)
                                                                  - [ ] - [ ] Executor: Voce (dados) + Claude Code (tecnico)
                                                                 
                                                                  - [ ] ### FASE B - CRIAR ATHENA (2-3 dias)
                                                                  - [ ] - [ ] Executar SQL das tabelas ia_knowledge_base e ia_mae_decisoes
                                                                  - [ ] - [ ] Inserir seed da Athena na ia_agents
                                                                  - [ ] - [ ] Criar worker athena.js na VPS (processo Node.js dedicado)
                                                                  - [ ] - [ ] Conectar Athena ao ChromaDB (RAG)
                                                                  - [ ] - [ ] Conectar Athena ao Supabase (leitura de dados)
                                                                  - [ ] - [ ] Testar: perguntar algo sobre a empresa e ver se responde com contexto
                                                                  - [ ] - [ ] Executor: Claude Code
                                                                 
                                                                  - [ ] ### FASE C - ATHENA NO COMMAND CENTER (1-2 dias)
                                                                  - [ ] - [ ] Criar AthenaChat.tsx no Command Center (chat direto com a Mae)
                                                                  - [ ] - [ ] Criar AthenaDashboard.tsx (decisoes pendentes, agentes criados, metricas)
                                                                  - [ ] - [ ] Integrar com ia_mae_decisoes (aprovar/rejeitar)
                                                                  - [ ] - [ ] Executor: Claude Code + Lovable
                                                                 
                                                                  - [ ] ### FASE D - ATHENA CRIANDO AGENTES (3-5 dias)
                                                                  - [ ] - [ ] Implementar funcao createAgent() no worker da Athena
                                                                  - [ ] - [ ] Athena gera spec JSON do agente -> insere em ia_agents
                                                                  - [ ] - [ ] Worker detecta novo agente -> instancia (Ollama ou Kimi)
                                                                  - [ ] - [ ] Testar: pedir pra Athena criar um agente simples
                                                                  - [ ] - [ ] Testar: Athena monitorar e ajustar agente
                                                                  - [ ] - [ ] Executor: Claude Code
                                                                 
                                                                  - [ ] ### FASE E - INTEGRACAO KOMMO (2-3 dias)
                                                                  - [ ] - [ ] Conectar Athena a API do Kommo (leads, pipeline, contatos)
                                                                  - [ ] - [ ] Alimentar knowledge base com dados do Kommo
                                                                  - [ ] - [ ] Athena cria primeiro agente real: Lead Responder
                                                                  - [ ] - [ ] Testar fluxo completo: lead entra -> agente responde
                                                                  - [ ] - [ ] Executor: Claude Code
                                                                 
                                                                  - [ ] ---
                                                                 
                                                                  - [ ] ## 11. COMO ISSO CONECTA COM O BLUEPRINT ANTERIOR
                                                                 
                                                                  - [ ] O BLUEPRINT_COMMAND_CENTER.md continua valido!
                                                                  - [ ] A diferenca e que agora:
                                                                 
                                                                  - [ ] - A IA Mae (Athena) SUBSTITUI a lista fixa de 19 agentes
                                                                  - [ ] - Os agentes Thales, Sophia, Simone, Anna Laura podem ser criados pela Athena
                                                                  - [ ] - Ou a Athena pode criar agentes DIFERENTES baseado no que ela acha melhor
                                                                  - [ ] - O Command Center continua sendo a interface
                                                                  - [ ] - As tabelas ia_agents, ia_logs, ia_tasks continuam as mesmas
                                                                  - [ ] - Adicionamos ia_knowledge_base e ia_mae_decisoes
                                                                 
                                                                  - [ ] ### Ordem de execucao:
                                                                  - [ ] 1. BLUEPRINT_COMMAND_CENTER.md Fases 1-4 (setup, preview, supabase, UI)
                                                                  - [ ] 2. BLUEPRINT_IA_MAE.md Fases A-B (knowledge base, criar Athena)
                                                                  - [ ] 3. BLUEPRINT_IA_MAE.md Fase C (Athena no Command Center)
                                                                  - [ ] 4. BLUEPRINT_IA_MAE.md Fases D-E (Athena criando agentes, Kommo)
                                                                  - [ ] 5. BLUEPRINT_COMMAND_CENTER.md Fases 5-7 (task manager, deploy, worker)
                                                                 
                                                                  - [ ] ---
                                                                 
                                                                  - [ ] ## 12. COMANDO PARA O CLAUDE CODE
                                                                 
                                                                  - [ ] Quando estiver pronto pra comecar a Fase A:
                                                                 
                                                                  - [ ] > "Leia os arquivos BLUEPRINT_COMMAND_CENTER.md e BLUEPRINT_IA_MAE.md.
                                                                  - [ ] > Entenda a arquitetura da IA Mae (Athena).
                                                                  - [ ] > Crie os arquivos METRICAS_NEGOCIO.md e REGRAS_NEGOCIO.md na raiz do projeto
                                                                  - [ ] > com templates para o Thales preencher com dados reais da Doctor Auto.
                                                                  - [ ] > Crie as migrations SQL para ia_knowledge_base e ia_mae_decisoes.
                                                                  - [ ] > Execute a FASE A do BLUEPRINT_IA_MAE."
                                                                 
                                                                  - [ ] ---
                                                                 
                                                                  - [ ] Documento vivo. Evolui conforme a Athena evolui.
                                                                  - [ ] Gerado em 16/02/2026 por Claude Opus 4.6 + Thales Oliveira.
                                                                  - [ ] Inspiracao: @tatagoncalvesof (Instagram) - OpenClaw + Claude Code.
