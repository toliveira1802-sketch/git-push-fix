import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CompanyProvider } from "./contexts/CompanyContext";
import { AuthProvider } from "./contexts/AuthContext";


// Auth Pages
import Login from "./pages/auth/Login";
import TrocarSenha from "./pages/TrocarSenha";

// Admin Pages (Staff)
import AdminDashboard from "./pages/admin/Dashboard";
import AdminOrdensServico from "./pages/admin/AdminOrdensServico";
import AdminNovaOS from "./pages/admin/AdminNovaOS";
import AdminOSDetalhes from "./pages/admin/AdminOSDetalhes";
import AdminPatio from "./pages/admin/AdminPatio";
import AdminPatioDetalhes from "./pages/admin/AdminPatioDetalhes";
import AdminAgendamentos from "./pages/admin/AdminAgendamentos";
import AdminAgendaMecanicos from "./pages/admin/AdminAgendaMecanicos";
import AdminClientesPage from "./pages/admin/AdminClientesPage";
import AdminServicos from "./pages/admin/AdminServicos";
import AdminFinanceiro from "./pages/admin/AdminFinanceiro";
import AdminProdutividade from "./pages/admin/AdminProdutividade";
import AdminMechanicAnalytics from "./pages/admin/AdminMechanicAnalytics";
import AdminMechanicFeedback from "./pages/admin/AdminMechanicFeedback";
import AdminMetas from "./pages/admin/AdminMetas";
import AdminRelatorios from "./pages/admin/AdminRelatorios";
import AdminDocumentacao from "./pages/admin/AdminDocumentacao";
import AdminConfiguracoes from "./pages/admin/AdminConfiguracoes";
import AdminPendencias from "./pages/admin/AdminPendencias";
import AdminChecklist from "./pages/admin/AdminChecklist";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import OSUltimate from "./pages/admin/OSUltimate";
import ImportarVeiculosAntigos from "./pages/admin/ImportarVeiculosAntigos";

// Admin Pages promovidas de órfãs (lazy-loaded)
const AdminOperacional = lazy(() => import("./pages/admin/AdminOperacional"));
const AdminParametros = lazy(() => import("./pages/admin/AdminParametros"));
const AdminMelhorias = lazy(() => import("./pages/admin/AdminMelhorias"));
const AdminVeiculos = lazy(() => import("./pages/admin/AdminVeiculos"));

// Páginas promovidas de órfãs (lazy-loaded)
const Avisos = lazy(() => import("./pages/Avisos"));
const Profile = lazy(() => import("./pages/Profile"));
const VisaoGeral = lazy(() => import("./pages/VisaoGeral"));

// Client Pages (Garagem Virtual)
import ClienteGaragem from "./pages/app/Garagem";

// Gestao Pages
import GestaoDashboards from "./pages/gestao/GestaoDashboards";
import GestaoRH from "./pages/gestao/GestaoRH";
import GestaoOperacoes from "./pages/gestao/GestaoOperacoes";
import GestaoFinanceiro from "./pages/gestao/GestaoFinanceiro";
import GestaoTecnologia from "./pages/gestao/GestaoTecnologia";
import GestaoComercial from "./pages/gestao/GestaoComercial";
import GestaoMelhorias from "./pages/gestao/GestaoMelhorias";
import GestaoVeiculosOrfaos from "./pages/gestao/GestaoVeiculosOrfaos";

// Cliente Routes (Public budget view)
import OrcamentoCliente from "./pages/cliente/OrcamentoCliente";

// Dev Tools
import DevScreens from "./pages/__dev/DevScreens";
const DevExplorer = lazy(() => import("./pages/__dev/DevExplorer"));

