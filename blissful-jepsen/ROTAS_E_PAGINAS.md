# Doctor Auto - Rotas e Páginas

## Rotas Ativas (funcionando)

### Autenticação
| Rota | Página | Descrição |
|------|--------|-----------|
| `/` | Redirect | Redireciona para /login |
| `/login` | Login.tsx | Login da oficina (colaboradores) |
| `/trocar-senha` | TrocarSenha.tsx | Troca de senha no primeiro acesso |

### Admin (Visão Oficina)
| Rota | Página | Descrição |
|------|--------|-----------|
| `/admin` | AdminDashboard.tsx | Dashboard principal com pendências e abas |
| `/admin/overview` | AdminDashboardOverview.tsx | Visão geral com performance dos mecânicos |
| `/admin/operacional` | AdminOperacional.tsx | Tela operacional com status do pátio |
| `/admin/ordens-servico` | AdminOrdensServico.tsx | Lista de ordens de serviço |
| `/admin/nova-os` | AdminNovaOS.tsx | Criar nova OS |
| `/admin/os/:id` | AdminOSDetalhes.tsx | Detalhes de uma OS específica |
| `/admin/patio` | AdminPatio.tsx | Kanban do pátio |
| `/admin/patio/:id` | AdminPatioDetalhes.tsx | Detalhes de veículo no pátio |
| `/admin/agendamentos` | AdminAgendamentos.tsx | Lista de agendamentos |
| `/admin/agenda-mecanicos` | AdminAgendaMecanicos.tsx | Agenda dos mecânicos |
| `/admin/clientes` | AdminClientesPage.tsx | Cadastro de clientes |
| `/admin/servicos` | AdminServicos.tsx | Catálogo de serviços |
| `/admin/financeiro` | AdminFinanceiro.tsx | Dashboard financeiro |
| `/admin/produtividade` | AdminProdutividade.tsx | Relatórios de produtividade |
| `/admin/analytics-mecanicos` | AdminMechanicAnalytics.tsx | Analytics dos mecânicos |
| `/admin/feedback-mecanicos` | AdminMechanicFeedback.tsx | Feedbacks dos mecânicos |
| `/admin/documentacao` | AdminDocumentacao.tsx | Documentação do sistema |
| `/admin/configuracoes` | AdminConfiguracoes.tsx | Configurações da oficina |
| `/admin/painel-tv` | AdminPainelTV.tsx | Painel para TV da oficina |
| `/admin/pendencias` | AdminPendencias.tsx | Pendências da equipe |

### Gestão (Visão Gerencial)
| Rota | Página | Descrição |
|------|--------|-----------|
| `/gestao` | GestaoDashboards.tsx | Dashboard principal de gestão com 6 módulos |
| `/gestao/rh` | GestaoRH.tsx | Recursos Humanos - mecânicos e colaboradores |
| `/gestao/operacoes` | GestaoOperacoes.tsx | Operações - OS por status |
| `/gestao/financeiro` | GestaoFinanceiro.tsx | Financeiro - faturamento e metas |
| `/gestao/tecnologia` | GestaoTecnologia.tsx | Tecnologia - métricas do sistema |
| `/gestao/comercial` | GestaoComercial.tsx | Comercial e Marketing |
| `/gestao/melhorias` | GestaoMelhorias.tsx | Sugestões de melhorias |

---

## Páginas Copiadas (ainda não adaptadas)

### Cliente (Visão do Cliente) - PENDENTE ADAPTAÇÃO
| Arquivo | Descrição | Status |
|---------|-----------|--------|
| ClienteLogin.tsx | Login do cliente | ❌ Precisa adaptar |
| Index.tsx | Home do cliente | ❌ Precisa adaptar |
| ClienteDashboard.tsx | Dashboard do cliente | ❌ Precisa adaptar |
| Agenda.tsx | Agenda do cliente | ❌ Precisa adaptar |
| NovoAgendamento.tsx | Novo agendamento | ❌ Precisa adaptar |
| AgendamentoSucesso.tsx | Confirmação de agendamento | ❌ Precisa adaptar |
| Historico.tsx | Histórico de serviços | ❌ Precisa adaptar |
| Profile.tsx | Perfil do cliente | ❌ Precisa adaptar |
| Configuracoes.tsx | Configurações do cliente | ❌ Precisa adaptar |
| Avisos.tsx | Avisos/notificações | ❌ Precisa adaptar |
| OrcamentoCliente.tsx | Visualizar orçamento | ❌ Precisa adaptar |
| VehicleDetails.tsx | Detalhes do veículo | ❌ Precisa adaptar |
| ServicoDetalhes.tsx | Detalhes do serviço | ❌ Precisa adaptar |
| Promocoes.tsx | Promoções | ❌ Precisa adaptar |
| Reagendamento.tsx | Reagendar serviço | ❌ Precisa adaptar |
| Register.tsx | Cadastro de cliente | ❌ Precisa adaptar |

**Obs:** As páginas de cliente usam Supabase e precisam ser adaptadas para tRPC/MySQL.

---

## Arquivos de Páginas

### /client/src/pages/
```
Login.tsx
TrocarSenha.tsx
NotFound.tsx
Home.tsx
```

### /client/src/pages/admin/
```
AdminAgendaMecanicos.tsx
AdminAgendamentos.tsx
AdminClientes.tsx
AdminClientesPage.tsx
AdminConfiguracoes.tsx
AdminDashboard.tsx
AdminDashboardOverview.tsx
AdminDocumentacao.tsx
AdminFinanceiro.tsx
AdminMechanicAnalytics.tsx
AdminMechanicFeedback.tsx
AdminNovaOS.tsx
AdminOSDetalhes.tsx
AdminOperacional.tsx
AdminOrdensServico.tsx
AdminPainelTV.tsx
AdminPatio.tsx
AdminPatioDetalhes.tsx
AdminPendencias.tsx
AdminProdutividade.tsx
AdminServicos.tsx
```

### /client/src/pages/gestao/
```
GestaoComercial.tsx
GestaoDashboards.tsx
GestaoFinanceiro.tsx
GestaoMelhorias.tsx
GestaoOperacoes.tsx
GestaoRH.tsx
GestaoTecnologia.tsx
```

### /client/src/pages/cliente/ (copiadas, não adaptadas)
```
Agenda.tsx
AgendamentoSucesso.tsx
Avisos.tsx
ClienteDashboard.tsx
ClienteLogin.tsx
Configuracoes.tsx
Historico.tsx
Index.tsx
NovoAgendamento.tsx
OrcamentoCliente.tsx
Profile.tsx
Promocoes.tsx
Reagendamento.tsx
Register.tsx
ServicoDetalhes.tsx
VehicleDetails.tsx
```
