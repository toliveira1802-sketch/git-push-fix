import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Car,
  Bell,
  Gift,
  ChevronRight,
  Home,
  Calendar,
  History,
  TrendingUp,
  Instagram,
  Youtube,
  BookOpen,
  User,
  LogOut,
  Wrench,
  Plus,
  Settings,
  Sun,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Loader2 } from "lucide-react";
import TikTokIcon from "@/components/icons/TikTokIcon";
import ForcePasswordChange from "@/components/auth/ForcePasswordChange";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface VisaoDia {
  veiculosPatio: number;
  osEmAndamento: number;
  entregasHoje: number;
  agendamentosHoje: number;
  horarioFuncionamento: string;
}

const Index = () => {
  const navigate = useNavigate();
  const { user, loading, signOut, mustChangePassword, setMustChangePassword } = useAuth();
  const { canAccessAdmin, canAccessGestao, isLoading: roleLoading } = useUserRole();
  const [userName, setUserName] = useState("...");
  const [veiculosModalOpen, setVeiculosModalOpen] = useState(false);
  const [visaoDia, setVisaoDia] = useState<VisaoDia>({
    veiculosPatio: 0,
    osEmAndamento: 0,
    entregasHoje: 0,
    agendamentosHoje: 0,
    horarioFuncionamento: '08:15 - 17:30',
  });

  // Mock veículos
  const veiculosMock = [
    { id: "1", marca: "Honda", modelo: "Civic", placa: "ABC-1234", emServico: true },
    { id: "2", marca: "Toyota", modelo: "Corolla", placa: "XYZ-5678", emServico: false },
  ];

  // Fetch visão do dia
  useEffect(() => {
    const fetchVisaoDia = async () => {
      try {
        const hoje = new Date();
        const hojeStr = format(hoje, 'yyyy-MM-dd');
        const diaSemana = hoje.getDay(); // 0 = domingo, 6 = sábado

        // Buscar configuração de horário
        const { data: configData } = await supabase
          .from('system_config')
          .select('value')
          .eq('key', 'horario_funcionamento')
          .maybeSingle();

        let horario = '08:15 - 17:30';
        if (configData?.value) {
          const h = configData.value as { seg_sex?: { inicio: string; fim: string }; sab?: { inicio: string; fim: string } };
          if (diaSemana === 6 && h.sab) {
            horario = `${h.sab.inicio} - ${h.sab.fim}`;
          } else if (diaSemana >= 1 && diaSemana <= 5 && h.seg_sex) {
            horario = `${h.seg_sex.inicio} - ${h.seg_sex.fim}`;
          } else if (diaSemana === 0) {
            horario = 'Fechado';
          }
        }

        // Buscar OSs ativas (veículos no pátio)
        const { count: veiculosPatio } = await supabase
          .from('service_orders')
          .select('*', { count: 'exact', head: true })
          .not('status', 'eq', 'entregue')
          .not('status', 'eq', 'cancelado');

        // Buscar OSs em execução
        const { count: osEmAndamento } = await supabase
          .from('service_orders')
          .select('*', { count: 'exact', head: true })
          .in('status', ['em_execucao', 'aguardando_pecas', 'diagnostico']);

        // Buscar entregas previstas para hoje
        const { count: entregasHoje } = await supabase
          .from('service_orders')
          .select('*', { count: 'exact', head: true })
          .gte('estimated_completion', `${hojeStr}T00:00:00`)
          .lte('estimated_completion', `${hojeStr}T23:59:59`)
          .not('status', 'eq', 'entregue');

        // Buscar agendamentos de hoje
        const { count: agendamentosHoje } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('scheduled_date', hojeStr)
          .eq('status', 'agendado');

        setVisaoDia({
          veiculosPatio: veiculosPatio || 0,
          osEmAndamento: osEmAndamento || 0,
          entregasHoje: entregasHoje || 0,
          agendamentosHoje: agendamentosHoje || 0,
          horarioFuncionamento: horario,
        });
      } catch (error) {
        console.error('Erro ao buscar visão do dia:', error);
      }
    };

    fetchVisaoDia();
  }, []);

  useEffect(() => {
    // Get mock profile from localStorage
    const profile = localStorage.getItem('mock_profile');
    if (profile) {
      const parsed = JSON.parse(profile);
      if (parsed?.full_name) {
        const firstName = parsed.full_name.split(" ")[0];
        setUserName(firstName);
      }
    } else if (user?.email) {
      setUserName(user.email.split('@')[0]);
    }
  }, [user]);

  // Redirect to login if not authenticated (after loading completes)
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSocialClick = (platform: string) => {
    const urls: Record<string, string> = {
      instagram: "https://www.instagram.com/doctorauto.prime",
      youtube: "https://www.youtube.com/@PerformanceDoctorAuto/shorts",
      tiktok: "https://www.tiktok.com/@doctorauto.prime",
      blog: "/blog",
    };

    if (platform === "blog") {
      navigate("/blog");
    } else {
      window.open(urls[platform], "_blank");
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  // Show password change screen if required
  if (mustChangePassword) {
    return (
      <ForcePasswordChange 
        onSuccess={() => setMustChangePassword(false)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="bg-[#111] border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
            <Car className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold">Doctor Auto Prime</h1>
        </div>

        {/* Navigation Tabs - Only show if user has access to other modules */}
        {(canAccessAdmin || canAccessGestao) && (
          <div className="flex items-center gap-1 bg-[#1a1a1a] rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Home className="w-4 h-4 mr-1" />
              Cliente
            </Button>
            {canAccessAdmin && (
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-[#252525]"
                onClick={() => navigate("/admin")}
              >
                <Settings className="w-4 h-4 mr-1" />
                Admin
              </Button>
            )}
            {canAccessGestao && (
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-[#252525]"
                onClick={() => navigate("/gestao")}
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                Gestão
              </Button>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/perfil")}>
            <User className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 pb-24 max-w-2xl mx-auto">
        {/* Greeting */}
        <div className="mb-4">
          <h2 className="text-3xl font-bold mb-1">
            Olá, {userName} 👋
          </h2>
        </div>

        {/* Visão do Dia */}
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#111] border-gray-800 p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Sun className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold">Visão do Dia</h3>
            <span className="text-sm text-gray-400 ml-auto">
              {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </span>
          </div>
          
          <div className="flex items-center gap-2 mb-4 text-sm">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400">Funcionamento:</span>
            <Badge variant="outline" className="border-gray-700 text-gray-300">
              {visaoDia.horarioFuncionamento}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0a0a0a] rounded-lg p-3 border border-gray-800">
              <div className="flex items-center gap-2 mb-1">
                <Car className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400">No Pátio</span>
              </div>
              <p className="text-2xl font-bold">{visaoDia.veiculosPatio}</p>
            </div>

            <div className="bg-[#0a0a0a] rounded-lg p-3 border border-gray-800">
              <div className="flex items-center gap-2 mb-1">
                <Wrench className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-gray-400">Em Andamento</span>
              </div>
              <p className="text-2xl font-bold">{visaoDia.osEmAndamento}</p>
            </div>

            <div className="bg-[#0a0a0a] rounded-lg p-3 border border-gray-800">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">Entregas Hoje</span>
              </div>
              <p className="text-2xl font-bold">{visaoDia.entregasHoje}</p>
            </div>

            <div className="bg-[#0a0a0a] rounded-lg p-3 border border-gray-800">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-gray-400">Agendamentos</span>
              </div>
              <p className="text-2xl font-bold">{visaoDia.agendamentosHoje}</p>
            </div>
          </div>
        </Card>

        {/* Meus Veículos - Modal */}
        <Card
          className="bg-[#111] border-gray-800 p-4 mb-4 cursor-pointer hover:bg-[#151515] transition-colors"
          onClick={() => setVeiculosModalOpen(true)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center relative">
                <Car className="w-6 h-6 text-red-500" />
                {veiculosMock.some(v => v.emServico) && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg">MEUS VEÍCULOS</h3>
                <p className="text-sm text-gray-400">
                  {veiculosMock.length} veículo{veiculosMock.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Card>

        {/* Modal de Veículos */}
        <Dialog open={veiculosModalOpen} onOpenChange={setVeiculosModalOpen}>
          <DialogContent className="max-w-[90%] rounded-xl bg-[#111] border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Car className="w-5 h-5 text-red-500" />
                Meus Veículos
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              {veiculosMock.map((veiculo) => (
                <div 
                  key={veiculo.id}
                  className={`p-3 rounded-lg border ${
                    veiculo.emServico 
                      ? "bg-red-600/10 border-red-500/30" 
                      : "bg-[#1a1a1a] border-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{veiculo.marca} {veiculo.modelo}</p>
                      <p className="text-sm text-gray-400 font-mono">{veiculo.placa}</p>
                    </div>
                    {veiculo.emServico && (
                      <Badge className="bg-red-600 text-white text-xs">
                        <Wrench className="w-3 h-3 mr-1" />
                        Em serviço
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1 border-gray-700 text-white hover:bg-gray-800"
                  onClick={() => {
                    setVeiculosModalOpen(false);
                    navigate("/veiculos");
                  }}
                >
                  Ver todos
                </Button>
                <Button 
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    setVeiculosModalOpen(false);
                    navigate("/veiculos");
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Lembretes e Avisos */}
        {(() => {
          // Mock: verificar se há avisos ou agendamentos pendentes
          const temAvisos = true; // mock: tem aviso
          const temAgendamento = true; // mock: tem agendamento
          const destino = temAvisos ? "/avisos" : temAgendamento ? "/agenda" : "/avisos";
          const descricao = temAvisos 
            ? "1 aviso novo" 
            : temAgendamento 
              ? "1 agendamento pendente" 
              : "Nenhum pendente";
          
          return (
            <Card
              className="bg-[#111] border-gray-800 p-4 mb-4 cursor-pointer hover:bg-[#151515] transition-colors"
              onClick={() => navigate(destino)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-600/20 rounded-full flex items-center justify-center relative">
                    <Bell className="w-6 h-6 text-yellow-500" />
                    {(temAvisos || temAgendamento) && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Lembretes e Avisos</h3>
                    <p className="text-sm text-gray-400">{descricao}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Card>
          );
        })()}

        {/* Promoções */}
        <Card
          className="bg-[#111] border-gray-800 p-4 mb-6 cursor-pointer hover:bg-[#151515] transition-colors"
          onClick={() => navigate("/blog")}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center">
                <Gift className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Promoções</h3>
                <p className="text-sm text-gray-400">Aguarde novidades</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Card>

        {/* Social Media Links */}
        <div className="grid grid-cols-4 gap-3">
          <button
            onClick={() => handleSocialClick("instagram")}
            className="relative bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-4 aspect-square flex items-center justify-center hover:scale-105 transition-transform"
          >
            <Instagram className="w-8 h-8" />
            <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full" />
          </button>

          <button
            onClick={() => handleSocialClick("youtube")}
            className="relative bg-red-600 rounded-2xl p-4 aspect-square flex items-center justify-center hover:scale-105 transition-transform"
          >
            <Youtube className="w-8 h-8" />
            <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full" />
          </button>

          <button
            onClick={() => handleSocialClick("tiktok")}
            className="relative bg-gradient-to-br from-cyan-500 to-pink-500 rounded-2xl p-4 aspect-square flex items-center justify-center hover:scale-105 transition-transform"
          >
            <TikTokIcon size={32} />
            <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full" />
          </button>

          <button
            onClick={() => handleSocialClick("blog")}
            className="relative bg-orange-600 rounded-2xl p-4 aspect-square flex items-center justify-center hover:scale-105 transition-transform"
          >
            <BookOpen className="w-8 h-8" />
            <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full" />
          </button>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#111] border-t border-gray-800 px-4 py-3">
        <div className="max-w-2xl mx-auto grid grid-cols-4 gap-2">
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 h-auto py-2 text-red-500"
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </Button>

          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 h-auto py-2 text-gray-400"
            onClick={() => navigate("/agenda")}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-xs">Agenda</span>
          </Button>

          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 h-auto py-2 text-gray-400"
            onClick={() => navigate("/historico")}
          >
            <History className="w-5 h-5" />
            <span className="text-xs">Histórico</span>
          </Button>

          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 h-auto py-2 text-gray-400"
            onClick={() => navigate("/performance")}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs">Performance</span>
          </Button>
        </div>
      </nav>
    </div>
  );
};

export default Index;
