# Mapa Completo de Páginas — Doctor Auto

> Gerado automaticamente. 79 páginas mapeadas.

---

## LEGENDA

| Símbolo | Significado |
|---------|-------------|
| ✅ | Supabase real |
| 🔶 | Mock / dados hardcoded |
| ⚪ | Sem dados (página estática/placeholder) |
| 🔀 | Misto (parte real, parte mock) |
| 🟢 | Botão funcional (API/Supabase) |
| 🟡 | Botão de navegação |
| 🔴 | Botão decorativo (sem handler real) |

---

## 1. ROTAS PÚBLICAS

### `/login` → Login
- **Arquivo:** `src/pages/auth/Login.tsx`
- **Dados:** ✅ Supabase → `user_roles`, `colaboradores`
- **Botões:**
  - 🟢 "Entrar" → `supabase.auth.signInWithPassword` + verifica role
  - 🟢 "Continuar com Google" → `supabase.auth.signInWithProvider('google')`
  - 🟡 "Esqueci a senha" → navega `/trocar-senha`

### `/trocar-senha` → TrocarSenha
- **Arquivo:** `src/pages/TrocarSenha.tsx`
- **Dados:** ✅ Supabase Auth (`supabase.auth.updateUser`)
- **Botões:**
  - 🟢 "Alterar Senha" → `supabase.auth.updateUser()` + navega `/admin`
  - 🟡 Eye/EyeOff toggles (x3) → alterna visibilidade senha

### `/cliente/orcamento/:osId` → OrcamentoCliente
- **Arquivo:** `src/pages/cliente/OrcamentoCliente.tsx`
- **Dados:** ✅ Supabase → `ordens_servico`, `itens_ordem_servico`
- **Botões:**
  - 🟢 "Aprovar" (por item) → update `itens_ordem_servico` status
  - 🟢 "Recusar" (por item) → update com motivo recusa
  - 🟢 "Aprovar Todos" → batch update
  - 🟡 "Voltar" → navega back

### `/avisos` → Avisos
- **Arquivo:** `src/pages/Avisos.tsx`
- **Dados:** 🔶 Mock (`mockAlerts` hardcoded)
- **Botões:**
  - 🟡 "Agendar" → toast + navega `/novo-agendamento`
  - 🔴 X (dismiss) → remove do state local + toast

### `/perfil` → Profile
- **Arquivo:** `src/pages/Profile.tsx`
- **Dados:** ✅ Supabase → `colaboradores`, `clientes`, `ordens_servico`
- **Botões:**
  - 🟢 Carrega dados do perfil do Supabase
  - 🟡 Navegação para seções do app

---

## 2. ÁREA ADMINISTRATIVA (`/admin/*`)

### `/admin/dashboard` → Dashboard (Principal)
- **Arquivo:** `src/pages/admin/Dashboard.tsx`
- **Dados:** ✅ Supabase → `colaboradores`, `ordens_servico`, `clientes`, `veiculos`
- **Botões:**
  - 🟡 Cards de métricas → navegam para páginas específicas
  - 🟢 Carrega contagens em tempo real do banco

### `/admin/dashboard` → AdminDashboard (Painel com pendências)
- **Arquivo:** `src/pages/admin/AdminDashboard.tsx`
- **Dados:** ✅ Supabase → `pendencias`, `agendamentos`, `clientes`, `ordens_servico`, `gestao_alerts` (via hook `useAdminDashboard`)
- **Botões:**
  - 🟡 Cards clicáveis → abrem modais (agendamentos, retornos, veículos no pátio)
  - 🟡 "Nova OS" → navega `/admin/nova-os`
  - 🟡 "Ver Agenda" → navega `/admin/agendamentos`
  - 🟡 "Ver Pátio" → navega `/admin/patio`

### `/admin/overview` → VisaoGeral
- **Arquivo:** `src/pages/VisaoGeral.tsx`
- **Dados:** ✅ Supabase → `clientes`, `colaboradores`, `ordens_servico`
- **Botões:**
  - 🟢 Carrega métricas em tempo real
  - 🟡 Links para seções do admin

### `/admin/operacional` → AdminOperacional
- **Arquivo:** `src/pages/admin/AdminOperacional.tsx`
- **Dados:** ✅ Supabase → `ordens_servico`, `system_config`, `gestao_alerts`, `agendamentos`
- **Botões:**
  - 🟢 Carrega dados operacionais em tempo real
  - 🟡 Navegação entre seções

