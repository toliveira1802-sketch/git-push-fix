# 📋 MAPA COMPLETO DO SISTEMA - Doctor Car

> **Última atualização:** 2026-02-03  
> **Ambiente:** Lovable Cloud (Supabase integrado)  
> **URL Preview:** https://id-preview--7175ffd2-29ee-4bd1-8af6-4ee556488123.lovable.app  
> **URL Publicada:** https://pushy-pal-files.lovable.app

---

## 📍 LOCALIZAÇÃO DO BANCO DE DADOS

| Item | Informação |
|------|------------|
| **Provedor** | Lovable Cloud (Supabase gerenciado) |
| **Project ID** | `anlazsytwwedfayfwupu` |
| **URL Supabase** | `https://anlazsytwwedfayfwupu.supabase.co` |
| **Acesso** | Via Lovable Cloud UI (não há acesso direto ao dashboard Supabase) |
| **Ambientes** | Test (desenvolvimento) e Live (produção) |

> ⚠️ **Importante:** O banco de dados está hospedado no Lovable Cloud, que utiliza Supabase internamente. Todas as tabelas são acessadas via `@/integrations/supabase/client`.

---

## 🗂️ ESTRUTURA DE ROTAS E PÁGINAS

### 1. ROTAS PÚBLICAS (Sem Autenticação)

| Rota | Componente | Status | Descrição |
|------|------------|--------|-----------|
| `/` | Redirect → `/login` | ✅ Linkado | Redireciona para login |
| `/login` | `Login.tsx` | ✅ Linkado | Página de login principal |
| `/trocar-senha` | `TrocarSenha.tsx` | ✅ Linkado | Troca de senha obrigatória |
| `/__dev` | `DevScreens.tsx` | ✅ Linkado | Tela de desenvolvimento |
| `/404` | `NotFound.tsx` | ✅ Linkado | Página não encontrada |

---

### 2. ROTAS ADMIN (Role: admin, gestao, dev)

| Rota | Componente | Status | Acessível Via |
|------|------------|--------|---------------|
| `/admin` | `AdminDashboard.tsx` | ✅ Linkado | Menu Principal |
| `/admin/overview` | `AdminDashboardOverview.tsx` | ❌ Órfã | Sem link no menu |
| `/admin/operacional` | `AdminOperacional.tsx` | ✅ Linkado | Dashboard (botão) |
| `/admin/ordens-servico` | `AdminOrdensServico.tsx` | ✅ Linkado | Sidebar → Ordens de Serviço |
| `/admin/nova-os` | `AdminNovaOS.tsx` | ✅ Linkado | Via AdminOrdensServico |
| `/admin/os/:id` | `AdminOSDetalhes.tsx` | ✅ Linkado | Via lista de OS |
| `/admin/os-ultimate/:id` | `OSUltimate.tsx` | ✅ Linkado | Via AdminOSDetalhes |
| `/admin/patio` | `AdminPatio.tsx` | ✅ Linkado | Sidebar → Pátio |
| `/admin/patio/:id` | `AdminPatioDetalhes.tsx` | ✅ Linkado | Via Kanban do Pátio |
| `/admin/agendamentos` | `AdminAgendamentos.tsx` | ✅ Linkado | Sidebar → Agendamentos |
| `/admin/agenda-mecanicos` | `AdminAgendaMecanicos.tsx` | ✅ Linkado | Dashboard (botão) |
| `/admin/clientes` | `AdminClientesPage.tsx` | ✅ Linkado | Sidebar → Clientes |
| `/admin/servicos` | `AdminServicos.tsx` | ✅ Linkado | Sidebar → Serviços |
| `/admin/financeiro` | `AdminFinanceiro.tsx` | ✅ Linkado | Dashboard (botão) |
| `/admin/produtividade` | `AdminProdutividade.tsx` | ✅ Linkado | Dashboard (botão) |
| `/admin/analytics-mecanicos` | `AdminMechanicAnalytics.tsx` | ❌ Órfã | Sem link direto |
| `/admin/feedback-mecanicos` | `AdminMechanicFeedback.tsx` | ❌ Órfã | Sem link direto |
| `/admin/documentacao` | `AdminDocumentacao.tsx` | ❌ Órfã | Sem link direto |
| `/admin/configuracoes` | `AdminConfiguracoes.tsx` | ✅ Linkado | Sidebar → Configurações |
| `/admin/pendencias` | `AdminPendencias.tsx` | ✅ Linkado | Dashboard (card) |
| `/admin/checklist` | `AdminChecklist.tsx` | ❌ Órfã | Sem link direto |
| `/admin/importar-veiculos-antigos` | `ImportarVeiculosAntigos.tsx` | ❌ Órfã | Sem link direto |

