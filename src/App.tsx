import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CompanyProvider } from "./contexts/CompanyContext";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Login from "./pages/Login";
import TrocarSenha from "./pages/TrocarSenha";
import DevScreens from "./pages/__dev/DevScreens";
// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDashboardOverview from "./pages/admin/AdminDashboardOverview";
import AdminOperacional from "./pages/admin/AdminOperacional";
import AdminOrdensServico from "./pages/admin/AdminOrdensServico";
import AdminNovaOS from "./pages/admin/AdminNovaOS";
import AdminOSDetalhes from "./pages/admin/AdminOSDetalhes";
import AdminPatio from "./pages/admin/AdminPatio";
import AdminPatioDetalhes from "./pages/admin/AdminPatioDetalhes";
import AdminAgendamentos from "./pages/admin/AdminAgendamentos";
import AdminAgendaMecanicos from "./pages/admin/AdminAgendaMecanicos";
import AdminClientes from "./pages/admin/AdminClientes";
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
import OSUltimate from "./pages/admin/OSUltimate";
import ImportarVeiculosAntigos from "./pages/admin/ImportarVeiculosAntigos";

// Gestao Pages
import GestaoDashboards from "./pages/gestao/GestaoDashboards";
import GestaoRH from "./pages/gestao/GestaoRH";
import GestaoOperacoes from "./pages/gestao/GestaoOperacoes";
import GestaoFinanceiro from "./pages/gestao/GestaoFinanceiro";
import GestaoTecnologia from "./pages/gestao/GestaoTecnologia";
import GestaoComercial from "./pages/gestao/GestaoComercial";
import GestaoMelhorias from "./pages/gestao/GestaoMelhorias";
import GestaoVeiculosOrfaos from "./pages/gestao/GestaoVeiculosOrfaos";

// Cliente Pages
import OrcamentoCliente from "./pages/cliente/OrcamentoCliente";

function Router() {
  return (
    <Switch>
      {/* Public dev route - no auth required */}
      <Route path="/__dev" component={DevScreens} />
      
      <Route path={"/"}>
        <Redirect to="/login" />
      </Route>
      <Route path={"/login"} component={Login} />
      <Route path={"/trocar-senha"} component={TrocarSenha} />
      
      {/* Admin Routes - Protected */}
      <Route path={"/admin"}>{() => <ProtectedRoute><AdminDashboard /></ProtectedRoute>}</Route>
      <Route path={"/admin/overview"}>{() => <ProtectedRoute><AdminDashboardOverview /></ProtectedRoute>}</Route>
      <Route path={"/admin/operacional"}>{() => <ProtectedRoute><AdminOperacional /></ProtectedRoute>}</Route>
      <Route path={"/admin/ordens-servico"}>{() => <ProtectedRoute><AdminOrdensServico /></ProtectedRoute>}</Route>
      <Route path={"/admin/nova-os"}>{() => <ProtectedRoute><AdminNovaOS /></ProtectedRoute>}</Route>
      <Route path={"/admin/os/:id"}>{() => <ProtectedRoute><AdminOSDetalhes /></ProtectedRoute>}</Route>
      <Route path={"/admin/patio"}>{() => <ProtectedRoute><AdminPatio /></ProtectedRoute>}</Route>
      <Route path={"/admin/patio/:id"}>{() => <ProtectedRoute><AdminPatioDetalhes /></ProtectedRoute>}</Route>
      <Route path={"/admin/agendamentos"}>{() => <ProtectedRoute><AdminAgendamentos /></ProtectedRoute>}</Route>
      <Route path={"/admin/agenda-mecanicos"}>{() => <ProtectedRoute><AdminAgendaMecanicos /></ProtectedRoute>}</Route>
      <Route path={"/admin/clientes"}>{() => <ProtectedRoute><AdminClientesPage /></ProtectedRoute>}</Route>
      <Route path={"/admin/servicos"}>{() => <ProtectedRoute><AdminServicos /></ProtectedRoute>}</Route>
      <Route path={"/admin/financeiro"}>{() => <ProtectedRoute><AdminFinanceiro /></ProtectedRoute>}</Route>
      <Route path={"/admin/produtividade"}>{() => <ProtectedRoute><AdminProdutividade /></ProtectedRoute>}</Route>
      <Route path={"/admin/analytics-mecanicos"}>{() => <ProtectedRoute><AdminMechanicAnalytics /></ProtectedRoute>}</Route>
      <Route path={"/admin/feedback-mecanicos"}>{() => <ProtectedRoute><AdminMechanicFeedback /></ProtectedRoute>}</Route>
      <Route path={"/admin/metas"}>{() => <ProtectedRoute><AdminMetas /></ProtectedRoute>}</Route>
      <Route path={"/admin/relatorios"}>{() => <ProtectedRoute><AdminRelatorios /></ProtectedRoute>}</Route>
      <Route path={"/admin/documentacao"}>{() => <ProtectedRoute><AdminDocumentacao /></ProtectedRoute>}</Route>
      <Route path={"/admin/configuracoes"}>{() => <ProtectedRoute><AdminConfiguracoes /></ProtectedRoute>}</Route>
      <Route path={"/admin/pendencias"}>{() => <ProtectedRoute><AdminPendencias /></ProtectedRoute>}</Route>
      <Route path={"/admin/checklist"}>{() => <ProtectedRoute><AdminChecklist /></ProtectedRoute>}</Route>
      <Route path={"/admin/os-ultimate"}>{() => <ProtectedRoute><OSUltimate /></ProtectedRoute>}</Route>
      <Route path={"/admin/os-ultimate/:id"}>{() => <ProtectedRoute><OSUltimate /></ProtectedRoute>}</Route>
      <Route path={"/admin/importar-veiculos-antigos"}>{() => <ProtectedRoute><ImportarVeiculosAntigos /></ProtectedRoute>}</Route>
      
      {/* Gestao Routes - Protected */}
      <Route path={"/gestao"}>{() => <ProtectedRoute><GestaoDashboards /></ProtectedRoute>}</Route>
      <Route path={"/gestao/rh"}>{() => <ProtectedRoute><GestaoRH /></ProtectedRoute>}</Route>
      <Route path={"/gestao/operacoes"}>{() => <ProtectedRoute><GestaoOperacoes /></ProtectedRoute>}</Route>
      <Route path={"/gestao/financeiro"}>{() => <ProtectedRoute><GestaoFinanceiro /></ProtectedRoute>}</Route>
      <Route path={"/gestao/tecnologia"}>{() => <ProtectedRoute><GestaoTecnologia /></ProtectedRoute>}</Route>
      <Route path={"/gestao/comercial"}>{() => <ProtectedRoute><GestaoComercial /></ProtectedRoute>}</Route>
      <Route path={"/gestao/melhorias"}>{() => <ProtectedRoute><GestaoMelhorias /></ProtectedRoute>}</Route>
      <Route path={"/gestao/veiculos-orfaos"}>{() => <ProtectedRoute><GestaoVeiculosOrfaos /></ProtectedRoute>}</Route>
      
      {/* Cliente Routes */}
      <Route path={"/cliente/orcamento/:osId"} component={OrcamentoCliente} />
      
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App;
