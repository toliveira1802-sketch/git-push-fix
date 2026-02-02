import { useState } from "react";
import { useNavigate } from "@/hooks/useNavigate";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DollarSign, TrendingUp, Receipt, ArrowLeft, Target, Clock, AlertTriangle, Car } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { useFinanceiroDashboard, VehicleFinanceInfo } from "@/hooks/useFinanceiroDashboard";

type ModalType = 'preso' | 'atrasado' | null;

export default function GestaoFinanceiro() {
  const navigate = useNavigate();
  const { metrics, loading, refetch } = useFinanceiroDashboard();
  const [vehicleModal, setVehicleModal] = useState<ModalType>(null);

  const getVehicleList = (): { title: string; vehicles: VehicleFinanceInfo[]; color: string } => {
    switch (vehicleModal) {
      case 'preso':
        return { title: 'Veículos no Pátio (Preso)', vehicles: metrics.vehiclesPreso, color: 'amber' };
      case 'atrasado':
        return { title: 'Veículos Atrasados', vehicles: metrics.vehiclesAtrasado, color: 'red' };
      default:
        return { title: '', vehicles: [], color: 'primary' };
    }
  };

  const modalData = getVehicleList();

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/gestao")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-amber-500" />
              Financeiro
            </h1>
            <p className="text-muted-foreground">
              Faturamento e metas
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(metrics.faturado)}</p>
                  <p className="text-xs text-muted-foreground">Faturamento do Mês</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(metrics.ticketMedio)}</p>
                  <p className="text-xs text-muted-foreground">Ticket Médio</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{metrics.entregues}</p>
                  <p className="text-xs text-muted-foreground">Serviços Realizados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(metrics.metaMensal)}</p>
                  <p className="text-xs text-muted-foreground">Meta do Mês</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progresso da Meta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Progresso da Meta</span>
              <span className="text-lg font-bold text-primary">{metrics.percentualMeta.toFixed(1)}%</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={Math.min(metrics.percentualMeta, 100)} className="h-4" />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>Atual: {formatCurrency(metrics.faturado)}</span>
              <span>Meta: {formatCurrency(metrics.metaMensal)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Cards de Preso e Atrasado */}
        <div className="grid grid-cols-2 gap-4">
          {/* Preso no Pátio */}
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow border-amber-500/30"
            onClick={() => setVehicleModal('preso')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-amber-500 font-medium uppercase">PRESO NO PÁTIO</p>
                  <p className="text-2xl font-bold">{formatCurrency(metrics.preso)}</p>
                  <p className="text-xs text-muted-foreground">{metrics.vehiclesPreso.length} veículos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Atrasado */}
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow border-destructive/30"
            onClick={() => setVehicleModal('atrasado')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-destructive font-medium uppercase">ATRASADO</p>
                  <p className="text-2xl font-bold">{formatCurrency(metrics.atrasado)}</p>
                  <p className="text-xs text-muted-foreground">{metrics.vehiclesAtrasado.length} veículos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projeção */}
        <Card className="border-violet-500/30 bg-violet-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-violet-500">Projeção de Fechamento</p>
                <p className="text-xs text-muted-foreground">
                  Baseado no ritmo atual ({metrics.diasTrabalhados} dias trabalhados)
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-violet-500">{formatCurrency(metrics.projecao)}</p>
                <p className={`text-sm ${metrics.projecao >= metrics.metaMensal ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {((metrics.projecao / metrics.metaMensal) * 100).toFixed(1)}% da meta
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal de Veículos */}
        <Dialog open={vehicleModal !== null} onOpenChange={() => setVehicleModal(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Car className="w-5 h-5" />
                {modalData.title}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-2">
                {modalData.vehicles.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum veículo encontrado
                  </p>
                ) : (
                  modalData.vehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Car className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-mono font-bold">{vehicle.plate}</p>
                          <p className="text-xs text-muted-foreground">{vehicle.model}</p>
                          <p className="text-xs text-muted-foreground">{vehicle.clientName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{formatCurrency(vehicle.valorAprovado)}</p>
                        <Badge variant="outline" className="text-[10px]">
                          {vehicle.daysInYard} dias
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-bold">
                  {formatCurrency(modalData.vehicles.reduce((sum, v) => sum + v.valorAprovado, 0))}
                </span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}