// ========== ÓRFÃS (lazy-loaded — acessíveis via DevLab) ==========
// Raiz
const OrphanAgenda = lazy(() => import("./pages/Agenda"));
const OrphanAgendamentoSucesso = lazy(() => import("./pages/AgendamentoSucesso"));
const OrphanAvisos = lazy(() => import("./pages/Avisos"));
const OrphanComponentShowcase = lazy(() => import("./pages/ComponentShowcase"));
const OrphanConfiguracoes = lazy(() => import("./pages/Configuracoes"));
const OrphanDashboardCockpit = lazy(() => import("./pages/DashboardCockpit"));
const OrphanHistorico = lazy(() => import("./pages/Historico"));
const OrphanHome = lazy(() => import("./pages/Home"));
const OrphanIndex = lazy(() => import("./pages/Index"));
const OrphanLoginOld = lazy(() => import("./pages/Login"));
const OrphanMinhaGaragem = lazy(() => import("./pages/MinhaGaragem"));
const OrphanNovoAgendamento = lazy(() => import("./pages/NovoAgendamento"));
const OrphanOSClienteAcompanhamento = lazy(() => import("./pages/OSClienteAcompanhamento"));
const OrphanOSClienteOrcamento = lazy(() => import("./pages/OSClienteOrcamento"));
const OrphanPerformance = lazy(() => import("./pages/Performance"));
const OrphanProfile = lazy(() => import("./pages/Profile"));
const OrphanRegister = lazy(() => import("./pages/Register"));
const OrphanVeiculos = lazy(() => import("./pages/Veiculos"));
const OrphanVisaoGeral = lazy(() => import("./pages/VisaoGeral"));
// Admin órfãs
const OrphanAdminClientes = lazy(() => import("./pages/admin/AdminClientes"));
const OrphanAdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const OrphanAdminDashboardIAs = lazy(() => import("./pages/admin/AdminDashboardIAs"));
const OrphanAdminDashboardOrcamentos = lazy(() => import("./pages/admin/AdminDashboardOrcamentos"));
const OrphanAdminDashboardOverview = lazy(() => import("./pages/admin/AdminDashboardOverview"));
const OrphanAdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const OrphanAdminMelhorias = lazy(() => import("./pages/admin/AdminMelhorias"));
const OrphanAdminMonitoramentoKommo = lazy(() => import("./pages/admin/AdminMonitoramentoKommo"));
const OrphanAdminOperacional = lazy(() => import("./pages/admin/AdminOperacional"));
const OrphanAdminPainelTV = lazy(() => import("./pages/admin/AdminPainelTV"));
const OrphanAdminParametros = lazy(() => import("./pages/admin/AdminParametros"));
const OrphanAdminVeiculos = lazy(() => import("./pages/admin/AdminVeiculos"));
const OrphanCadastros = lazy(() => import("./pages/admin/Cadastros"));
const OrphanClientes = lazy(() => import("./pages/admin/Clientes"));
const OrphanImportarDados = lazy(() => import("./pages/admin/ImportarDados"));
const OrphanMonitoramentoPatio = lazy(() => import("./pages/admin/MonitoramentoPatio"));
const OrphanNovaOS = lazy(() => import("./pages/admin/NovaOS"));
const OrphanOrdensServico = lazy(() => import("./pages/admin/OrdensServico"));
const OrphanPendencias = lazy(() => import("./pages/admin/Pendencias"));
// Gestão órfãs
const OrphanKommoV2 = lazy(() => import("./pages/gestao/AdminMonitoramentoKommo-v2"));
// Cliente órfãs
const OrphanLoginCliente = lazy(() => import("./pages/cliente/LoginCliente"));
// OS órfãs
const OrphanOSUltimateClient = lazy(() => import("./pages/os/OSUltimateClient"));