### `/admin/ordens-servico` → AdminOrdensServico
- **Arquivo:** `src/pages/admin/AdminOrdensServico.tsx`
- **Dados:** ✅ Supabase → `ordens_servico` (com join `clientes`, `veiculos`)
- **Botões:**
  - 🟡 "Nova OS" → navega `/admin/nova-os`
  - 🟡 Filtro por status → filtra lista local
  - 🟡 Campo de busca → busca por placa/cliente/nº OS
  - 🟡 Click na linha → navega `/admin/os/:id`

### `/admin/nova-os` → AdminNovaOS
- **Arquivo:** `src/pages/admin/AdminNovaOS.tsx`
- **Dados:** ✅ Supabase → `clientes`, `veiculos`, `ordens_servico`
- **Botões:**
  - 🟢 "Criar OS" → insert em `ordens_servico` + navega para detalhes
  - 🟢 "Novo Cliente" → insert em `clientes`
  - 🟢 "Novo Veículo" → insert em `veiculos`
  - 🟡 "Voltar" → navega `/admin/ordens-servico`

### `/admin/os/:id` → AdminOSDetalhes
- **Arquivo:** `src/pages/admin/AdminOSDetalhes.tsx`
- **Dados:** ✅ Supabase → `ordens_servico`, `historico_ordem_servico`, `itens_ordem_servico` (via hooks `useOSDetails` + `useOSItems`)
- **Botões:**
  - 🟢 "Salvar" (edição) → update `ordens_servico`
  - 🟢 "Enviar WhatsApp" → marca orçamento enviado + abre WhatsApp
  - 🟢 "Link" (copiar) → copia link do orçamento público
  - 🟢 "Adicionar Item" → insert em `itens_ordem_servico`
  - 🟢 Aprovar/Recusar/Resetar/Deletar item → CRUD em `itens_ordem_servico`
  - 🟢 Select de status → update `ordens_servico.status`
  - 🟢 Checklist → update checklist na OS
  - 🟡 "Voltar" → navega `/admin/ordens-servico`
  - 🔴 "Adicionar Fotos" → placeholder sem handler

### `/admin/os-ultimate` → OSUltimate
- **Arquivo:** `src/pages/admin/OSUltimate.tsx`
- **Dados:** 🔶 Mock (`dadosExemplo` hardcoded)
- **Botões:**
  - 🔴 "Link Cliente" → sem handler
  - 🔴 "Link Admin" → sem handler
  - 🔴 "Editar" → sem handler
  - 🔴 "Imprimir" → sem handler
  - 🔴 "Gerar Diagnóstico" → sem handler
  - 🔴 "Enviar WhatsApp" → sem handler
  - 🔴 "Enviar Sistema" → sem handler
  - 🔴 "Baixar PDF" → sem handler
  - 🟡 Seções expand/collapse → toggle local
  - 🟡 Aprovar/Recusar item → state local apenas

### `/admin/patio` → AdminPatio
- **Arquivo:** `src/pages/admin/AdminPatio.tsx`
- **Dados:** ✅ Supabase → `ordens_servico`, `historico_ordem_servico`
- **Botões:**
  - 🟢 Drag & Drop entre colunas → update `ordens_servico.status` + insert `historico_ordem_servico`
  - 🟡 Click no card → navega `/admin/patio/:id`
  - 🟡 Toggle auto-refresh → liga/desliga refresh 30s
  - 🟡 Busca por placa → filtra local

### `/admin/patio/:id` → AdminPatioDetalhes
- **Arquivo:** `src/pages/admin/AdminPatioDetalhes.tsx`
- **Dados:** ✅ Supabase → `ordens_servico`
- **Botões:**
  - 🟢 Alterar status → update `ordens_servico`
  - 🟢 Editar detalhes → update `ordens_servico`
  - 🟡 "Voltar" → navega `/admin/patio`

### `/admin/agendamentos` → AdminAgendamentos
- **Arquivo:** `src/pages/admin/AdminAgendamentos.tsx`
- **Dados:** ✅ Supabase → `agendamentos`, `clientes`, `veiculos`, `ordens_servico`
- **Botões:**
  - 🟢 "Novo Agendamento" → insert em `agendamentos`
  - 🟢 "Criar OS" (do agendamento) → insert em `ordens_servico` + update `agendamentos`
  - 🟢 "Confirmar" → update status agendamento
  - 🟢 "Cancelar" → update status agendamento
  - 🟡 Filtros data/status → filtra local

