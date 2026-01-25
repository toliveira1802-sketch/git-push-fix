import { useState } from "react";
import { Calendar, Users, DollarSign, Loader2, TrendingUp, RotateCcw, XCircle, Car, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DashboardStats {
  appointmentsToday: number;
  newClientsMonth: number;
  monthlyRevenue: number;
  valueTodayDelivery: number;
  returnsMonth: number;
  cancelledMonth: number;
  vehiclesInYard: number;
  awaitingApproval: number;
}

// Mock data for frontend-only mode
const mockStats: DashboardStats = {
  appointmentsToday: 8,
  newClientsMonth: 12,
  monthlyRevenue: 45680,
  valueTodayDelivery: 8500,
  returnsMonth: 3,
  cancelledMonth: 2,
  vehiclesInYard: 14,
  awaitingApproval: 5,
};

const mockTodayAppointments = [
  { id: '1', time: '08:00', client_name: 'João Silva', vehicle: 'VW Golf GTI - ABC-1234', status: 'confirmado' },
  { id: '2', time: '09:30', client_name: 'Maria Santos', vehicle: 'Toyota Corolla - GHI-9012', status: 'pendente' },
  { id: '3', time: '11:00', client_name: 'Carlos Oliveira', vehicle: 'BMW 320i - JKL-3456', status: 'confirmado' },
  { id: '4', time: '14:00', client_name: 'Ana Costa', vehicle: 'Honda Civic - DEF-5678', status: 'em_execucao' },
];

const mockNewClients = [
  { id: '1', full_name: 'Carlos Oliveira', phone: '11977665544', created_at: '22/01/2024' },
  { id: '2', full_name: 'Ana Costa', phone: '11944332211', created_at: '20/01/2024' },
  { id: '3', full_name: 'Pedro Almeida', phone: '11933221100', created_at: '18/01/2024' },
];

const mockReadyToDeliver = [
  { id: '1', numero_os: 'OS-2024-003', vehicle: 'Honda Civic', client_name: 'João Silva', valor_final: 2500 },
  { id: '2', numero_os: 'OS-2024-005', vehicle: 'VW Polo', client_name: 'Maria Santos', valor_final: 1800 },
];

const mockReturnVehicles = [
  { id: '1', plate: 'ABC-1234', vehicle: 'VW Golf GTI', client_name: 'João Silva', data_entrega: '15/01/2024' },
  { id: '2', plate: 'XYZ-9999', vehicle: 'Fiat Argo', client_name: 'Pedro Santos', data_entrega: '10/01/2024' },
];

const mockCancelledAppointments = [
  { id: '1', client_name: 'Roberto Lima', phone: '11988776655', vehicle: 'Chevrolet Onix', cancelled_at: '19/01/2024' },
  { id: '2', client_name: 'Fernanda Costa', phone: '11977665544', vehicle: 'Renault Sandero', cancelled_at: '16/01/2024' },
];

const mockVehiclesInYard = [
  { id: '1', plate: 'ABC-1234', vehicle: 'VW Golf GTI', client_name: 'João Silva', status: 'Em execução', etapa: 'Mecânica' },
  { id: '2', plate: 'DEF-5678', vehicle: 'Honda Civic', client_name: 'Maria Santos', status: 'Diagnóstico', etapa: 'Elétrica' },
  { id: '3', plate: 'GHI-9012', vehicle: 'Toyota Corolla', client_name: 'Carlos Oliveira', status: 'Aguardando peça', etapa: 'Suspensão' },
  { id: '4', plate: 'JKL-3456', vehicle: 'BMW 320i', client_name: 'Ana Costa', status: 'Em execução', etapa: 'Motor' },
  { id: '5', plate: 'MNO-7890', vehicle: 'Fiat Argo', client_name: 'Pedro Almeida', status: 'Finalizado', etapa: 'Lavagem' },
];

const mockAwaitingApproval = [
  { id: '1', numero_os: 'OS-2024-010', vehicle: 'VW Polo', client_name: 'Roberto Lima', valor: 3500, dias_aguardando: 2 },
  { id: '2', numero_os: 'OS-2024-012', vehicle: 'Chevrolet Onix', client_name: 'Fernanda Costa', valor: 1800, dias_aguardando: 1 },
  { id: '3', numero_os: 'OS-2024-015', vehicle: 'Hyundai HB20', client_name: 'Lucas Mendes', valor: 4200, dias_aguardando: 3 },
  { id: '4', numero_os: 'OS-2024-018', vehicle: 'Renault Kwid', client_name: 'Julia Santos', valor: 950, dias_aguardando: 0 },
  { id: '5', numero_os: 'OS-2024-020', vehicle: 'Ford Ka', client_name: 'Marcos Silva', valor: 2100, dias_aguardando: 4 },
];

// Pending tasks count (mock)
const pendingTasksCount = 5;

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
  const [stats] = useState<DashboardStats>(mockStats);
  const [loading] = useState(false);

  // Modal states
  const [showAppointments, setShowAppointments] = useState(false);
  const [showNewClients, setShowNewClients] = useState(false);
  const [showReadyToDeliver, setShowReadyToDeliver] = useState(false);
  const [showReturns, setShowReturns] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);

  const [showVehiclesInYard, setShowVehiclesInYard] = useState(false);
  const [showAwaitingApproval, setShowAwaitingApproval] = useState(false);
  const [showPendencias, setShowPendencias] = useState(false);

  const statusLabels: Record<string, string> = {
    pendente: "Pendente",
    confirmado: "Confirmado",
    em_execucao: "Em Execução",
    diagnostico: "Diagnóstico",
    orcamento: "Orçamento",
    aguardando_aprovacao: "Aguardando",
    pronto_retirada: "Pronto",
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
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-primary">{pendingTasksCount}</span>
                <span className="text-sm text-muted-foreground">pendentes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards de Navegação Rápida */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Operacional */}
          <Card
            className="border cursor-pointer hover:scale-[1.02] transition-transform bg-gradient-to-br from-blue-500/10 to-blue-600/5"
            onClick={() => navigate('/admin/ordens-servico')}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-16 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <span className="text-3xl">⚙️</span>
                </div>
                <span className="text-lg font-semibold text-foreground">Operacional</span>
                <span className="text-xs text-muted-foreground">OSs, Pátio, Agendamentos</span>
              </div>
            </CardContent>
          </Card>

          {/* Financeiro */}
          <Card
            className="border cursor-pointer hover:scale-[1.02] transition-transform bg-gradient-to-br from-green-500/10 to-green-600/5"
            onClick={() => navigate('/admin/ordens-servico')}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-16 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <span className="text-3xl">💰</span>
                </div>
                <span className="text-lg font-semibold text-foreground">Financeiro</span>
                <span className="text-xs text-muted-foreground">Faturamento, Despesas</span>
              </div>
            </CardContent>
          </Card>

          {/* Produtividade */}
          <Card
            className="border cursor-pointer hover:scale-[1.02] transition-transform bg-gradient-to-br from-purple-500/10 to-purple-600/5"
            onClick={() => navigate('/admin/ordens-servico')}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-16 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <span className="text-3xl">📊</span>
                </div>
                <span className="text-lg font-semibold text-foreground">Produtividade</span>
                <span className="text-xs text-muted-foreground">Métricas, Performance</span>
              </div>
            </CardContent>
          </Card>

          {/* Agenda */}
          <Card
            className="border cursor-pointer hover:scale-[1.02] transition-transform bg-gradient-to-br from-orange-500/10 to-orange-600/5"
            onClick={() => navigate('/admin/agendamentos')}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-16 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <span className="text-3xl">📅</span>
                </div>
                <span className="text-lg font-semibold text-foreground">Agenda</span>
                <span className="text-xs text-muted-foreground">Mecânicos, Feedback</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Indicadores Principais - Pátio e Aguardando APV */}
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
            {mockTodayAppointments.length > 0 ? (
              <div className="space-y-3">
                {mockTodayAppointments.map((apt) => (
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
            {mockNewClients.length > 0 ? (
              <div className="space-y-3">
                {mockNewClients.map((client) => (
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
            {mockReadyToDeliver.length > 0 ? (
              <div className="space-y-3">
                {mockReadyToDeliver.map((os) => (
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
            {mockReturnVehicles.length > 0 ? (
              <div className="space-y-3">
                {mockReturnVehicles.map((rv) => (
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
            {mockCancelledAppointments.length > 0 ? (
              <div className="space-y-3">
                {mockCancelledAppointments.map((ca) => (
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
            {mockVehiclesInYard.length > 0 ? (
              <div className="space-y-3">
                {mockVehiclesInYard.map((v) => (
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
            {mockAwaitingApproval.length > 0 ? (
              <div className="space-y-3">
                {mockAwaitingApproval.map((os) => (
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

      {/* Modal Pendências */}
      <Dialog open={showPendencias} onOpenChange={setShowPendencias}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CorinthiansIcon size={24} />
              Pendências do Dia
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium">Confirmar agendamento</p>
                <p className="text-sm text-muted-foreground">João Silva - 14:00</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium">Enviar orçamento</p>
                <p className="text-sm text-muted-foreground">OS-2024-015 - Hyundai HB20</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium">Ligar para cliente</p>
                <p className="text-sm text-muted-foreground">Maria Santos - Retorno</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium">Verificar peça</p>
                <p className="text-sm text-muted-foreground">Filtro de óleo - VW Golf</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium">Finalizar OS</p>
                <p className="text-sm text-muted-foreground">OS-2024-008 - Honda Civic</p>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminDashboard;
