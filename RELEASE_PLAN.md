# Doctor Auto — Plano de Releases

> Sistema de IA para gestão inteligente de oficinas mecânicas premium
> Diretor: Thales | 3 unidades em São Paulo

---

## Visão Geral da Arquitetura

```
┌─────────────────────┐     ┌──────────────────────────────┐
│   Site Doctor Auto   │     │      VPS Hostinger KVM 8     │
│   (Vercel/Lovable)   │     │         (Docker)             │
│                      │     │                              │
│  React 19 + Vite     │     │  ┌────────────────────────┐  │
│  Supabase + tRPC     │     │  │   Sophia (IA Mãe)      │  │
│  ERP/CRM ~30 pages   │     │  │   Ollama LLMs local    │  │
│                      │     │  │   Claude API fallback   │  │
│  IAs de Oficina:     │     │  └────────┬───────────────┘  │
│  • Dr. Auto          │     │           │                  │
│  • Anna Laura        │     │  ┌────────┴───────────────┐  │
│  • Orça Pro          │     │  │  Princesas (filhas)    │  │
│                      │     │  │  • Anna (Atendimento)  │  │
│                      │◄────┤  │  • Simone (Financeiro) │  │
│                      │bots │  │  • Thamy (Marketing)   │  │
│                      │     │  └────────────────────────┘  │
│                      │     │                              │
│                      │     │  Redis │ ChromaDB │ Nginx    │
│                      │     │  Bot SQL │ Certbot           │
└─────────────────────┘     └──────────────────────────────┘
                                         ▲
                                         │ ÚNICO ACESSO HUMANO
                                    ┌────┴─────┐
                                    │ Command  │
                                    │ Center   │
                                    │ :5174    │
                                    └──────────┘
```

---

## Releases

### v0.1 — Command Center Base ✅ CONCLUÍDO
**Status:** `DONE` | **Branch:** `claude-athena`

| Item | Status |
|------|--------|
| Canvas visual com 30+ rotas do site | ✅ |
| Zoom, pan, drag nos nodes | ✅ |
| Painel de detalhes por rota | ✅ |
| Conexões automáticas por categoria | ✅ |
| Editor de notas por rota | ✅ |
| Barra de busca e filtros | ✅ |
| Sidebar com abas | ✅ |
| Rename Athena → Sophia (IA Rainha) | ✅ |
| Sophia Chat (Command Center) | ✅ |
| Sophia Dashboard (decisões, princesas, knowledge, observer) | ✅ |
| Sophia Avatars (DiceBear + custom URL + personalidade) | ✅ |
| Sophia Observer (auto-aprende ações do usuário) | ✅ |
| Conexões editáveis (flow, redirect, api, data) | ✅ |
| Persistência de conexões no Supabase | ✅ |
| Fix Tailwind v3/v4 conflict | ✅ |
| PostCSS config isolado | ✅ |

---

### v0.2 — Deploy Site Lovable (Vercel)
**Status:** `PENDENTE` | **Estimativa:** 1-2 dias

| Item | Descrição |
|------|-----------|
| Vercel deploy | Configurar projeto no Vercel com env vars |
| Domínio | Conectar domínio doctorauto.com.br (ou similar) |
| Env vars | VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY |
| SSL | Automático via Vercel |
| CI/CD | Push to main → auto deploy |
| Preview | Branch deploys para testar antes de mergear |
| Supabase prod | Verificar se o projeto Supabase está em modo production |

---

### v0.3 — Command Center Polish
**Status:** `PENDENTE` | **Estimativa:** 2-3 dias

| Item | Descrição |
|------|-----------|
| KPI cards editáveis | Definir métricas por rota (faturamento, OS, etc.) |
| Minimap | Visão geral do canvas no canto |
| Export PNG/PDF | Exportar mapa visual das rotas |
| Atalhos de teclado | Ctrl+F busca, Del remove conexão, etc. |
| Histórico de alterações | Log de quem mudou o que no Command Center |
| Mobile responsive | Adaptar para tablet (Thales usa no dia a dia) |

---

### v0.4 — Supabase Realtime + Tabelas IA
**Status:** `PENDENTE` | **Estimativa:** 2-3 dias

| Item | Descrição |
|------|-----------|
| Tabelas IA | Garantir schema: ia_agents, ia_tasks, ia_logs, ia_knowledge_base |
| RLS policies | Row Level Security para proteger dados entre unidades |
| Realtime channels | Subscriptions para tasks, logs, knowledge |
| Edge Functions | Funções serverless para processamento leve |
| Backup automático | Supabase daily backups habilitado |
| Índices | Otimizar queries frequentes (por agent_id, status, data) |

---

### v0.5 — Docker Deploy VPS ✅ CONCLUÍDO
**Status:** `DONE` | **Branch:** `claude-athena`

| Item | Status |
|------|--------|
| Docker Compose (8 serviços + multi-stage build) | ✅ |
| Ollama setup (llama3.1:8b + mistral:7b) | ✅ |
| ChromaDB (vector store RAG) | ✅ |
| Redis (task queue + cache + pub/sub) | ✅ |
| Nginx (reverse proxy + SSL + rate limiting + webhook) | ✅ |
| Health checks (wget em cada container) | ✅ |
| Volumes persistentes (models, vectors, redis) | ✅ |
| .env seguro (.env.example documentado) | ✅ |
| FORCE_CLAUDE flag | ✅ |
| Firewall (setup-vps.sh: UFW 80/443/SSH) | ✅ |
| Sophia HTTP Server (:3000) pra Command Center | ✅ |
| Deploy script (setup-vps.sh completo) | ✅ |

---