### `/admin/agenda-mecanicos` → AdminAgendaMecanicos
- **Arquivo:** `src/pages/admin/AdminAgendaMecanicos.tsx`
- **Dados:** ✅ Supabase → `mecanicos`, `ordens_servico`, `pendencias`
- **Botões:**
  - 🟢 Atribuir OS a mecânico → update `ordens_servico`
  - 🟢 Criar pendência → insert `pendencias`
  - 🟢 Concluir OS → update status
  - 🟡 Filtro por mecânico → filtra local

### `/admin/clientes` → AdminClientesPage
- **Arquivo:** `src/pages/admin/AdminClientesPage.tsx`
- **Dados:** ✅ Supabase → `clientes`, `veiculos`
- **Botões:**
  - 🟡 Busca por nome/CPF/telefone → filtra local
  - 🟡 Click no cliente → expande detalhes

### `/admin/veiculos` → AdminVeiculos
- **Arquivo:** `src/pages/admin/AdminVeiculos.tsx`
- **Dados:** ✅ Supabase → `clientes`
- **Botões:**
  - 🟡 Busca → filtra local
  - 🟡 Filtros → filtra local

### `/admin/servicos` → AdminServicos
- **Arquivo:** `src/pages/admin/AdminServicos.tsx`
- **Dados:** ⚪ Nenhum (placeholder "Em breve...")
- **Botões:** Nenhum

### `/admin/financeiro` → AdminFinanceiro
- **Arquivo:** `src/pages/admin/AdminFinanceiro.tsx`
- **Dados:** ✅ Supabase → `system_config`, `ordens_servico` (via hook `useFinanceiroDashboard`)
- **Botões:**
  - 🟢 "Atualizar" → refetch do Supabase
  - 🟢 "Salvar Metas" → upsert `system_config`
  - 🟡 Select período → filtra local
  - 🟡 "Configurar Metas" → abre modal
  - 🟡 Cards "Atrasado"/"Preso" → abrem modal de veículos

### `/admin/produtividade` → AdminProdutividade
- **Arquivo:** `src/pages/admin/AdminProdutividade.tsx`
- **Dados:** ✅ Supabase → `system_config`, `mecanicos`, `ordens_servico` (via hook `useProdutividadeDashboard`)
- **Botões:**
  - 🟢 "Atualizar" → refetch
  - 🟡 Select mecânico/categoria → filtra local
  - 🟡 Tabs semana 1-4 → troca período

### `/admin/analytics-mecanicos` → AdminMechanicAnalytics
- **Arquivo:** `src/pages/admin/AdminMechanicAnalytics.tsx`
- **Dados:** ✅ Supabase → `mecanicos`, `mechanic_daily_feedback`
- **Botões:**
  - 🟡 Select mecânico → filtra local
  - 🟡 Select período → filtra local

### `/admin/feedback-mecanicos` → AdminMechanicFeedback
- **Arquivo:** `src/pages/admin/AdminMechanicFeedback.tsx`
- **Dados:** ✅ Supabase → `mecanicos`, `mechanic_daily_feedback`, `gestao_alerts`
- **Botões:**
  - 🟢 "Salvar Feedback" → insert `mechanic_daily_feedback`
  - 🟢 Gera alerta se nota baixa → insert `gestao_alerts`
  - 🟡 Select mecânico → filtra

### `/admin/metas` → AdminMetas
- **Arquivo:** `src/pages/admin/AdminMetas.tsx`
- **Dados:** ✅ Supabase → `mecanicos`, `system_config`, `ordens_servico`, `clientes`
- **Botões:**
  - 🟢 "Salvar Metas" → upsert `system_config`
  - 🟡 Tabs categoria → troca visualização

### `/admin/relatorios` → AdminRelatorios
- **Arquivo:** `src/pages/admin/AdminRelatorios.tsx`
- **Dados:** ⚪ Nenhum (página de navegação estática)
- **Botões:**
  - 🟡 Card "Metas" → navega `/admin/metas`
  - 🟡 Card "Analytics Mecânicos" → navega `/admin/analytics-mecanicos`
  - 🟡 Card "Feedback Mecânicos" → navega `/admin/feedback-mecanicos`
  - 🟡 Seta voltar → navega `/admin`

### `/admin/documentacao` → AdminDocumentacao
- **Arquivo:** `src/pages/admin/AdminDocumentacao.tsx`
- **Dados:** ⚪ Nenhum (documentação estática)
- **Botões:**
  - 🟡 "Copiar Markdown" → copia para clipboard + toast
  - 🟡 "Baixar .md" → download arquivo

