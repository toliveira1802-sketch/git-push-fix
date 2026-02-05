import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CompanyProvider } from "./contexts/CompanyContext";
import { AuthProvider } from "./contexts/AuthContext";
import RoleBasedRoute from "./components/auth/RoleBasedRoute";

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
import OSUltimate from "./pages/admin/OSUltimate";
import ImportarVeiculosAntigos from "./pages/admin/ImportarVeiculosAntigos";

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

// Roles permitidas para área admin
const ADMIN_ROLES = ['admin', 'gestao', 'dev'] as const;
// Role de cliente
const CLIENT_ROLES = ['user'] as const;

function Router() {
  return (
    <Switch>
      {/* ========== ROTAS PÚBLICAS ========== */}
      <Route path="/">
        <Redirect to="/login" />
      </Route>
      <Route path="/login" component={Login} />
      <Route path="/trocar-senha" component={TrocarSenha} />
      
      {/* Orçamento público para cliente aprovar via link */}
      <Route path="/cliente/orcamento/:osId" component={OrcamentoCliente} />
      
      {/* Dev tools (apenas em desenvolvimento) */}
      <Route path="/__dev" component={DevScreens} />

      {/* ========== ÁREA DO CLIENTE (Garagem Virtual) ========== */}
      <Route path="/app/garagem">
        {() => (
          <RoleBasedRoute allowedRoles={[...CLIENT_ROLES]}>
            <ClienteGaragem />
          </RoleBasedRoute>
        )}
      </Route>

      {/* ========== ÁREA ADMINISTRATIVA ========== */}
      {/* Dashboard Principal */}
      <Route path="/admin/dashboard">
        {() => (
          <RoleBasedRoute allowedRoles={[...ADMIN_ROLES]}>
            <AdminDashboard />
          </RoleBasedRoute>
        )}
      </Route>
      <Route path="/admin">
        <Redirect to="/admin/dashboard" />
      </Route>

      {/* Ordens de Serviço */}
      <Route path="/admin/ordens-servico">
        {() => (
          <RoleBasedRoute allowedRoles={[...ADMIN_ROLES]}>
            <AdminOrdensServico />
          </RoleBasedRoute>
        )}
      </Route>
      <Route path="/admin/nova-os">
        {() => (
          <RoleBasedRoute allowedRoles={[...ADMIN_ROLES]}>
            <AdminNovaOS />
          </RoleBasedRoute>
        )}
      </Route>
      <Route path="/admin/os/:id">
        {() => (
          <RoleBasedRoute allowedRoles={[...ADMIN_ROLES]}>
            <AdminOSDetalhes />
          </RoleBasedRoute>
        )}
      </Route>
      <Route path="/admin/os-ultimate">
        {() => (
          <RoleBasedRoute allowedRoles={[...ADMIN_ROLES]}>
            <OSUltimate />
          </RoleBasedRoute>
        )}
      </Route>
      <Route path="/admin/os-ultimate/:id">
        {() => (
          <RoleBasedRoute allowedRoles={[...ADMIN_ROLES]}>
            <OSUltimate />
          </RoleBasedRoute>
        )}
      </Route>

      {/* Pátio */}
      <Route path="/admin/patio">
        {() => (
          <RoleBasedRoute allowedRoles={[...ADMIN_ROLES]}>
            <AdminPatio />
          </RoleBasedRoute>
        )}
      </Route>
      <Route path="/admin/patio/:id">
        {() => (
          <RoleBasedRoute allowedRoles={[...ADMIN_ROLES]}>
            <AdminPatioDetalhes />
          </RoleBasedRoute>
        )}
      </Route>

      {/* Agenda */}
      <Route path="/admin/agendamentos">
        {() => (
          <RoleBasedRoute allowedRoles={[...ADMIN_ROLES]}>
            <AdminAgendamentos />
          </RoleBasedRoute>
        )}
      </Route>
      <Route path="/admin/agenda-mecanicos">
        {() => (
          <RoleBasedRoute allowedRoles={[...ADMIN_ROLES]}>
            <AdminAgendaMecanicos />
          </RoleBasedRoute>
        )}
      </Route>

      {/* Clientes e Serviços */}
      <Route path="/admin/clientes">
        {() => (
          <RoleBasedRoute allowedRoles={[...ADMIN_ROLES]}>
            <AdminClientesPage />
          </RoleBasedRoute>
        )}
      </Route>
      <Route path="/admin/servicos">
        {() => (
          <RoleBasedRoute allowedRoles={[...ADMIN_ROLES]}>
            <AdminServicos />
          </RoleBasedRoute>
        )}
      </Route>

      {/* Financeiro e Produtividade */}
      <Route path="/admin/financeiro">
        {() => (
          <RoleBasedRoute allowedRoles={[...ADMIN_ROLES]}>
            <AdminFinanceiro />
          </RoleBasedRoute>
        )}
      </Route>
      <Route path="/admin/produtividade">
        {() => (
          <RoleBasedRoute allowedRoles={[...ADMIN_ROLES]}>
            <AdminProdutividade />
          </RoleBasedRoute>
        )}
      </Route>
      <Route path="/admin/analytics-mecanicos">
        {() => (
          <RoleBasedRoute allowedRoles={[...ADMIN_ROLES]}>
            <AdminMechanicAnalytics />
          </RoleBasedRoute>
        )}
      </Route>
      <Route path="/admin/feedback-mecanicos">
        {() => (
          <RoleBasedRoute allowedRoles={[...ADMIN_ROLES]}>
            <AdminMechanicFeedback />
          </RoleBasedRoute>
        )}
      </Route>
      <Route path="/admin/metas">
        {() => (
          <RoleBasedRoute allowedRoles={[...ADMIN_ROLES]}>
            <AdminMetas />
          </RoleBasedRoute>
        )}
      </Route>

      {/* Relatórios e Config */}
      <Route path="/admin/relatorios">
        {() => (
          <RoleBasedRoute allowedRoles={[...ADMIN_ROLES]}>
            <AdminRelatorios />
          </RoleBasedRoute>
        )}
      </Route>
      <Route path="/admin/documentacao">
        {() => (
          <RoleBasedRoute allowedRoles={[...ADMIN_ROLES]}>
            <AdminDocumentacao />
          </RoleBasedRoute>
        )}
      </Route>
      <Route path="/admin/configuracoes">
        {() => (
          <RoleBasedRoute allowedRoles={[...ADMIN_ROLES]}>
            <AdminConfiguracoes />
          </RoleBasedRoute>
        )}
      </Route>
      <Route path="/admin/pendencias">
        {() => (
          <RoleBasedRoute allowedRoles={[...ADMIN_ROLES]}>
            <AdminPendencias />
          </RoleBasedRoute>
        )}
      </Route>
      <Route path="/admin/checklist">
        {() => (
          <RoleBasedRoute allowedRoles={[...ADMIN_ROLES]}>
            <AdminChecklist />
          </RoleBasedRoute>
        )}
      </Route>
      <Route path="/admin/importar-veiculos-antigos">
        {() => (
          <RoleBasedRoute allowedRoles={[...ADMIN_ROLES]}>
            <ImportarVeiculosAntigos />
          </RoleBasedRoute>
        )}
      </Route>

      {/* ========== ÁREA GESTÃO ========== */}
      <Route path="/gestao">
        {() => (
          <RoleBasedRoute allowedRoles={['gestao', 'dev']}>
            <GestaoDashboards />
          </RoleBasedRoute>
        )}
      </Route>
      <Route path="/gestao/rh">
        {() => (
          <RoleBasedRoute allowedRoles={['gestao', 'dev']}>
            <GestaoRH />
          </RoleBasedRoute>
        )}
      </Route>
      <Route path="/gestao/operacoes">
        {() => (
          <RoleBasedRoute allowedRoles={['gestao', 'dev']}>
            <GestaoOperacoes />
          </RoleBasedRoute>
        )}
      </Route>
      <Route path="/gestao/financeiro">
        {() => (
          <RoleBasedRoute allowedRoles={['gestao', 'dev']}>
            <GestaoFinanceiro />
          </RoleBasedRoute>
        )}
      </Route>
      <Route path="/gestao/tecnologia">
        {() => (
          <RoleBasedRoute allowedRoles={['gestao', 'dev']}>
            <GestaoTecnologia />
          </RoleBasedRoute>
        )}
      </Route>
      <Route path="/gestao/comercial">
        {() => (
          <RoleBasedRoute allowedRoles={['gestao', 'dev']}>
            <GestaoComercial />
          </RoleBasedRoute>
        )}
      </Route>
      <Route path="/gestao/melhorias">
        {() => (
          <RoleBasedRoute allowedRoles={['gestao', 'dev']}>
            <GestaoMelhorias />
          </RoleBasedRoute>
        )}
      </Route>
      <Route path="/gestao/veiculos-orfaos">
        {() => (
          <RoleBasedRoute allowedRoles={['gestao', 'dev']}>
            <GestaoVeiculosOrfaos />
          </RoleBasedRoute>
        )}
      </Route>

      {/* ========== FALLBACK ========== */}
      <Route path="/404" component={NotFound} />
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
