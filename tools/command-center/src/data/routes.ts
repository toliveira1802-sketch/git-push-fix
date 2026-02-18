import { RouteConfig } from '../types/routes';

// Position helpers for visual map layout
let idCounter = 0;
function rid() { return `route-${++idCounter}`; }

export const DOCTOR_AUTO_ROUTES: RouteConfig[] = [
  // AUTH (3)
  { id: rid(), path: '/', component: 'Redirect', category: 'auth', status: 'active', requiresAuth: false, roles: [], description: 'Redireciona para /login', fileName: 'index', x: 50, y: 50 },
  { id: rid(), path: '/login', component: 'Login', category: 'auth', status: 'active', requiresAuth: false, roles: [], description: 'Login da oficina', fileName: 'auth/Login.tsx', x: 200, y: 50 },
  { id: rid(), path: '/trocar-senha', component: 'TrocarSenha', category: 'auth', status: 'active', requiresAuth: true, roles: ['admin','gestao','user','dev'], description: 'Troca de senha no primeiro acesso', fileName: 'TrocarSenha.tsx', x: 400, y: 50 },

  // ADMIN - Dashboard & Overview (5)
  { id: rid(), path: '/admin/dashboard', component: 'AdminDashboard', category: 'admin', status: 'active', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Dashboard principal com pendencias e abas', fileName: 'admin/Dashboard.tsx', x: 50, y: 200 },
  { id: rid(), path: '/admin', component: 'AdminDashboard', category: 'admin', status: 'active', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Redireciona para /admin/dashboard', fileName: 'admin/Dashboard.tsx', x: 200, y: 200 },
  { id: rid(), path: '/admin/overview', component: 'AdminDashboardOverview', category: 'admin', status: 'orphan', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Visao geral com performance mecanicos', fileName: 'admin/AdminDashboardOverview.tsx', x: 350, y: 200 },
  { id: rid(), path: '/admin/operacional', component: 'AdminOperacional', category: 'admin', status: 'orphan', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Tela operacional com status do patio', fileName: 'admin/AdminOperacional.tsx', x: 500, y: 200 },

  // ADMIN - Ordens de Servico (5)
  { id: rid(), path: '/admin/ordens-servico', component: 'AdminOrdensServico', category: 'admin', status: 'active', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Lista de ordens de servico', fileName: 'admin/AdminOrdensServico.tsx', x: 50, y: 350 },
  { id: rid(), path: '/admin/nova-os', component: 'AdminNovaOS', category: 'admin', status: 'active', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Criar nova OS', fileName: 'admin/AdminNovaOS.tsx', x: 200, y: 350 },
  { id: rid(), path: '/admin/os/:id', component: 'AdminOSDetalhes', category: 'admin', status: 'active', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Detalhes de uma OS', fileName: 'admin/AdminOSDetalhes.tsx', x: 350, y: 350 },
  { id: rid(), path: '/admin/os-ultimate', component: 'OSUltimate', category: 'admin', status: 'active', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'OS Ultimate interface', fileName: 'admin/OSUltimate.tsx', x: 500, y: 350 },
  { id: rid(), path: '/admin/os-ultimate/:id', component: 'OSUltimate', category: 'admin', status: 'active', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'OS Ultimate com detalhes', fileName: 'admin/OSUltimate.tsx', x: 650, y: 350 },

  // ADMIN - Patio (2)
  { id: rid(), path: '/admin/patio', component: 'AdminPatio', category: 'admin', status: 'active', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Kanban do patio', fileName: 'admin/AdminPatio.tsx', x: 50, y: 500 },
  { id: rid(), path: '/admin/patio/:id', component: 'AdminPatioDetalhes', category: 'admin', status: 'active', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Detalhes veiculo no patio', fileName: 'admin/AdminPatioDetalhes.tsx', x: 200, y: 500 },

  // ADMIN - Agenda (2)
  { id: rid(), path: '/admin/agendamentos', component: 'AdminAgendamentos', category: 'admin', status: 'active', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Lista de agendamentos', fileName: 'admin/AdminAgendamentos.tsx', x: 350, y: 500 },
  { id: rid(), path: '/admin/agenda-mecanicos', component: 'AdminAgendaMecanicos', category: 'admin', status: 'active', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Agenda dos mecanicos', fileName: 'admin/AdminAgendaMecanicos.tsx', x: 500, y: 500 },

  // ADMIN - Clientes & Servicos (2)
  { id: rid(), path: '/admin/clientes', component: 'AdminClientesPage', category: 'admin', status: 'active', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Cadastro de clientes', fileName: 'admin/AdminClientesPage.tsx', x: 50, y: 650 },
  { id: rid(), path: '/admin/servicos', component: 'AdminServicos', category: 'admin', status: 'active', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Catalogo de servicos', fileName: 'admin/AdminServicos.tsx', x: 200, y: 650 },

  // ADMIN - Financeiro & Analytics (5)
  { id: rid(), path: '/admin/financeiro', component: 'AdminFinanceiro', category: 'admin', status: 'active', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Dashboard financeiro', fileName: 'admin/AdminFinanceiro.tsx', x: 350, y: 650 },
  { id: rid(), path: '/admin/produtividade', component: 'AdminProdutividade', category: 'admin', status: 'active', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Relatorios produtividade', fileName: 'admin/AdminProdutividade.tsx', x: 500, y: 650 },
  { id: rid(), path: '/admin/analytics-mecanicos', component: 'AdminMechanicAnalytics', category: 'admin', status: 'orphan', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Analytics dos mecanicos', fileName: 'admin/AdminMechanicAnalytics.tsx', x: 650, y: 650 },
  { id: rid(), path: '/admin/feedback-mecanicos', component: 'AdminMechanicFeedback', category: 'admin', status: 'orphan', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Feedbacks dos mecanicos', fileName: 'admin/AdminMechanicFeedback.tsx', x: 800, y: 650 },
  { id: rid(), path: '/admin/metas', component: 'AdminMetas', category: 'admin', status: 'orphan', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Metas e objetivos', fileName: 'admin/AdminMetas.tsx', x: 950, y: 650 },

  // ADMIN - Config & Relatorios (7)
  { id: rid(), path: '/admin/relatorios', component: 'AdminRelatorios', category: 'admin', status: 'orphan', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Relatorios do sistema', fileName: 'admin/AdminRelatorios.tsx', x: 50, y: 800 },
  { id: rid(), path: '/admin/documentacao', component: 'AdminDocumentacao', category: 'admin', status: 'orphan', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Documentacao do sistema', fileName: 'admin/AdminDocumentacao.tsx', x: 200, y: 800 },
  { id: rid(), path: '/admin/configuracoes', component: 'AdminConfiguracoes', category: 'admin', status: 'active', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Configuracoes da oficina', fileName: 'admin/AdminConfiguracoes.tsx', x: 350, y: 800 },
  { id: rid(), path: '/admin/pendencias', component: 'AdminPendencias', category: 'admin', status: 'active', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Pendencias da equipe', fileName: 'admin/AdminPendencias.tsx', x: 500, y: 800 },
  { id: rid(), path: '/admin/checklist', component: 'AdminChecklist', category: 'admin', status: 'orphan', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Checklist de OS', fileName: 'admin/AdminChecklist.tsx', x: 650, y: 800 },
  { id: rid(), path: '/admin/importar-veiculos-antigos', component: 'ImportarVeiculosAntigos', category: 'admin', status: 'orphan', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Importar dados veiculos antigos', fileName: 'admin/ImportarVeiculosAntigos.tsx', x: 800, y: 800 },
  { id: rid(), path: '/admin/usuarios', component: 'AdminUsuarios', category: 'admin', status: 'orphan', requiresAuth: true, roles: ['dev'], description: 'Gerenciamento usuarios (Dev)', fileName: 'admin/AdminUsuarios.tsx', x: 950, y: 800 },

  // GESTAO (8)
  { id: rid(), path: '/gestao', component: 'GestaoDashboards', category: 'gestao', status: 'active', requiresAuth: true, roles: ['gestao','dev'], description: 'Dashboard principal de gestao com 6 modulos', fileName: 'gestao/GestaoDashboards.tsx', x: 50, y: 1000 },
  { id: rid(), path: '/gestao/rh', component: 'GestaoRH', category: 'gestao', status: 'active', requiresAuth: true, roles: ['gestao','dev'], description: 'Recursos Humanos', fileName: 'gestao/GestaoRH.tsx', x: 200, y: 1000 },
  { id: rid(), path: '/gestao/operacoes', component: 'GestaoOperacoes', category: 'gestao', status: 'active', requiresAuth: true, roles: ['gestao','dev'], description: 'Operacoes - OS por status', fileName: 'gestao/GestaoOperacoes.tsx', x: 350, y: 1000 },
  { id: rid(), path: '/gestao/financeiro', component: 'GestaoFinanceiro', category: 'gestao', status: 'active', requiresAuth: true, roles: ['gestao','dev'], description: 'Financeiro - faturamento e metas', fileName: 'gestao/GestaoFinanceiro.tsx', x: 500, y: 1000 },
  { id: rid(), path: '/gestao/tecnologia', component: 'GestaoTecnologia', category: 'gestao', status: 'active', requiresAuth: true, roles: ['gestao','dev'], description: 'Tecnologia - metricas sistema', fileName: 'gestao/GestaoTecnologia.tsx', x: 650, y: 1000 },
  { id: rid(), path: '/gestao/comercial', component: 'GestaoComercial', category: 'gestao', status: 'active', requiresAuth: true, roles: ['gestao','dev'], description: 'Comercial e Marketing', fileName: 'gestao/GestaoComercial.tsx', x: 800, y: 1000 },
  { id: rid(), path: '/gestao/melhorias', component: 'GestaoMelhorias', category: 'gestao', status: 'active', requiresAuth: true, roles: ['gestao','dev'], description: 'Sugestoes de melhorias', fileName: 'gestao/GestaoMelhorias.tsx', x: 950, y: 1000 },
  { id: rid(), path: '/gestao/veiculos-orfaos', component: 'GestaoVeiculosOrfaos', category: 'gestao', status: 'active', requiresAuth: true, roles: ['gestao','dev'], description: 'Gerenciamento veiculos orfaos', fileName: 'gestao/GestaoVeiculosOrfaos.tsx', x: 1100, y: 1000 },

  // CLIENTE (2)
  { id: rid(), path: '/app/garagem', component: 'ClienteGaragem', category: 'cliente', status: 'active', requiresAuth: true, roles: ['user'], description: 'Garagem Virtual - Portal do Cliente', fileName: 'app/Garagem.tsx', x: 50, y: 1150 },
  { id: rid(), path: '/cliente/orcamento/:osId', component: 'OrcamentoCliente', category: 'cliente', status: 'active', requiresAuth: false, roles: [], description: 'Visualizar orcamento via link publico', fileName: 'cliente/OrcamentoCliente.tsx', x: 250, y: 1150 },

  // DEV (2)
  { id: rid(), path: '/__dev', component: 'DevScreens', category: 'dev', status: 'active', requiresAuth: false, roles: [], description: 'Tela de desenvolvimento', fileName: '__dev/DevScreens.tsx', x: 50, y: 1300 },
  { id: rid(), path: '/__dev/explorer', component: 'DevExplorer', category: 'dev', status: 'active', requiresAuth: false, roles: [], description: 'Explorador de paginas orfas', fileName: '__dev/DevExplorer.tsx', x: 250, y: 1300 },

  // PUBLIC (1)
  { id: rid(), path: '/404', component: 'NotFound', category: 'public', status: 'active', requiresAuth: false, roles: [], description: 'Pagina nao encontrada', fileName: 'NotFound.tsx', x: 450, y: 1300 },

  // ORPHANS - Root (19)
  { id: rid(), path: '/__orphan/agenda', component: 'Agenda', category: 'orphan', status: 'lazy-loaded', requiresAuth: false, roles: [], description: 'Agenda legado', fileName: 'Agenda.tsx', x: 50, y: 1500 },
  { id: rid(), path: '/__orphan/agendamento-sucesso', component: 'AgendamentoSucesso', category: 'orphan', status: 'lazy-loaded', requiresAuth: false, roles: [], description: 'Confirmacao de agendamento', fileName: 'AgendamentoSucesso.tsx', x: 200, y: 1500 },
  { id: rid(), path: '/__orphan/avisos', component: 'Avisos', category: 'orphan', status: 'lazy-loaded', requiresAuth: false, roles: [], description: 'Avisos/notificacoes', fileName: 'Avisos.tsx', x: 350, y: 1500 },
  { id: rid(), path: '/__orphan/component-showcase', component: 'ComponentShowcase', category: 'orphan', status: 'lazy-loaded', requiresAuth: false, roles: [], description: 'Showcase de componentes', fileName: 'ComponentShowcase.tsx', x: 500, y: 1500 },
  { id: rid(), path: '/__orphan/configuracoes', component: 'Configuracoes', category: 'orphan', status: 'lazy-loaded', requiresAuth: false, roles: [], description: 'Configuracoes cliente', fileName: 'Configuracoes.tsx', x: 650, y: 1500 },
  { id: rid(), path: '/__orphan/dashboard-cockpit', component: 'DashboardCockpit', category: 'orphan', status: 'lazy-loaded', requiresAuth: false, roles: [], description: 'Dashboard Cockpit', fileName: 'DashboardCockpit.tsx', x: 800, y: 1500 },
  { id: rid(), path: '/__orphan/historico', component: 'Historico', category: 'orphan', status: 'lazy-loaded', requiresAuth: false, roles: [], description: 'Historico de servicos', fileName: 'Historico.tsx', x: 950, y: 1500 },
  { id: rid(), path: '/__orphan/home', component: 'Home', category: 'orphan', status: 'lazy-loaded', requiresAuth: false, roles: [], description: 'Home cliente', fileName: 'Home.tsx', x: 50, y: 1650 },
  { id: rid(), path: '/__orphan/index', component: 'Index', category: 'orphan', status: 'lazy-loaded', requiresAuth: false, roles: [], description: 'Index antigo', fileName: 'Index.tsx', x: 200, y: 1650 },
  { id: rid(), path: '/__orphan/login-old', component: 'LoginOld', category: 'orphan', status: 'lazy-loaded', requiresAuth: false, roles: [], description: 'Login legado', fileName: 'Login.tsx', x: 350, y: 1650 },
  { id: rid(), path: '/__orphan/minha-garagem', component: 'MinhaGaragem', category: 'orphan', status: 'lazy-loaded', requiresAuth: false, roles: [], description: 'Minha Garagem', fileName: 'MinhaGaragem.tsx', x: 500, y: 1650 },
  { id: rid(), path: '/__orphan/novo-agendamento', component: 'NovoAgendamento', category: 'orphan', status: 'lazy-loaded', requiresAuth: false, roles: [], description: 'Novo agendamento', fileName: 'NovoAgendamento.tsx', x: 650, y: 1650 },
  { id: rid(), path: '/__orphan/os-acompanhamento', component: 'OSClienteAcompanhamento', category: 'orphan', status: 'lazy-loaded', requiresAuth: false, roles: [], description: 'Acompanhamento de OS', fileName: 'OSClienteAcompanhamento.tsx', x: 800, y: 1650 },
  { id: rid(), path: '/__orphan/os-orcamento', component: 'OSClienteOrcamento', category: 'orphan', status: 'lazy-loaded', requiresAuth: false, roles: [], description: 'Orcamento cliente', fileName: 'OSClienteOrcamento.tsx', x: 950, y: 1650 },
  { id: rid(), path: '/__orphan/performance', component: 'Performance', category: 'orphan', status: 'lazy-loaded', requiresAuth: false, roles: [], description: 'Performance', fileName: 'Performance.tsx', x: 50, y: 1800 },
  { id: rid(), path: '/__orphan/profile', component: 'Profile', category: 'orphan', status: 'lazy-loaded', requiresAuth: false, roles: [], description: 'Perfil do usuario', fileName: 'Profile.tsx', x: 200, y: 1800 },
  { id: rid(), path: '/__orphan/register', component: 'Register', category: 'orphan', status: 'lazy-loaded', requiresAuth: false, roles: [], description: 'Registro de usuario', fileName: 'Register.tsx', x: 350, y: 1800 },
  { id: rid(), path: '/__orphan/veiculos', component: 'Veiculos', category: 'orphan', status: 'lazy-loaded', requiresAuth: false, roles: [], description: 'Veiculos cliente', fileName: 'Veiculos.tsx', x: 500, y: 1800 },
  { id: rid(), path: '/__orphan/visao-geral', component: 'VisaoGeral', category: 'orphan', status: 'lazy-loaded', requiresAuth: false, roles: [], description: 'Visao geral', fileName: 'VisaoGeral.tsx', x: 650, y: 1800 },

  // ORPHANS - Admin (17)
  { id: rid(), path: '/__orphan/admin-clientes', component: 'AdminClientes', category: 'orphan', status: 'lazy-loaded', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Clientes v1 (substituido)', fileName: 'admin/AdminClientes.tsx', x: 50, y: 2000 },
  { id: rid(), path: '/__orphan/admin-dashboard-old', component: 'AdminDashboard', category: 'orphan', status: 'lazy-loaded', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Dashboard versao antiga', fileName: 'admin/AdminDashboard.tsx', x: 200, y: 2000 },
  { id: rid(), path: '/__orphan/admin-dashboard-ias', component: 'AdminDashboardIAs', category: 'orphan', status: 'lazy-loaded', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Dashboard com IA - RECONECTAR', fileName: 'admin/AdminDashboardIAs.tsx', x: 350, y: 2000 },
  { id: rid(), path: '/__orphan/admin-dashboard-orcamentos', component: 'AdminDashboardOrcamentos', category: 'orphan', status: 'lazy-loaded', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Dashboard de orcamentos', fileName: 'admin/AdminDashboardOrcamentos.tsx', x: 500, y: 2000 },
  { id: rid(), path: '/__orphan/admin-dashboard-overview', component: 'AdminDashboardOverview', category: 'orphan', status: 'lazy-loaded', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Overview do dashboard', fileName: 'admin/AdminDashboardOverview.tsx', x: 650, y: 2000 },
  { id: rid(), path: '/__orphan/admin-login', component: 'AdminLogin', category: 'orphan', status: 'lazy-loaded', requiresAuth: false, roles: [], description: 'Login admin', fileName: 'admin/AdminLogin.tsx', x: 800, y: 2000 },
  { id: rid(), path: '/__orphan/admin-melhorias', component: 'AdminMelhorias', category: 'orphan', status: 'lazy-loaded', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Sugestoes de melhorias', fileName: 'admin/AdminMelhorias.tsx', x: 950, y: 2000 },
  { id: rid(), path: '/__orphan/admin-monitoramento-kommo', component: 'AdminMonitoramentoKommo', category: 'orphan', status: 'lazy-loaded', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Monitoramento Kommo - RECONECTAR', fileName: 'admin/AdminMonitoramentoKommo.tsx', x: 50, y: 2150 },
  { id: rid(), path: '/__orphan/admin-operacional', component: 'AdminOperacional', category: 'orphan', status: 'lazy-loaded', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Painel operacional', fileName: 'admin/AdminOperacional.tsx', x: 200, y: 2150 },
  { id: rid(), path: '/__orphan/admin-painel-tv', component: 'AdminPainelTV', category: 'orphan', status: 'lazy-loaded', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Painel para TV - RECONECTAR', fileName: 'admin/AdminPainelTV.tsx', x: 350, y: 2150 },
  { id: rid(), path: '/__orphan/admin-parametros', component: 'AdminParametros', category: 'orphan', status: 'lazy-loaded', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Parametros do sistema', fileName: 'admin/AdminParametros.tsx', x: 500, y: 2150 },
  { id: rid(), path: '/__orphan/admin-veiculos', component: 'AdminVeiculos', category: 'orphan', status: 'lazy-loaded', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Gestao de veiculos', fileName: 'admin/AdminVeiculos.tsx', x: 650, y: 2150 },
  { id: rid(), path: '/__orphan/cadastros', component: 'Cadastros', category: 'orphan', status: 'lazy-loaded', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Cadastros gerais', fileName: 'admin/Cadastros.tsx', x: 800, y: 2150 },
  { id: rid(), path: '/__orphan/clientes-legacy', component: 'Clientes', category: 'orphan', status: 'lazy-loaded', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Clientes legado', fileName: 'admin/Clientes.tsx', x: 950, y: 2150 },
  { id: rid(), path: '/__orphan/importar-dados', component: 'ImportarDados', category: 'orphan', status: 'lazy-loaded', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Importar dados', fileName: 'admin/ImportarDados.tsx', x: 50, y: 2300 },
  { id: rid(), path: '/__orphan/monitoramento-patio', component: 'MonitoramentoPatio', category: 'orphan', status: 'lazy-loaded', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Monitoramento do patio', fileName: 'admin/MonitoramentoPatio.tsx', x: 200, y: 2300 },
  { id: rid(), path: '/__orphan/nova-os-legacy', component: 'NovaOS', category: 'orphan', status: 'lazy-loaded', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Nova OS legado', fileName: 'admin/NovaOS.tsx', x: 350, y: 2300 },
  { id: rid(), path: '/__orphan/ordens-servico-legacy', component: 'OrdensServico', category: 'orphan', status: 'lazy-loaded', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Ordens de servico legado', fileName: 'admin/OrdensServico.tsx', x: 500, y: 2300 },
  { id: rid(), path: '/__orphan/pendencias-legacy', component: 'Pendencias', category: 'orphan', status: 'lazy-loaded', requiresAuth: true, roles: ['admin','gestao','dev'], description: 'Pendencias legado', fileName: 'admin/Pendencias.tsx', x: 650, y: 2300 },

  // ORPHANS - Gestao & Cliente (3)
  { id: rid(), path: '/__orphan/kommo-v2', component: 'KommoV2', category: 'orphan', status: 'lazy-loaded', requiresAuth: true, roles: ['gestao','dev'], description: 'Kommo v2', fileName: 'gestao/AdminMonitoramentoKommo-v2.tsx', x: 800, y: 2300 },
  { id: rid(), path: '/__orphan/login-cliente', component: 'LoginCliente', category: 'orphan', status: 'lazy-loaded', requiresAuth: false, roles: [], description: 'Login do cliente', fileName: 'cliente/LoginCliente.tsx', x: 950, y: 2300 },
  { id: rid(), path: '/__orphan/os-ultimate-client', component: 'OSUltimateClient', category: 'orphan', status: 'lazy-loaded', requiresAuth: false, roles: [], description: 'OS Ultimate versao cliente', fileName: 'os/OSUltimateClient.tsx', x: 1100, y: 2300 },
];

// Helper functions
export function getRoutesByCategory(category: RouteConfig['category']) {
  return DOCTOR_AUTO_ROUTES.filter(r => r.category === category);
}

export function getRoutesByStatus(status: RouteConfig['status']) {
  return DOCTOR_AUTO_ROUTES.filter(r => r.status === status);
}

export function getRouteStats() {
  const total = DOCTOR_AUTO_ROUTES.length;
  const active = DOCTOR_AUTO_ROUTES.filter(r => r.status === 'active').length;
  const orphan = DOCTOR_AUTO_ROUTES.filter(r => r.status === 'orphan').length;
  const lazy = DOCTOR_AUTO_ROUTES.filter(r => r.status === 'lazy-loaded').length;
  return { total, active, orphan, lazy };
}
