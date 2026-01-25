import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
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
import NovaOS from "./pages/admin/NovaOS";
import AdminOSDetalhes from "./pages/admin/AdminOSDetalhes";
import Clientes from "./pages/admin/Clientes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
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
            <Route path="/admin/ordens-servico" element={<OrdensServico />} />
            <Route path="/admin/nova-os" element={<NovaOS />} />
            <Route path="/admin/os/:osId" element={<AdminOSDetalhes />} />
            <Route path="/admin/clientes" element={<Clientes />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
