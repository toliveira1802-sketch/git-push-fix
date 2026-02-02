import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Login from "./pages/Login";
import TrocarSenha from "./pages/TrocarSenha";

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
import AdminDocumentacao from "./pages/admin/AdminDocumentacao";
import AdminConfiguracoes from "./pages/admin/AdminConfiguracoes";
import AdminPendencias from "./pages/admin/AdminPendencias";
import OSUltimate from "./pages/admin/OSUltimate";

// Gestao Pages
import GestaoDashboards from "./pages/gestao/GestaoDashboards";
import GestaoRH from "./pages/gestao/GestaoRH";
import GestaoOperacoes from "./pages/gestao/GestaoOperacoes";
import GestaoFinanceiro from "./pages/gestao/GestaoFinanceiro";
import GestaoTecnologia from "./pages/gestao/GestaoTecnologia";
import GestaoComercial from "./pages/gestao/GestaoComercial";
import GestaoMelhorias from "./pages/gestao/GestaoMelhorias";

// Cliente Pages
import OrcamentoCliente from "./pages/cliente/OrcamentoCliente";

function Router() {
  return (
    <Switch>
      <Route path={"/"}>
        <Redirect to="/login" />
      </Route>
      <Route path={"/login"} component={Login} />
      <Route path={"/trocar-senha"} component={TrocarSenha} />
      
      {/* Admin Routes */}
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/admin/overview"} component={AdminDashboardOverview} />
      <Route path={"/admin/operacional"} component={AdminOperacional} />
      <Route path={"/admin/ordens-servico"} component={AdminOrdensServico} />
      <Route path={"/admin/nova-os"} component={AdminNovaOS} />
      <Route path={"/admin/os/:id"} component={AdminOSDetalhes} />
      <Route path={"/admin/patio"} component={AdminPatio} />
      <Route path={"/admin/patio/:id"} component={AdminPatioDetalhes} />
      <Route path={"/admin/agendamentos"} component={AdminAgendamentos} />
      <Route path={"/admin/agenda-mecanicos"} component={AdminAgendaMecanicos} />
      <Route path={"/admin/clientes"} component={AdminClientesPage} />
      <Route path={"/admin/servicos"} component={AdminServicos} />
      <Route path={"/admin/financeiro"} component={AdminFinanceiro} />
      <Route path={"/admin/produtividade"} component={AdminProdutividade} />
      <Route path={"/admin/analytics-mecanicos"} component={AdminMechanicAnalytics} />
      <Route path={"/admin/feedback-mecanicos"} component={AdminMechanicFeedback} />
      <Route path={"/admin/documentacao"} component={AdminDocumentacao} />
      <Route path={"/admin/configuracoes"} component={AdminConfiguracoes} />
      <Route path={"/admin/pendencias"} component={AdminPendencias} />
      <Route path={"/admin/os-ultimate/:id"} component={OSUltimate} />
      
      {/* Gestao Routes */}
      <Route path={"/gestao"} component={GestaoDashboards} />
      <Route path={"/gestao/rh"} component={GestaoRH} />
      <Route path={"/gestao/operacoes"} component={GestaoOperacoes} />
      <Route path={"/gestao/financeiro"} component={GestaoFinanceiro} />
      <Route path={"/gestao/tecnologia"} component={GestaoTecnologia} />
      <Route path={"/gestao/comercial"} component={GestaoComercial} />
      <Route path={"/gestao/melhorias"} component={GestaoMelhorias} />
      
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
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