### `/admin/configuracoes` → AdminConfiguracoes
- **Arquivo:** `src/pages/admin/AdminConfiguracoes.tsx`
- **Dados:** ✅ Supabase → `system_config`
- **Botões:**
  - 🟢 "Salvar" → upsert `system_config`
  - 🟢 Carrega configurações do banco

### `/admin/pendencias` → AdminPendencias
- **Arquivo:** `src/pages/admin/AdminPendencias.tsx`
- **Dados:** ✅ Supabase → `pendencias`, `colaboradores`
- **Botões:**
  - 🟢 "Nova Pendência" → insert `pendencias`
  - 🟢 Update status/prioridade → update `pendencias`
  - 🟡 Filtros → filtra local

### `/admin/checklist` → AdminChecklist
- **Arquivo:** `src/pages/admin/AdminChecklist.tsx`
- **Dados:** 🔀 Misto (itens hardcoded, submit via edge function `proxy-checklist`)
- **Botões:**
  - 🟢 "Salvar / Enviar Checklist" → `supabase.functions.invoke('proxy-checklist')`
  - 🟡 Checkboxes → toggle local
  - 🟡 Textarea observações → input local

### `/admin/melhorias` → AdminMelhorias
- **Arquivo:** `src/pages/admin/AdminMelhorias.tsx`
- **Dados:** 🔶 Mock (`mockSugestoes`)
- **Botões:**
  - 🔴 "Nova Sugestão" → abre modal, adiciona ao state local, toast (sem API)
  - 🔴 ThumbsUp (votar) → incrementa state local + toast (sem API)
  - 🟡 Filtro status/categoria → filtra local
  - 🟡 Seta voltar → navega `/admin/configuracoes`

### `/admin/parametros` → AdminParametros
- **Arquivo:** `src/pages/admin/AdminParametros.tsx`
- **Dados:** ✅ Supabase → `system_config`, `user_roles` (via `useUserRole`)
- **Botões:**
  - 🟢 "Salvar" → upsert `system_config`
  - 🟢 Carrega parâmetros do banco

### `/admin/importar-veiculos-antigos` → ImportarVeiculosAntigos
- **Arquivo:** `src/pages/admin/ImportarVeiculosAntigos.tsx`
- **Dados:** ✅ Supabase → `veiculos_orfaos`
- **Botões:**
  - 🟢 Upload CSV → insert batch em `veiculos_orfaos`

### `/admin/usuarios` → AdminUsuarios
- **Arquivo:** `src/pages/admin/AdminUsuarios.tsx`
- **Dados:** ✅ Supabase → `user_roles`, `colaboradores`
- **Botões:**
  - 🟢 Carrega lista de usuários
  - 🟡 Visualização de roles

---

## 3. ÁREA DE GESTÃO (`/gestao/*`)

### `/gestao` → GestaoDashboards
- **Arquivo:** `src/pages/gestao/GestaoDashboards.tsx`
- **Dados:** ✅ Supabase → `clientes` (+ realtime subscription)
- **Botões:**
  - 🟡 Cards de navegação → navegam para sub-páginas

### `/gestao/rh` → GestaoRH
- **Arquivo:** `src/pages/gestao/GestaoRH.tsx`
- **Dados:** ✅ Supabase → `mecanicos`
- **Botões:**
  - 🟡 Seta voltar → navega `/gestao`

### `/gestao/operacoes` → GestaoOperacoes
- **Arquivo:** `src/pages/gestao/GestaoOperacoes.tsx`
- **Dados:** ✅ Supabase → `ordens_servico`
- **Botões:**
  - 🟡 Seta voltar → navega `/gestao`

### `/gestao/financeiro` → GestaoFinanceiro
- **Arquivo:** `src/pages/gestao/GestaoFinanceiro.tsx`
- **Dados:** ✅ Supabase → `system_config`, `ordens_servico` (via `useFinanceiroDashboard`)
- **Botões:**
  - 🟡 Seta voltar → navega `/gestao`
  - 🟡 Cards "Preso"/"Atrasado" → abrem modal

### `/gestao/tecnologia` → GestaoTecnologia
- **Arquivo:** `src/pages/gestao/GestaoTecnologia.tsx`
- **Dados:** 🔀 Misto (KPIs mock `mockKpis` + `user_roles` real via `useUserRole`)
- **Botões:**
  - 🟡 "Acessar" Dashboard Orçamentos → navega `/admin/orcamentos`
  - 🟡 Tab "Assistentes IA" → gated por role
  - 🟡 Seta voltar → navega `/gestao`