/** Loading fallback para páginas órfãs lazy-loaded */
function OrphanLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Carregando página...</p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* ========== ROTAS PÚBLICAS ========== */}
      <Route path="/">
        <Redirect to="/admin/dashboard" />
      </Route>
      <Route path="/login" component={Login} />
      <Route path="/trocar-senha" component={TrocarSenha} />
      
      {/* Orçamento público para cliente aprovar via link */}
      <Route path="/cliente/orcamento/:osId" component={OrcamentoCliente} />
      
      {/* Dev tools (apenas em desenvolvimento) */}
      <Route path="/__dev" component={DevScreens} />
      <Route path="/__dev/explorer">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><DevExplorer /></ErrorBoundary></Suspense>}</Route>

      {/* Avisos e Perfil */}
      <Route path="/avisos">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><Avisos /></ErrorBoundary></Suspense>}</Route>
      <Route path="/perfil">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><Profile /></ErrorBoundary></Suspense>}</Route>

      {/* ========== ÁREA DO CLIENTE (Garagem Virtual) ========== */}
      <Route path="/app/garagem" component={ClienteGaragem} />

      {/* ========== ÁREA ADMINISTRATIVA ========== */}
      {/* Dashboard Principal */}
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin">
        <Redirect to="/admin/dashboard" />
      </Route>

      {/* Visão Geral e Operacional */}
      <Route path="/admin/overview">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanAdminDashboardOverview /></ErrorBoundary></Suspense>}</Route>
      {/* Visão Geral do Cliente (perfil) */}
      <Route path="/visao-geral">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><VisaoGeral /></ErrorBoundary></Suspense>}</Route>
      <Route path="/admin/operacional">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><AdminOperacional /></ErrorBoundary></Suspense>}</Route>

      {/* Ordens de Serviço */}
      <Route path="/admin/ordens-servico" component={AdminOrdensServico} />
      <Route path="/admin/nova-os" component={AdminNovaOS} />
      <Route path="/admin/os/:id" component={AdminOSDetalhes} />
      <Route path="/admin/os-ultimate" component={OSUltimate} />
      <Route path="/admin/os-ultimate/:id" component={OSUltimate} />

      {/* Pátio */}
      <Route path="/admin/patio" component={AdminPatio} />
      <Route path="/admin/patio/:id" component={AdminPatioDetalhes} />

      {/* Agenda */}
      <Route path="/admin/agendamentos" component={AdminAgendamentos} />
      <Route path="/admin/agenda-mecanicos" component={AdminAgendaMecanicos} />

      {/* Clientes, Veículos e Serviços */}
      <Route path="/admin/clientes" component={AdminClientesPage} />
      <Route path="/admin/veiculos">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><AdminVeiculos /></ErrorBoundary></Suspense>}</Route>
      <Route path="/admin/servicos" component={AdminServicos} />

      {/* Financeiro e Produtividade */}
      <Route path="/admin/financeiro" component={AdminFinanceiro} />
      <Route path="/admin/produtividade" component={AdminProdutividade} />
      <Route path="/admin/analytics-mecanicos" component={AdminMechanicAnalytics} />
      <Route path="/admin/feedback-mecanicos" component={AdminMechanicFeedback} />
      <Route path="/admin/metas" component={AdminMetas} />

      {/* Relatórios e Config */}
      <Route path="/admin/relatorios" component={AdminRelatorios} />
      <Route path="/admin/documentacao" component={AdminDocumentacao} />
      <Route path="/admin/configuracoes" component={AdminConfiguracoes} />
      <Route path="/admin/pendencias" component={AdminPendencias} />
      <Route path="/admin/checklist" component={AdminChecklist} />
      <Route path="/admin/melhorias">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><AdminMelhorias /></ErrorBoundary></Suspense>}</Route>
      <Route path="/admin/parametros">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><AdminParametros /></ErrorBoundary></Suspense>}</Route>
      <Route path="/admin/importar-veiculos-antigos" component={ImportarVeiculosAntigos} />
      <Route path="/admin/usuarios" component={AdminUsuarios} />

      {/* ========== ÁREA GESTÃO ========== */}
      <Route path="/gestao" component={GestaoDashboards} />
      <Route path="/gestao/rh" component={GestaoRH} />
      <Route path="/gestao/operacoes" component={GestaoOperacoes} />
      <Route path="/gestao/financeiro" component={GestaoFinanceiro} />
      <Route path="/gestao/tecnologia" component={GestaoTecnologia} />
      <Route path="/gestao/comercial" component={GestaoComercial} />
      <Route path="/gestao/melhorias" component={GestaoMelhorias} />
      <Route path="/gestao/veiculos-orfaos" component={GestaoVeiculosOrfaos} />

      {/* ========== ÓRFÃS — lazy-loaded via DevLab ========== */}
      {/* Raiz */}
      <Route path="/__orphan/agenda">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanAgenda /></ErrorBoundary></Suspense>}</Route>
      <Route path="/__orphan/agendamento-sucesso">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanAgendamentoSucesso /></ErrorBoundary></Suspense>}</Route>
      <Route path="/__orphan/avisos">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanAvisos /></ErrorBoundary></Suspense>}</Route>
      <Route path="/__orphan/component-showcase">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanComponentShowcase /></ErrorBoundary></Suspense>}</Route>
      <Route path="/__orphan/configuracoes">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanConfiguracoes /></ErrorBoundary></Suspense>}</Route>
      <Route path="/__orphan/dashboard-cockpit">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanDashboardCockpit /></ErrorBoundary></Suspense>}</Route>
      <Route path="/__orphan/historico">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanHistorico /></ErrorBoundary></Suspense>}</Route>
      <Route path="/__orphan/home">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanHome /></ErrorBoundary></Suspense>}</Route>
      <Route path="/__orphan/index">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanIndex /></ErrorBoundary></Suspense>}</Route>
      <Route path="/__orphan/login-old">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanLoginOld /></ErrorBoundary></Suspense>}</Route>
      <Route path="/__orphan/minha-garagem">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanMinhaGaragem /></ErrorBoundary></Suspense>}</Route>
      <Route path="/__orphan/novo-agendamento">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanNovoAgendamento /></ErrorBoundary></Suspense>}</Route>
      <Route path="/__orphan/os-acompanhamento">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanOSClienteAcompanhamento /></ErrorBoundary></Suspense>}</Route>
      <Route path="/__orphan/os-orcamento">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanOSClienteOrcamento /></ErrorBoundary></Suspense>}</Route>
      <Route path="/__orphan/performance">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanPerformance /></ErrorBoundary></Suspense>}</Route>
      <Route path="/__orphan/profile">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanProfile /></ErrorBoundary></Suspense>}</Route>
      <Route path="/__orphan/register">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanRegister /></ErrorBoundary></Suspense>}</Route>
      <Route path="/__orphan/veiculos">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanVeiculos /></ErrorBoundary></Suspense>}</Route>
      <Route path="/__orphan/visao-geral">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanVisaoGeral /></ErrorBoundary></Suspense>}</Route>
      {/* Admin órfãs */}
      <Route path="/__orphan/admin-clientes">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanAdminClientes /></ErrorBoundary></Suspense>}</Route>
      <Route path="/__orphan/admin-dashboard-old">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanAdminDashboard /></ErrorBoundary></Suspense>}</Route>
      <Route path="/__orphan/admin-dashboard-ias">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanAdminDashboardIAs /></ErrorBoundary></Suspense>}</Route>
      <Route path="/__orphan/admin-dashboard-orcamentos">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanAdminDashboardOrcamentos /></ErrorBoundary></Suspense>}</Route>
      <Route path="/__orphan/admin-dashboard-overview">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanAdminDashboardOverview /></ErrorBoundary></Suspense>}</Route>
      <Route path="/__orphan/admin-login">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanAdminLogin /></ErrorBoundary></Suspense>}</Route>
      <Route path="/__orphan/admin-melhorias">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanAdminMelhorias /></ErrorBoundary></Suspense>}</Route>
      <Route path="/__orphan/admin-monitoramento-kommo">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanAdminMonitoramentoKommo /></ErrorBoundary></Suspense>}</Route>
      <Route path="/__orphan/admin-operacional">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanAdminOperacional /></ErrorBoundary></Suspense>}</Route>
      <Route path="/__orphan/admin-painel-tv">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanAdminPainelTV /></ErrorBoundary></Suspense>}</Route>
      <Route path="/__orphan/admin-parametros">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanAdminParametros /></ErrorBoundary></Suspense>}</Route>
      <Route path="/__orphan/admin-veiculos">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanAdminVeiculos /></ErrorBoundary></Suspense>}</Route>
      <Route path="/__orphan/cadastros">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanCadastros /></ErrorBoundary></Suspense>}</Route>
      <Route path="/__orphan/clientes-legacy">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanClientes /></ErrorBoundary></Suspense>}</Route>
      <Route path="/__orphan/importar-dados">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanImportarDados /></ErrorBoundary></Suspense>}</Route>
      <Route path="/__orphan/monitoramento-patio">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanMonitoramentoPatio /></ErrorBoundary></Suspense>}</Route>
      <Route path="/__orphan/nova-os-legacy">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanNovaOS /></ErrorBoundary></Suspense>}</Route>
      <Route path="/__orphan/ordens-servico-legacy">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanOrdensServico /></ErrorBoundary></Suspense>}</Route>
      <Route path="/__orphan/pendencias-legacy">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanPendencias /></ErrorBoundary></Suspense>}</Route>
      {/* Gestão órfãs */}
      <Route path="/__orphan/kommo-v2">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanKommoV2 /></ErrorBoundary></Suspense>}</Route>
      {/* Cliente órfãs */}
      <Route path="/__orphan/login-cliente">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanLoginCliente /></ErrorBoundary></Suspense>}</Route>
      {/* OS órfãs */}
      <Route path="/__orphan/os-ultimate-client">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanOSUltimateClient /></ErrorBoundary></Suspense>}</Route>

      {/* ========== FALLBACK ========== */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" switchable={true}>
          <AuthProvider>
            <CompanyProvider>
              <TooltipProvider>
                <Toaster />
                <Router />
              </TooltipProvider>
            </CompanyProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
