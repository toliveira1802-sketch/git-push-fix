import { lazy, Suspense, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CompanyProvider } from "./contexts/CompanyContext";
import { AuthProvider } from "./contexts/AuthContext";

/** Guard: redireciona para /login se não autenticado */
function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Redirect to="/login" />;
  return <>{children}</>;
}

/**
 * Gradual Launch Guard
 * Rotas ativas: /login, /, /escolher-visao, /gestao e sub-rotas de gestão listadas abaixo.
 * Qualquer outra rota → /gestao (autenticado) ou /login (não autenticado).
 */
const ACTIVE_PATHS = [
  "/login",
  "/",
  "/escolher-visao",
  "/gestao",
  "/gestao/rh",
  "/gestao/operacoes",
  "/gestao/financeiro",
  "/gestao/tecnologia",
  "/gestao/comercial",
  "/gestao/melhorias",
];

function GradualLaunch({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  // Obter pathname atual via window.location (wouter não expõe hook aqui)
  const pathname = window.location.pathname;

  if (loading) return <>{children}</>;

  const isActive = ACTIVE_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!isActive) {
    return <Redirect to={user ? "/gestao" : "/login"} />;
  }

  return <>{children}</>;
}


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
  const { user, loading } = useAuth();

  // Redireciona raiz baseado em autenticação
  const rootRedirect = loading ? null : user ? "/admin/dashboard" : "/login";

  return (
    <Switch>
      {/* ========== ROTAS PÚBLICAS ========== */}
      <Route path="/">
        {rootRedirect ? <Redirect to={rootRedirect} /> : (
          <div className="min-h-screen flex items-center justify-center bg-background">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
      </Route>
      <Route path="/login" component={Login} />
      <Route path="/trocar-senha" component={TrocarSenha} />
      
      {/* Orçamento público para cliente aprovar via link */}
      <Route path="/cliente/orcamento/:osId" component={OrcamentoCliente} />
      
      {/* Dev tools (apenas em desenvolvimento) */}
      {import.meta.env.DEV && (
        <>
          <Route path="/__dev" component={DevScreens} />
          <Route path="/__dev/explorer">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><DevExplorer /></ErrorBoundary></Suspense>}</Route>
        </>
      )}

      {/* Avisos e Perfil — protegidos */}
      <Route path="/avisos">{() => <RequireAuth><Suspense fallback={<OrphanLoading />}><ErrorBoundary><Avisos /></ErrorBoundary></Suspense></RequireAuth>}</Route>
      <Route path="/perfil">{() => <RequireAuth><Suspense fallback={<OrphanLoading />}><ErrorBoundary><Profile /></ErrorBoundary></Suspense></RequireAuth>}</Route>


      {/* ========== ÁREA DO CLIENTE (Garagem Virtual) ========== */}
      <Route path="/app/garagem">{() => <RequireAuth><ClienteGaragem /></RequireAuth>}</Route>

      {/* ========== ÁREA ADMINISTRATIVA ========== */}
      {/* Dashboard Principal */}
      <Route path="/admin/dashboard">{() => <RequireAuth><AdminDashboard /></RequireAuth>}</Route>
      <Route path="/admin">
        <Redirect to="/admin/dashboard" />
      </Route>

      {/* Visão Geral e Operacional */}
      <Route path="/admin/overview">{() => <RequireAuth><Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanAdminDashboardOverview /></ErrorBoundary></Suspense></RequireAuth>}</Route>
      {/* Visão Geral do Cliente (perfil) */}
      <Route path="/visao-geral">{() => <RequireAuth><Suspense fallback={<OrphanLoading />}><ErrorBoundary><VisaoGeral /></ErrorBoundary></Suspense></RequireAuth>}</Route>
      <Route path="/admin/operacional">{() => <RequireAuth><Suspense fallback={<OrphanLoading />}><ErrorBoundary><AdminOperacional /></ErrorBoundary></Suspense></RequireAuth>}</Route>

      {/* Ordens de Serviço */}
      <Route path="/admin/ordens-servico">{() => <RequireAuth><AdminOrdensServico /></RequireAuth>}</Route>
      <Route path="/admin/nova-os">{() => <RequireAuth><AdminNovaOS /></RequireAuth>}</Route>
      <Route path="/admin/os/:id">{(params) => <RequireAuth><AdminOSDetalhes /></RequireAuth>}</Route>
      <Route path="/admin/os-ultimate">{() => <RequireAuth><OSUltimate /></RequireAuth>}</Route>
      <Route path="/admin/os-ultimate/:id">{() => <RequireAuth><OSUltimate /></RequireAuth>}</Route>

      {/* Pátio */}
      <Route path="/admin/patio">{() => <RequireAuth><AdminPatio /></RequireAuth>}</Route>
      <Route path="/admin/patio/:id">{() => <RequireAuth><AdminPatioDetalhes /></RequireAuth>}</Route>
      <Route path="/admin/monitoramento-patio">{() => <RequireAuth><Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanMonitoramentoPatio /></ErrorBoundary></Suspense></RequireAuth>}</Route>
      <Route path="/__orphan/monitoramento-patio">{() => <RequireAuth><Suspense fallback={<OrphanLoading />}><ErrorBoundary><OrphanMonitoramentoPatio /></ErrorBoundary></Suspense></RequireAuth>}</Route>

      {/* Agenda */}
      <Route path="/admin/agendamentos">{() => <RequireAuth><AdminAgendamentos /></RequireAuth>}</Route>
      <Route path="/admin/agenda-mecanicos">{() => <RequireAuth><AdminAgendaMecanicos /></RequireAuth>}</Route>

      {/* Clientes, Veículos e Serviços */}
      <Route path="/admin/clientes">{() => <RequireAuth><AdminClientesPage /></RequireAuth>}</Route>
      <Route path="/admin/veiculos">{() => <RequireAuth><Suspense fallback={<OrphanLoading />}><ErrorBoundary><AdminVeiculos /></ErrorBoundary></Suspense></RequireAuth>}</Route>
      <Route path="/admin/servicos">{() => <RequireAuth><AdminServicos /></RequireAuth>}</Route>

      {/* Financeiro e Produtividade */}
      <Route path="/admin/financeiro">{() => <RequireAuth><AdminFinanceiro /></RequireAuth>}</Route>
      <Route path="/admin/produtividade">{() => <RequireAuth><AdminProdutividade /></RequireAuth>}</Route>
      <Route path="/admin/analytics-mecanicos">{() => <RequireAuth><AdminMechanicAnalytics /></RequireAuth>}</Route>
      <Route path="/admin/feedback-mecanicos">{() => <RequireAuth><AdminMechanicFeedback /></RequireAuth>}</Route>
      <Route path="/admin/metas">{() => <RequireAuth><AdminMetas /></RequireAuth>}</Route>

      {/* Relatórios e Config */}
      <Route path="/admin/relatorios">{() => <RequireAuth><AdminRelatorios /></RequireAuth>}</Route>
      <Route path="/admin/documentacao">{() => <RequireAuth><AdminDocumentacao /></RequireAuth>}</Route>
      <Route path="/admin/configuracoes">{() => <RequireAuth><AdminConfiguracoes /></RequireAuth>}</Route>
      <Route path="/admin/pendencias">{() => <RequireAuth><AdminPendencias /></RequireAuth>}</Route>
      <Route path="/admin/checklist">{() => <RequireAuth><AdminChecklist /></RequireAuth>}</Route>
      <Route path="/admin/melhorias">{() => <RequireAuth><Suspense fallback={<OrphanLoading />}><ErrorBoundary><AdminMelhorias /></ErrorBoundary></Suspense></RequireAuth>}</Route>
      <Route path="/admin/parametros">{() => <RequireAuth><Suspense fallback={<OrphanLoading />}><ErrorBoundary><AdminParametros /></ErrorBoundary></Suspense></RequireAuth>}</Route>
      <Route path="/admin/importar-veiculos-antigos">{() => <RequireAuth><ImportarVeiculosAntigos /></RequireAuth>}</Route>
      <Route path="/admin/usuarios">{() => <RequireAuth><AdminUsuarios /></RequireAuth>}</Route>

      {/* ========== ÁREA GESTÃO ========== */}
      <Route path="/gestao">{() => <RequireAuth><GestaoDashboards /></RequireAuth>}</Route>
      <Route path="/gestao/rh">{() => <RequireAuth><GestaoRH /></RequireAuth>}</Route>
      <Route path="/gestao/operacoes">{() => <RequireAuth><GestaoOperacoes /></RequireAuth>}</Route>
      <Route path="/gestao/financeiro">{() => <RequireAuth><GestaoFinanceiro /></RequireAuth>}</Route>
      <Route path="/gestao/tecnologia">{() => <RequireAuth><GestaoTecnologia /></RequireAuth>}</Route>
      <Route path="/gestao/comercial">{() => <RequireAuth><GestaoComercial /></RequireAuth>}</Route>
      <Route path="/gestao/melhorias">{() => <RequireAuth><GestaoMelhorias /></RequireAuth>}</Route>
      <Route path="/gestao/veiculos-orfaos">{() => <RequireAuth><GestaoVeiculosOrfaos /></RequireAuth>}</Route>

      {/* ========== ÓRFÃS — apenas em DEV (DevLab) ========== */}
      {import.meta.env.DEV && (
        <>
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
        </>
      )}

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
                <GradualLaunch>
                  <Router />
                </GradualLaunch>
              </TooltipProvider>
            </CompanyProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