### `/gestao/comercial` → GestaoComercial
- **Arquivo:** `src/pages/gestao/GestaoComercial.tsx`
- **Dados:** ✅ Supabase → `clientes` (+ realtime subscription)
- **Botões:**
  - 🟡 Seta voltar → navega `/gestao`

### `/gestao/melhorias` → GestaoMelhorias
- **Arquivo:** `src/pages/gestao/GestaoMelhorias.tsx`
- **Dados:** 🔶 Mock (`mockSugestoes`)
- **Botões:**
  - 🔴 "Nova Sugestão" → modal, adiciona ao state local (sem API)
  - 🟡 Seta voltar → navega `/gestao`

### `/gestao/veiculos-orfaos` → GestaoVeiculosOrfaos
- **Arquivo:** `src/pages/gestao/GestaoVeiculosOrfaos.tsx`
- **Dados:** ✅ Supabase → `veiculos_orfaos`, `clientes`, `veiculos`
- **Botões:**
  - 🟢 "Vincular" veículo → insert `veiculos` + update `veiculos_orfaos`
  - 🟢 "Ignorar" → update `veiculos_orfaos`
  - 🟡 Busca → filtra local

---

## 4. ÁREA DO CLIENTE / APP

### `/app/garagem` → ClienteGaragem
- **Arquivo:** `src/pages/app/Garagem.tsx`
- **Dados:** ✅ Supabase → `colaboradores`, `clientes`, `veiculos`, `ordens_servico`
- **Botões:**
  - 🟡 Cards de veículos → expandem detalhes
  - 🟡 Navegação do app

---

## 5. PÁGINAS INTERNAS MOCK (não têm rota principal)

### `/__orphan/admin-dashboard-ias` → AdminDashboardIAs
- **Arquivo:** `src/pages/admin/AdminDashboardIAs.tsx`
- **Dados:** 🔶 Mock (objetos estáticos)
- **Botões:**
  - 🔴 "Atualizar" → sem handler
  - 🟡 5 cards IA (Zoraide, Anna, João, Luiz, Pedro) → troca painel ativo

### `/__orphan/admin-dashboard-orcamentos` → AdminDashboardOrcamentos
- **Arquivo:** `src/pages/admin/AdminDashboardOrcamentos.tsx`
- **Dados:** 🔶 Mock (constantes `METRICAS`, `PRIORIDADES`, etc.)
- **Botões:**
  - 🔴 "Filtros" → sem handler
  - 🔴 "Exportar" → sem handler
  - 🔴 "Atualizar" → spinner fake (setTimeout, sem API)
  - 🔴 "Enviar Campanha de Retorno" → sem handler
  - 🔴 Ícones telefone/mensagem → sem handler
  - 🟡 Tabs período → troca local

### `/__orphan/admin-monitoramento-kommo` → AdminMonitoramentoKommo
- **Arquivo:** `src/pages/admin/AdminMonitoramentoKommo.tsx`
- **Dados:** 🔶 Mock (`IAS_EXERCITO`)
- **Botões:** Visualização apenas

### `/__orphan/admin-painel-tv` → AdminPainelTV
- **Arquivo:** `src/pages/admin/AdminPainelTV.tsx`
- **Dados:** ✅ Supabase → `mecanicos`, `agenda_mecanicos`, `workflow_etapas`, `agendamentos`
- **Botões:**
  - 🟢 Atualiza agendamentos em tempo real
  - 🟡 Auto-refresh

---

## 6. PÁGINAS ÓRFÃS DO CLIENTE

### `/__orphan/os-acompanhamento` → OSClienteAcompanhamento
- **Arquivo:** `src/pages/OSClienteAcompanhamento.tsx`
- **Dados:** 🔶 Mock (`dadosExemplo`)
- **Botões:**
  - 🔴 "Atualizar" → spinner fake (1.5s, sem API)
  - 🟡 "Falar com Oficina" → abre WhatsApp
  - 🟡 "Ligar" → `tel:` link

### `/__orphan/os-orcamento` → OSClienteOrcamento
- **Arquivo:** `src/pages/OSClienteOrcamento.tsx`
- **Dados:** 🔶 Mock (`dadosExemplo`)
- **Botões:**
  - 🔴 "Aprovar todos" → state local apenas
  - 🔴 "Aprovar"/"Recusar" por item → state local apenas
  - 🔴 "Confirmar" → `alert()` apenas
  - 🟡 "Falar com Oficina" → abre WhatsApp

