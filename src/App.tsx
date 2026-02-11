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
      <Route path="/admin/overview">{() => <Suspense fallback={<OrphanLoading />}><ErrorBoundary><VisaoGeral /></ErrorBoundary></Suspense>}</Route>
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