---

### 3. ROTAS GESTÃO (Role: gestao, dev)

| Rota | Componente | Status | Acessível Via |
|------|------------|--------|---------------|
| `/gestao` | `GestaoDashboards.tsx` | ✅ Linkado | Seletor de módulo |
| `/gestao/rh` | `GestaoRH.tsx` | ✅ Linkado | Dashboard Gestão |
| `/gestao/operacoes` | `GestaoOperacoes.tsx` | ✅ Linkado | Dashboard Gestão |
| `/gestao/financeiro` | `GestaoFinanceiro.tsx` | ✅ Linkado | Dashboard Gestão |
| `/gestao/tecnologia` | `GestaoTecnologia.tsx` | ✅ Linkado | Dashboard Gestão |
| `/gestao/comercial` | `GestaoComercial.tsx` | ✅ Linkado | Dashboard Gestão |
| `/gestao/melhorias` | `GestaoMelhorias.tsx` | ✅ Linkado | Dashboard Gestão |
| `/gestao/veiculos-orfaos` | `GestaoVeiculosOrfaos.tsx` | ✅ Linkado | Dashboard Gestão |

---

### 4. ROTAS CLIENTE (Role: user)

| Rota | Componente | Status | Acessível Via |
|------|------------|--------|---------------|
| `/cliente/orcamento/:osId` | `OrcamentoCliente.tsx` | ✅ Linkado | Link enviado ao cliente |

---

### 5. PÁGINAS ÓRFÃS (Existem mas não estão no Router)

