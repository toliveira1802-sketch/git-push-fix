import { useState } from "react";
import { Calendar, Users, DollarSign, Loader2, TrendingUp, RotateCcw, XCircle, Car, Clock, BarChart3, CalendarClock, Cog, LayoutDashboard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useNavigate } from "@/hooks/useNavigate";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";

// Corinthians SVG Symbol - Timão
const CorinthiansIcon = ({ size = 40 }: { size?: number }) => (
  <svg viewBox="0 0 100 100" style={{ width: size, height: size }}>
    <circle cx="50" cy="50" r="48" fill="#000000" />
    <circle cx="50" cy="50" r="42" fill="none" stroke="#FFFFFF" strokeWidth="3" />
    <path
      d="M50 15 L55 35 L75 35 L60 48 L67 68 L50 55 L33 68 L40 48 L25 35 L45 35 Z"
      fill="#FFFFFF"
    />
    <text x="50" y="88" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="bold">SCCP</text>
  </svg>
);


const AdminDashboard = () => {
  const navigate = useNavigate();
  const {
    stats,
    loading,
    todayAppointments,
    newClients,
    readyToDeliver,
    returnVehicles,
    cancelledAppointments,
    vehiclesInYard,
    awaitingApproval,
  } = useAdminDashboard();

  // Modal states
  const [showAppointments, setShowAppointments] = useState(false);
  const [showNewClients, setShowNewClients] = useState(false);
  const [showReadyToDeliver, setShowReadyToDeliver] = useState(false);
  const [showReturns, setShowReturns] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);
  const [showVehiclesInYard, setShowVehiclesInYard] = useState(false);
  const [showAwaitingApproval, setShowAwaitingApproval] = useState(false);

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
        {/* Pendências do dia - Botão com quantidade */}
        <Card
          className="border cursor-pointer hover:scale-[1.02] transition-transform bg-gradient-to-br from-primary/5 to-primary/10"
          onClick={() => navigate('/admin/pendencias')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CorinthiansIcon size={48} />
                <div>
                  <span className="text-xl font-semibold text-foreground">Pendências do dia</span>
                  <p className="text-sm text-muted-foreground">Tarefas da equipe</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Dashboard Buttons */}
        <div className="grid grid-cols-5 gap-3">
          <Card
            className="border cursor-pointer hover:scale-[1.02] transition-transform bg-gradient-to-br from-slate-500/10 to-slate-600/5"
            onClick={() => navigate('/admin/overview')}
          >
            <CardContent className="p-3 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-lg bg-slate-500/20 flex items-center justify-center mb-2">
                <LayoutDashboard className="w-5 h-5 text-slate-400" />
              </div>
              <span className="text-xs font-medium text-foreground">Visão Geral</span>
            </CardContent>
          </Card>

          <Card
            className="border cursor-pointer hover:scale-[1.02] transition-transform bg-gradient-to-br from-cyan-500/10 to-cyan-600/5"
            onClick={() => navigate('/admin/operacional')}
          >
            <CardContent className="p-3 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-2">
                <Cog className="w-5 h-5 text-cyan-500" />
              </div>
              <span className="text-xs font-medium text-foreground">Operacional</span>
            </CardContent>
          </Card>

          <Card
            className="border cursor-pointer hover:scale-[1.02] transition-transform bg-gradient-to-br from-emerald-500/10 to-emerald-600/5"
            onClick={() => navigate('/admin/financeiro')}
          >
            <CardContent className="p-3 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-2">
                <DollarSign className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="text-xs font-medium text-foreground">Financeiro</span>
            </CardContent>
          </Card>

          <Card
            className="border cursor-pointer hover:scale-[1.02] transition-transform bg-gradient-to-br from-blue-500/10 to-blue-600/5"
            onClick={() => navigate('/admin/produtividade')}
          >
            <CardContent className="p-3 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-xs font-medium text-foreground">Produtividade</span>
            </CardContent>
          </Card>

          <Card
            className="border cursor-pointer hover:scale-[1.02] transition-transform bg-gradient-to-br from-purple-500/10 to-purple-600/5"
            onClick={() => navigate('/admin/agenda-mecanicos')}
          >
            <CardContent className="p-3 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-2">
                <CalendarClock className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-xs font-medium text-foreground">Agenda Mec.</span>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Veículos no Pátio */}
          <Card
            className="border cursor-pointer hover:scale-[1.02] transition-transform bg-gradient-to-br from-blue-500/10 to-blue-600/5"
            onClick={() => setShowVehiclesInYard(true)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Car className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">{stats.vehiclesInYard}</p>
                  <p className="text-sm text-muted-foreground">Veículos no Pátio</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aguardando Aprovação */}
          <Card
            className="border cursor-pointer hover:scale-[1.02] transition-transform bg-gradient-to-br from-amber-500/10 to-amber-600/5"
            onClick={() => setShowAwaitingApproval(true)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">{stats.awaitingApproval}</p>
                  <p className="text-sm text-muted-foreground">Aguardando APV</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Indicadores Secundários */}
        <div className="grid grid-cols-2 gap-4">
          {/* Faturado Mês */}
          <Card className="border">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    R$ {stats.monthlyRevenue.toLocaleString("pt-BR")}
                  </p>
                  <p className="text-sm text-muted-foreground">Faturado (Mês)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agendamentos Hoje */}
          <Card
            className="border cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => setShowAppointments(true)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.appointmentsToday}</p>
                  <p className="text-sm text-muted-foreground">Agendamentos Hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Novos Clientes */}
          <Card
            className="border cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => setShowNewClients(true)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-cyan-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.newClientsMonth}</p>
                  <p className="text-sm text-muted-foreground">Novos Clientes (Mês)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Retorno do Mês */}
          <Card
            className="border cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => setShowReturns(true)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <RotateCcw className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.returnsMonth}</p>
                  <p className="text-sm text-muted-foreground">Retorno do Mês</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Valor para Sair */}
          <Card
            className="border cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => setShowReadyToDeliver(true)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    R$ {stats.valueTodayDelivery.toLocaleString("pt-BR")}
                  </p>
                  <p className="text-sm text-muted-foreground">Valor p/ Sair Hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agendamentos Cancelados */}
          <Card
            className="border cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => setShowCancelled(true)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.cancelledMonth}</p>
                  <p className="text-sm text-muted-foreground">Cancelados (Mês)</p>
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
              <Calendar className="w-5 h-5 text-primary" />
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

      {/* Modal Novos Clientes */}
      <Dialog open={showNewClients} onOpenChange={setShowNewClients}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-500" />
              Novos Clientes do Mês
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {newClients.length > 0 ? (
              <div className="space-y-3">
                {newClients.map((client) => (
                  <div key={client.id} className="p-3 rounded-lg bg-muted/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{client.full_name}</p>
                        <p className="text-sm text-muted-foreground">{client.phone}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{client.created_at}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">Nenhum cliente novo este mês</p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Modal Valor para Sair */}
      <Dialog open={showReadyToDeliver} onOpenChange={setShowReadyToDeliver}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              Prontos para Retirada
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {readyToDeliver.length > 0 ? (
              <div className="space-y-3">
                {readyToDeliver.map((os) => (
                  <div key={os.id} className="p-3 rounded-lg bg-muted/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{os.client_name}</p>
                        <p className="text-sm text-muted-foreground">{os.vehicle}</p>
                        <p className="text-xs text-muted-foreground">{os.numero_os}</p>
                      </div>
                      <p className="font-bold text-emerald-500">
                        R$ {os.valor_final.toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">Nenhum veículo pronto para retirada</p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Modal Retorno do Mês */}
      <Dialog open={showReturns} onOpenChange={setShowReturns}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-purple-500" />
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

      {/* Modal Agendamentos Cancelados */}
      <Dialog open={showCancelled} onOpenChange={setShowCancelled}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              Agendamentos Cancelados
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {cancelledAppointments.length > 0 ? (
              <div className="space-y-3">
                {cancelledAppointments.map((ca) => (
                  <div key={ca.id} className="p-3 rounded-lg bg-muted/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{ca.client_name}</p>
                        <p className="text-sm text-muted-foreground">{ca.phone}</p>
                        <p className="text-xs text-muted-foreground">{ca.vehicle}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{ca.cancelled_at}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">Nenhum cancelamento este mês</p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Modal Veículos no Pátio */}
      <Dialog open={showVehiclesInYard} onOpenChange={setShowVehiclesInYard}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Car className="w-5 h-5 text-blue-500" />
              Veículos no Pátio
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {vehiclesInYard.length > 0 ? (
              <div className="space-y-3">
                {vehiclesInYard.map((v) => (
                  <div key={v.id} className="p-3 rounded-lg bg-muted/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-mono font-bold text-primary">{v.plate}</p>
                        <p className="text-sm text-muted-foreground">{v.vehicle}</p>
                        <p className="text-xs text-muted-foreground">{v.client_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{v.status}</p>
                        <p className="text-xs text-muted-foreground">{v.etapa}</p>
                      </div>
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

      {/* Modal Aguardando Aprovação */}
      <Dialog open={showAwaitingApproval} onOpenChange={setShowAwaitingApproval}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Aguardando Aprovação
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {awaitingApproval.length > 0 ? (
              <div className="space-y-3">
                {awaitingApproval.map((os) => (
                  <div key={os.id} className="p-3 rounded-lg bg-muted/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-mono text-xs text-muted-foreground">{os.numero_os}</p>
                        <p className="font-medium">{os.client_name}</p>
                        <p className="text-sm text-muted-foreground">{os.vehicle}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-500">
                          R$ {os.valor.toLocaleString("pt-BR")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {os.dias_aguardando === 0 ? 'Hoje' : `${os.dias_aguardando}d aguardando`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">Nenhum orçamento aguardando aprovação</p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminDashboard;