---

## 7. OUTRAS ROTAS REGISTRADAS

| Rota | Componente | Arquivo | Dados |
|------|-----------|---------|-------|
| `/` | Redirect → `/admin/dashboard` | — | — |
| `/404` | NotFound | `src/pages/NotFound.tsx` | ⚪ |
| `/__dev` | DevScreens | `src/pages/__dev/DevScreens.tsx` | ⚪ |
| `/__dev/explorer` | DevExplorer | `src/pages/__dev/DevExplorer.tsx` | ⚪ |

---

## 8. RESUMO DE TABELAS SUPABASE

### Tabelas mais usadas
| Tabela | Nº de Páginas |
|--------|:---:|
| `ordens_servico` | 25 |
| `clientes` | 20 |
| `veiculos` | 13 |
| `user_roles` | 8 |
| `colaboradores` | 7 |
| `mecanicos` | 7 |
| `system_config` | 6 |
| `agendamentos` | 6 |
| `pendencias` | 4 |
| `client_service_history` (view) | 4 |
| `gestao_alerts` | 3 |
| `historico_ordem_servico` | 3 |
| `itens_ordem_servico` | 2 |
| `mechanic_daily_feedback` | 2 |
| `veiculos_orfaos` | 2 |
| `clientes_crm` | 1 |
| `clientes_metricas` | 1 |
| `agenda_mecanicos` | 1 |
| `workflow_etapas` | 1 |
| `catalogo_servicos` | 1 |

### Tabelas NUNCA usadas (0 páginas)
- `agenda_snapshots`
- `empresas`
- `promocoes`
- `promocoes_tracking`
- `push_subscriptions`
- `recursos`

---

## 9. PÁGINAS COM DADOS MOCK (precisam conectar ao Supabase)

| Página | Arquivo | Tipo de Mock |
|--------|---------|-------------|
| Avisos | `src/pages/Avisos.tsx` | `mockAlerts` |
| OS Acompanhamento | `src/pages/OSClienteAcompanhamento.tsx` | `dadosExemplo` |
| OS Orçamento (legacy) | `src/pages/OSClienteOrcamento.tsx` | `dadosExemplo` |
| Dashboard IAs | `src/pages/admin/AdminDashboardIAs.tsx` | objetos estáticos |
| Dashboard Orçamentos | `src/pages/admin/AdminDashboardOrcamentos.tsx` | constantes |
| Melhorias (admin) | `src/pages/admin/AdminMelhorias.tsx` | `mockSugestoes` |
| Monitoramento Kommo | `src/pages/admin/AdminMonitoramentoKommo.tsx` | `IAS_EXERCITO` |
| OS Ultimate | `src/pages/admin/OSUltimate.tsx` | `dadosExemplo` |
| Kommo v2 | `src/pages/gestao/AdminMonitoramentoKommo-v2.tsx` | `alertasMock` |
| Melhorias (gestão) | `src/pages/gestao/GestaoMelhorias.tsx` | `mockSugestoes` |
| Tecnologia (KPIs) | `src/pages/gestao/GestaoTecnologia.tsx` | `mockKpis` |

---

## 10. BOTÕES DECORATIVOS (sem funcionalidade real)

| Página | Botão | Status |
|--------|-------|--------|
| OSUltimate | "Link Cliente", "Link Admin", "Editar", "Imprimir", "Gerar Diagnóstico", "Enviar WhatsApp", "Enviar Sistema", "Baixar PDF" | 🔴 Sem handler |
| AdminDashboardOrcamentos | "Filtros", "Exportar", "Enviar Campanha de Retorno", ícones telefone/mensagem | 🔴 Sem handler |
| AdminDashboardIAs | "Atualizar" | 🔴 Sem handler |
| AdminMelhorias | "Nova Sugestão", votos | 🔴 State local apenas |
| GestaoMelhorias | "Nova Sugestão" | 🔴 State local apenas |
| OSClienteAcompanhamento | "Atualizar" | 🔴 Spinner fake |
| OSClienteOrcamento | "Confirmar", "Aprovar" | 🔴 State local / alert() |
| AdminOSDetalhes | "Adicionar Fotos" | 🔴 Placeholder |
| AdminServicos | — | ⚪ Página vazia |