| Arquivo | Descrição | Status |
|---------|-----------|--------|
| `src/pages/Agenda.tsx` | Agenda legado | ❌ Não roteado |
| `src/pages/AgendamentoSucesso.tsx` | Sucesso agendamento | ❌ Não roteado |
| `src/pages/Avisos.tsx` | Avisos | ❌ Não roteado |
| `src/pages/ComponentShowcase.tsx` | Showcase | ❌ Não roteado |
| `src/pages/Configuracoes.tsx` | Config cliente | ❌ Não roteado |
| `src/pages/Historico.tsx` | Histórico cliente | ❌ Não roteado |
| `src/pages/Home.tsx` | Home cliente | ❌ Não roteado |
| `src/pages/Index.tsx` | Index antigo | ❌ Não roteado |
| `src/pages/NovoAgendamento.tsx` | Novo agendamento | ❌ Não roteado |
| `src/pages/OSClienteAcompanhamento.tsx` | Acompanhamento OS | ❌ Não roteado |
| `src/pages/OSClienteOrcamento.tsx` | Orçamento cliente | ❌ Não roteado |
| `src/pages/Performance.tsx` | Performance | ❌ Não roteado |
| `src/pages/Profile.tsx` | Perfil usuário | ❌ Não roteado |
| `src/pages/Register.tsx` | Registro | ❌ Não roteado |
| `src/pages/Veiculos.tsx` | Veículos cliente | ❌ Não roteado |
| `src/pages/VisaoGeral.tsx` | Visão geral | ❌ Não roteado |
| `src/pages/admin/AdminClientes.tsx` | Clientes v1 | ❌ Não roteado (substituído) |
| `src/pages/admin/AdminDashboardIAs.tsx` | Dashboard IA | ❌ Não roteado |
| `src/pages/admin/AdminDashboardOrcamentos.tsx` | Dashboard Orçamentos | ❌ Não roteado |
| `src/pages/admin/AdminLogin.tsx` | Login admin | ❌ Não roteado |
| `src/pages/admin/AdminMelhorias.tsx` | Melhorias | ❌ Não roteado |
| `src/pages/admin/AdminMetas.tsx` | Metas | ❌ Não roteado |
| `src/pages/admin/AdminMonitoramentoKommo.tsx` | Kommo | ❌ Não roteado |
| `src/pages/admin/AdminPainelTV.tsx` | Painel TV | ❌ Não roteado |
| `src/pages/admin/AdminParametros.tsx` | Parâmetros | ❌ Não roteado |
| `src/pages/admin/AdminVeiculos.tsx` | Veículos admin | ❌ Não roteado |
| `src/pages/admin/Cadastros.tsx` | Cadastros | ❌ Não roteado |
| `src/pages/admin/Clientes.tsx` | Clientes legado | ❌ Não roteado |
| `src/pages/admin/ImportarDados.tsx` | Importar dados | ❌ Não roteado |
| `src/pages/admin/MonitoramentoPatio.tsx` | Monit. Pátio | ❌ Não roteado |
| `src/pages/admin/NovaOS.tsx` | Nova OS legado | ❌ Não roteado |
| `src/pages/admin/OrdensServico.tsx` | OS legado | ❌ Não roteado |
| `src/pages/admin/Pendencias.tsx` | Pendências legado | ❌ Não roteado |
| `src/pages/os/OSUltimateClient.tsx` | OS Ultimate Client | ❌ Não roteado |
| `src/pages/cliente/LoginCliente.tsx` | Login cliente | ❌ Não roteado |
| `src/pages/gestao/AdminMonitoramentoKommo-v2.tsx` | Kommo v2 | ❌ Não roteado |

---

## 📊 MAPA DE TABELAS DO BANCO DE DADOS

### Localização: Lovable Cloud (Supabase)

| # | Tabela | RLS | Descrição |
|---|--------|-----|-----------|
| 1 | `agenda_mecanicos` | ✅ | Agenda dos mecânicos |
| 2 | `agenda_snapshots` | ✅ | Snapshots da agenda |
| 3 | `agendamentos` | ✅ | Agendamentos de clientes |
| 4 | `catalogo_servicos` | ✅ | Catálogo de serviços |
| 5 | `clientes` | ✅ | Cadastro de clientes |
| 6 | `clientes_crm` | ✅ | Dados CRM do cliente |
| 7 | `clientes_metricas` | ✅ | Métricas do cliente |
| 8 | `colaboradores` | ✅ | Colaboradores/usuários |
| 9 | `empresas` | ✅ | Empresas/unidades |
| 10 | `gestao_alerts` | ✅ | Alertas de gestão |
| 11 | `historico_ordem_servico` | ✅ | Histórico de OS |
| 12 | `itens_ordem_servico` | ✅ | Itens das OS |
| 13 | `mecanicos` | ✅ | Cadastro de mecânicos |
| 14 | `mechanic_daily_feedback` | ✅ | Feedback dos mecânicos |
| 15 | `ordens_servico` | ✅ | Ordens de serviço |
| 16 | `pendencias` | ✅ | Pendências/tarefas |
| 17 | `promocoes` | ✅ | Promoções |
| 18 | `promocoes_tracking` | ✅ | Tracking de promoções |
| 19 | `push_subscriptions` | ✅ | Inscrições push |
| 20 | `recursos` | ✅ | Recursos (elevadores, etc) |
| 21 | `system_config` | ✅ | Configurações sistema |
| 22 | `user_roles` | ✅ | Roles dos usuários |
| 23 | `veiculos` | ✅ | Veículos dos clientes |
| 24 | `veiculos_orfaos` | ✅ | Veículos sem dono |
| 25 | `workflow_etapas` | ✅ | Etapas do workflow |