### v0.6 — Bot SQL Funcional ✅ CONCLUÍDO
**Status:** `DONE` | **Branch:** `claude-athena`

| Item | Status |
|------|--------|
| Bot SQL service (container + HTTP :3001) | ✅ |
| Query builder (Ollama NL→SQL) | ✅ |
| Read-only mode (regex bloqueia INSERT/UPDATE/DELETE) | ✅ |
| Sanitização (forbidden keywords + LIMIT auto) | ✅ |
| Schema cache (TTL configurável) | ✅ |
| Logs (toda query em ia_logs) | ✅ |
| Rate limiting (Nginx zone=sql 10r/m) | ✅ |

---

### v0.7 — Bots Intermediários (Site ↔ Sophia) ✅ CONCLUÍDO
**Status:** `DONE` | **Branch:** `claude-athena`

> **IMPORTANTE**: Sophia é invisível no site. Ninguém interage diretamente com ela exceto via Command Center. Bots/cronjobs levam dados do site até ela.

| Item | Status |
|------|--------|
| Bot Coletor (metricas-rapidas: 5min, OS, clientes) | ✅ |
| Bot Alimentador (sync-knowledge: 1h → ChromaDB) | ✅ |
| Bot Monitor (monitor-anomalias: 15min, alertas auto) | ✅ |
| Scheduler (5 cronjobs com intervalos configuráveis) | ✅ |
| Filtros (Sophia processa alertas como tasks) | ✅ |
| Webhook listener (POST /webhook: OS, leads, pagamentos, reclamações) | ✅ |
| Queue Redis (enqueue/dequeue/pub-sub funcional) | ✅ |
| Cleanup automático (logs 30+ dias) | ✅ |

---

### v0.8 — Princesas com Funções Reais ✅ CONCLUÍDO
**Status:** `DONE` | **Branch:** `claude-athena`

| Item | Status |
|------|--------|
| **Anna** (Atendimento) - prompt completo + canais WhatsApp/chat/email | ✅ |
| **Simone** (Financeiro) - prompt completo + análise + alertas | ✅ |
| **Thamy** (Marketing) - prompt completo + copy + campanhas | ✅ |
| Especialização LLM (cada princesa com system prompt próprio) | ✅ |
| Knowledge base (query por princesa com ChromaDB fallback) | ✅ |
| Escalation (shouldEscalate → cria task pra Sophia) | ✅ |
| Auto-criação no boot (ensureDefaultPrincesses) | ✅ |
| Realtime monitor (nova princesa criada → worker inicia auto) | ✅ |
| Princess polling loop (8s, independente por princesa) | ✅ |
| Avatar + personalidade (config_json com cor e especialidade) | ✅ |

---

### v0.9 — Integração Kommo CRM
**Status:** `PENDENTE` | **Estimativa:** 4-5 dias

| Item | Descrição |
|------|-----------|
| Kommo API | Conectar pipeline de vendas/atendimento |
| Sync bidirecional | Leads Kommo ↔ Clientes Supabase |
| Anna + Kommo | Anna responde leads automaticamente |
| Pipeline automático | Sophia move leads entre estágios baseado em regras |
| Tags inteligentes | Sophia categoriza leads por potencial |
| Relatórios | Dashboard de conversão no Command Center |
| Webhooks | Kommo notifica eventos → Sophia processa |

---

### v1.0 — Sophia Auto-Decisão + Semi-Auto
**Status:** `PENDENTE` | **Estimativa:** 5-7 dias

| Item | Descrição |
|------|-----------|
| Modo semi-auto | Sophia sugere → Thales aprova no Command Center |
| Modo auto | Ações de baixo risco executadas automaticamente |
| Confidence score | Sophia calcula confiança de cada decisão |
| Threshold config | Thales define: >80% confiança = auto, <80% = pedir aprovação |
| Audit trail | Todo auto-decisão logada com justificativa |
| Rollback | Desfazer decisões automáticas se necessário |
| Dashboard decisões | Histórico completo com filtros no Command Center |
| Alertas críticos | Push notification para decisões que precisam atenção |
| Learning loop | Sophia aprende com aprovações/rejeições do Thales |

---

## Timeline Estimada

```
Jan/2025  ████████████ v0.1 ✅ Command Center Base
          ███          v0.2    Deploy Vercel (pendente)
Fev/2025  █████        v0.3    CC Polish (pendente)
          █████        v0.4    Supabase Realtime (pendente)
          ████████     v0.5 ✅ Docker VPS + HTTP Server
          ██████       v0.6 ✅ Bot SQL Funcional
          ████████     v0.7 ✅ Bots Intermediários (cronjobs + webhooks)
          ██████████   v0.8 ✅ Princesas Reais (Anna, Simone, Thamy)
          ████████     v0.9 ← PRÓXIMO: Kommo CRM
          ██████████   v1.0    Sophia Auto-Decisão
```

> **Nota**: Timeline é estimativa. Depende de disponibilidade e complexidade real encontrada em cada fase.

---

## Regras de Ouro

1. **Sophia é INVISÍVEL** — Ninguém no site interage com ela. Apenas Command Center.
2. **Bots são intermediários** — Dados fluem via cronjobs/webhooks, nunca via chat direto.
3. **Ollama primeiro** — LLMs locais (custo zero). Claude API só como fallback.
4. **Command Center = único acesso** — Só o Thales dá ordens. Protege o sistema.
5. **Tudo logado** — ia_logs registra toda ação. Auditoria completa.
6. **Princesas escalam** — Não sabem algo? Sobe pra Sophia decidir.

---

*Gerado pelo Command Center — Doctor Auto AI System*
*Última atualização: Fevereiro 2025*
