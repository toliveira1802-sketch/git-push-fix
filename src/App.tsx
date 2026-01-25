import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/hooks/useTheme";
import { CompanyProvider } from "@/contexts/CompanyContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Agenda from "./pages/Agenda";
import Historico from "./pages/Historico";
import NovoAgendamento from "./pages/NovoAgendamento";
import AgendamentoSucesso from "./pages/AgendamentoSucesso";
import Configuracoes from "./pages/Configuracoes";
import Performance from "./pages/Performance";
import Avisos from "./pages/Avisos";
import Veiculos from "./pages/Veiculos";
import VisaoGeral from "./pages/VisaoGeral";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import OrdensServico from "./pages/admin/OrdensServico";

import AdminOSDetalhes from "./pages/admin/AdminOSDetalhes";
import Clientes from "./pages/admin/Clientes";
import AdminVeiculos from "./pages/admin/AdminVeiculos";
import AdminAgendamentos from "./pages/admin/AdminAgendamentos";
import AdminIAs from "./pages/admin/AdminIAs";
import NovaPromocao from "./pages/admin/NovaPromocao";
import Pendencias from "./pages/admin/Pendencias";
import MonitoramentoPatio from "./pages/admin/MonitoramentoPatio";
import AdminOperacional from "./pages/admin/AdminOperacional";
import AdminAgendaMecanicos from "./pages/admin/AdminAgendaMecanicos";
import AdminMechanicFeedback from "./pages/admin/AdminMechanicFeedback";
import AdminMechanicAnalytics from "./pages/admin/AdminMechanicAnalytics";
import AdminFinanceiro from "./pages/admin/AdminFinanceiro";
import AdminConfiguracoes from "./pages/admin/AdminConfiguracoes";
import AdminProdutividade from "./pages/admin/AdminProdutividade";
import AdminMelhorias from "./pages/admin/AdminMelhorias";
import AdminParametros from "./pages/admin/AdminParametros";
import AdminDocumentacao from "./pages/admin/AdminDocumentacao";
import AdminPatioDetalhes from "./pages/admin/AdminPatioDetalhes";
import Cadastros from "./pages/admin/Cadastros";
import AdminMetas from "./pages/admin/AdminMetas";
import AdminMonitoramentoKommo from "./pages/admin/AdminMonitoramentoKommo";

// Gestão pages
import GestaoDashboards from "./pages/gestao/GestaoDashboards";
import GestaoRH from "./pages/gestao/GestaoRH";
import GestaoOperacoes from "./pages/gestao/GestaoOperacoes";
import GestaoFinanceiro from "./pages/gestao/GestaoFinanceiro";
import GestaoTecnologia from "./pages/gestao/GestaoTecnologia";
import GestaoComercial from "./pages/gestao/GestaoComercial";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <CompanyProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/perfil" element={<Profile />} />
                <Route path="/agenda" element={<Agenda />} />
                <Route path="/historico" element={<Historico />} />
                <Route path="/novo-agendamento" element={<NovoAgendamento />} />
                <Route path="/agendamento-sucesso" element={<AgendamentoSucesso />} />
                <Route path="/configuracoes" element={<Configuracoes />} />
                <Route path="/performance" element={<Performance />} />
                <Route path="/avisos" element={<Avisos />} />
                <Route path="/veiculos" element={<Veiculos />} />
                <Route path="/visao-geral" element={<VisaoGeral />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/pendencias" element={<Pendencias />} />
                <Route path="/admin/ordens-servico" element={<OrdensServico />} />
                <Route path="/admin/os/nova" element={<AdminOSDetalhes />} />
                <Route path="/admin/os/:osId" element={<AdminOSDetalhes />} />
                <Route path="/admin/clientes" element={<Clientes />} />
                <Route path="/admin/veiculos" element={<AdminVeiculos />} />
                <Route path="/admin/agendamentos" element={<AdminAgendamentos />} />
                <Route path="/admin/ias" element={<AdminIAs />} />
                <Route path="/admin/nova-promocao" element={<NovaPromocao />} />
                <Route path="/admin/patio" element={<MonitoramentoPatio />} />
                <Route path="/admin/operacional" element={<AdminOperacional />} />
                <Route path="/admin/patio/:patioId" element={<AdminPatioDetalhes />} />
                <Route path="/admin/documentacao" element={<AdminDocumentacao />} />
                <Route path="/admin/agenda-mecanicos" element={<AdminAgendaMecanicos />} />
                <Route path="/admin/feedback-mecanicos" element={<AdminMechanicFeedback />} />
                <Route path="/admin/analytics-mecanicos" element={<AdminMechanicAnalytics />} />
                <Route path="/admin/financeiro" element={<AdminFinanceiro />} />
                <Route path="/admin/configuracoes" element={<AdminConfiguracoes />} />
                <Route path="/admin/produtividade" element={<AdminProdutividade />} />
                <Route path="/admin/melhorias" element={<AdminMelhorias />} />
                <Route path="/admin/parametros" element={<AdminParametros />} />
                <Route path="/admin/metas" element={<AdminMetas />} />
                <Route path="/admin/cadastros" element={<Cadastros />} />
                <Route path="/admin/monitoramento-kommo" element={<AdminMonitoramentoKommo />} />
                
                {/* Gestão Routes */}
                <Route path="/gestao" element={<GestaoDashboards />} />
                <Route path="/gestao/rh" element={<GestaoRH />} />
                <Route path="/gestao/operacoes" element={<GestaoOperacoes />} />
                <Route path="/gestao/financeiro" element={<GestaoFinanceiro />} />
                <Route path="/gestao/tecnologia" element={<GestaoTecnologia />} />
                <Route path="/gestao/comercial" element={<GestaoComercial />} />
                
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CompanyProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