### Views

| View | Descrição |
|------|-----------|
| `client_service_history` | Histórico completo do cliente |

---

## 🔗 USO DAS TABELAS POR PÁGINA/HOOK

### Hooks (src/hooks/)

| Hook | Tabelas Utilizadas |
|------|-------------------|
| `useAdminDashboard.tsx` | `agendamentos`, `clientes`, `ordens_servico`, `veiculos`, `gestao_alerts` |
| `useClientData.tsx` | `clientes`, `veiculos`, `ordens_servico` |
| `useCRMData.tsx` | `clientes`, `clientes_crm`, `clientes_metricas`, `ordens_servico` |
| `useFinanceiroDashboard.tsx` | `ordens_servico`, `itens_ordem_servico`, `empresas` |
| `useImportData.tsx` | `clientes`, `veiculos` |
| `useOSDetails.tsx` | `ordens_servico`, `itens_ordem_servico`, `veiculos`, `clientes`, `mecanicos` |
| `useOSItems.tsx` | `itens_ordem_servico`, `ordens_servico` |
| `usePatioKanban.tsx` | `ordens_servico`, `veiculos`, `clientes`, `mecanicos`, `workflow_etapas` |
| `useProdutividadeDashboard.tsx` | `ordens_servico`, `mecanicos`, `empresas` |
| `useUserRole.tsx` | `user_roles` |
| `useCreateClientUser.tsx` | `clientes` (edge function) |

---

### Páginas Admin

| Página | Tabelas Utilizadas |
|--------|-------------------|
| `AdminDashboard.tsx` | Via `useAdminDashboard` |
| `AdminOperacional.tsx` | `ordens_servico`, `agendamentos`, `mecanicos`, `pendencias` |
| `AdminOrdensServico.tsx` | `ordens_servico`, `veiculos`, `clientes` |
| `AdminNovaOS.tsx` | `clientes`, `veiculos`, `ordens_servico`, `mecanicos` |
| `AdminOSDetalhes.tsx` | Via `useOSDetails` |
| `AdminPatio.tsx` | Via `usePatioKanban` |
| `AdminAgendamentos.tsx` | `agendamentos`, `clientes`, `veiculos` |
| `AdminAgendaMecanicos.tsx` | `agenda_mecanicos`, `mecanicos`, `ordens_servico` |
| `AdminClientesPage.tsx` | `clientes`, `veiculos`, `clientes_metricas` |
| `AdminServicos.tsx` | `catalogo_servicos` |
| `AdminFinanceiro.tsx` | Via `useFinanceiroDashboard` |
| `AdminProdutividade.tsx` | Via `useProdutividadeDashboard` |
| `AdminMechanicAnalytics.tsx` | `mecanicos`, `ordens_servico`, `mechanic_daily_feedback` |
| `AdminMechanicFeedback.tsx` | `mecanicos`, `mechanic_daily_feedback` |
| `AdminConfiguracoes.tsx` | `system_config`, `empresas` |
| `AdminPendencias.tsx` | `pendencias`, `mecanicos`, `ordens_servico` |
| `AdminChecklist.tsx` | `ordens_servico` (entry_checklist) |
| `OSUltimate.tsx` | Via `useOSDetails`, `useOSItems` |
| `ImportarVeiculosAntigos.tsx` | `veiculos_orfaos` |

---

### Páginas Gestão

| Página | Tabelas Utilizadas |
|--------|-------------------|
| `GestaoDashboards.tsx` | `gestao_alerts`, `ordens_servico` |
| `GestaoRH.tsx` | `mecanicos`, `mechanic_daily_feedback` |
| `GestaoOperacoes.tsx` | `ordens_servico`, `pendencias` |
| `GestaoFinanceiro.tsx` | `ordens_servico`, `itens_ordem_servico` |
| `GestaoTecnologia.tsx` | `system_config` |
| `GestaoComercial.tsx` | `clientes_crm`, `clientes`, `promocoes`, `promocoes_tracking` |
| `GestaoMelhorias.tsx` | `gestao_alerts` |
| `GestaoVeiculosOrfaos.tsx` | `veiculos_orfaos` |

