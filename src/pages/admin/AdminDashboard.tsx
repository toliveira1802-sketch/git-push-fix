import { useState, useEffect } from "react";
import { Calendar, DollarSign, Loader2, TrendingUp, Car, Wrench, ChevronRight, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useNavigate } from "@/hooks/useNavigate";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const {
    stats,
    loading,
    todayAppointments,
    returnVehicles,
    vehiclesInYard,
  } = useAdminDashboard();

  // Pendências do dia
  const [pendencias, setPendencias] = useState<any[]>([]);

  useEffect(() => {
    const fetchPendencias = async () => {
      try {
        const { data, error } = await supabase
          .from("pendencias")
          .select("id, titulo, descricao, prioridade, status, tipo, vehicle_plate")
          .eq("status", "pendente")
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) throw error;
        setPendencias(data || []);
      } catch (error) {
        console.error("Erro ao carregar pendências:", error);
      }
    };
    fetchPendencias();
  }, []);

  // Modal states
  const [showAppointments, setShowAppointments] = useState(false);
  const [showReturns, setShowReturns] = useState(false);
  const [showVehiclesInYard, setShowVehiclesInYard] = useState(false);

  const statusLabels: Record<string, string> = {
    pendente: "Pendente",
    confirmado: "Confirmado",
    em_execucao: "Em Execução",
    diagnostico: "Diagnóstico",
    orcamento: "Orçamento",
    aguardando_aprovacao: "Aguardando",
    pronto_retirada: "Pronto",
    agendado: "Agendado",
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Pendências do dia */}
        <Card className="border border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <h2 className="text-base font-semibold text-foreground">Pendências do dia</h2>
              </div>
              <button 
                onClick={() => navigate('/admin/pendencias')}
                className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Ver todas
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            {pendencias.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma pendência para hoje. Bom trabalho!</p>
            ) : (
              <div className="space-y-2">
                {pendencias.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{p.titulo}</p>
                        {p.vehicle_plate && (
                          <p className="text-xs text-muted-foreground font-mono">{p.vehicle_plate}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {p.prioridade || p.tipo}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Navigation Tabs */}
        <div className="flex items-center gap-6 border-b border-border pb-2">
          <button 
            onClick={() => navigate('/admin/operacional')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors pb-2"
          >
            <Wrench className="w-4 h-4" />
            Operacional
          </button>
          <button 
            onClick={() => navigate('/admin/financeiro')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors pb-2"
          >
            <DollarSign className="w-4 h-4" />
            Financeiro
          </button>
          <button 
            onClick={() => navigate('/admin/produtividade')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors pb-2"
          >
            <TrendingUp className="w-4 h-4" />
            Produtividade
          </button>
          <button 
            onClick={() => navigate('/admin/agenda-mecanicos')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors pb-2"
          >
            <Calendar className="w-4 h-4" />
            Agenda Mec.
          </button>
        </div>

        {/* Stats Grid - 2x2 */}
        <div className="grid grid-cols-2 gap-4">
          {/* Veículos no Pátio */}
          <Card
            className="border border-border bg-card cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => setShowVehiclesInYard(true)}
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Car className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">{stats.vehiclesInYard}</p>
                  <p className="text-sm text-muted-foreground">Veículos no Pátio</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agendamentos Hoje */}
          <Card
            className="border border-border bg-card cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => setShowAppointments(true)}
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">{stats.appointmentsToday}</p>
                  <p className="text-sm text-muted-foreground">Agendamentos Hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Faturado (Mês) */}
          <Card className="border border-border bg-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">
                    R$ {stats.monthlyRevenue.toLocaleString("pt-BR")}
                  </p>
                  <p className="text-sm text-muted-foreground">Faturado (Mês)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Retorno do Mês */}
          <Card
            className="border border-border bg-card cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => setShowReturns(true)}
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">{stats.returnsMonth}</p>
                  <p className="text-sm text-muted-foreground">Retorno do Mês</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal Agendamentos Hoje */}
      <Dialog open={showAppointments} onOpenChange={setShowAppointments}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              Agendamentos de Hoje
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {todayAppointments.length > 0 ? (
              <div className="space-y-3">
                {todayAppointments.map((apt) => (
                  <div key={apt.id} className="p-3 rounded-lg bg-muted/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{apt.client_name}</p>
                        <p className="text-sm text-muted-foreground">{apt.vehicle}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-primary">{apt.time}</p>
                        <p className="text-xs text-muted-foreground">{statusLabels[apt.status] || apt.status}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">Nenhum agendamento para hoje</p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Modal Retorno do Mês */}
      <Dialog open={showReturns} onOpenChange={setShowReturns}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Retornos do Mês
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {returnVehicles.length > 0 ? (
              <div className="space-y-3">
                {returnVehicles.map((rv) => (
                  <div key={rv.id} className="p-3 rounded-lg bg-muted/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-mono font-bold text-primary">{rv.plate}</p>
                        <p className="text-sm text-muted-foreground">{rv.vehicle}</p>
                        <p className="text-xs text-muted-foreground">{rv.client_name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{rv.data_entrega}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">Nenhum retorno este mês</p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Modal Veículos no Pátio */}
      <Dialog open={showVehiclesInYard} onOpenChange={setShowVehiclesInYard}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Car className="w-5 h-5 text-purple-400" />
              Veículos no Pátio
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {vehiclesInYard.length > 0 ? (
              <div className="space-y-3">
                {vehiclesInYard.map((v) => (
                  <div 
                    key={v.id} 
                    className="p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => {
                      setShowVehiclesInYard(false);
                      navigate(`/admin/patio/${v.id}`);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-mono font-bold text-primary">{v.plate}</p>
                        <p className="text-sm text-muted-foreground">{v.vehicle}</p>
                        <p className="text-xs text-muted-foreground">{v.client_name}</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {statusLabels[v.status] || v.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">Nenhum veículo no pátio</p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminDashboard;