---

### Componentes

| Componente | Tabelas Utilizadas |
|------------|-------------------|
| `AdminLayout.tsx` | `user_roles`, `colaboradores` |
| `OSSearchCreate.tsx` | `clientes`, `veiculos`, `ordens_servico` |
| `DiagnosticoIA.tsx` | `ordens_servico` (diagnosis) |
| `KanbanCardDetails.tsx` | `ordens_servico`, `itens_ordem_servico` |
| `EditProfileDialog.tsx` | `colaboradores` |
| `ForcePasswordChange.tsx` | `auth.users` (via auth) |

---

### Contexts

| Context | Tabelas Utilizadas |
|---------|-------------------|
| `AuthContext.tsx` | `auth.users`, `colaboradores`, `user_roles` |
| `CompanyContext.tsx` | `empresas`, `colaboradores` |

---

## 🔐 EDGE FUNCTIONS

| Function | Descrição | Secrets Usados |
|----------|-----------|----------------|
| `ai-oficina` | IA para diagnóstico | `LOVABLE_API_KEY` |
| `create-admin-user` | Criar usuário admin | `SUPABASE_SERVICE_ROLE_KEY` |
| `create-client-user` | Criar usuário cliente | `SUPABASE_SERVICE_ROLE_KEY` |
| `create-quick-client` | Cliente rápido | `SUPABASE_SERVICE_ROLE_KEY` |
| `import-veiculos-orfaos` | Importar veículos | `SUPABASE_SERVICE_ROLE_KEY` |
| `reset-dev-password` | Reset senha dev | `SUPABASE_SERVICE_ROLE_KEY` |
| `sync-trello` | Sync Trello | `TRELLO_API_KEY`, `TRELLO_API_TOKEN`, `TRELLO_BOARD_ID` |
| `trello-boards` | Listar boards | `TRELLO_API_KEY`, `TRELLO_API_TOKEN` |

---

## 📈 RESUMO ESTATÍSTICO

| Métrica | Valor |
|---------|-------|
| **Total de Rotas Ativas** | 30 |
| **Rotas Admin** | 19 |
| **Rotas Gestão** | 8 |
| **Rotas Cliente** | 1 |
| **Rotas Públicas** | 5 |
| **Páginas Órfãs** | 36 |
| **Tabelas no Banco** | 25 |
| **Views** | 1 |
| **Edge Functions** | 8 |
| **Hooks com Supabase** | 11 |
| **Storage Buckets** | 1 (love) |

---

## 🎯 RECOMENDAÇÕES

### Páginas Órfãs para Avaliar

1. **Remover ou Integrar:**
   - Arquivos duplicados (AdminClientes vs AdminClientesPage)
   - Versões legado (NovaOS.tsx, OrdensServico.tsx, Pendencias.tsx)
   
2. **Integrar ao Menu:**
   - `AdminMechanicAnalytics.tsx` → Adicionar ao submenu de Mecânicos
   - `AdminMechanicFeedback.tsx` → Adicionar ao submenu de Mecânicos
   - `AdminDocumentacao.tsx` → Adicionar ao menu de Configurações
   - `AdminPainelTV.tsx` → Criar link específico

3. **Portal do Cliente (Futuro):**
   - `Home.tsx`, `Veiculos.tsx`, `Historico.tsx` → Portal completo do cliente
   - `Profile.tsx`, `Configuracoes.tsx` → Área do usuário

---

## 📝 NOTAS TÉCNICAS

- **Autenticação:** Supabase Auth via Lovable Cloud
- **RLS:** Todas as tabelas possuem políticas de Row Level Security
- **Roles:** `user`, `admin`, `gestao`, `dev`
- **Realtime:** Não habilitado atualmente
- **Storage:** Bucket `love` (público)

---

*Documento gerado automaticamente. Mantenha atualizado ao adicionar novas páginas ou tabelas.*
