import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DollarSign, TrendingUp, Car, Calendar, 
  Target, RefreshCw, Settings, AlertTriangle, Clock, CheckCircle2, LayoutDashboard
} from "lucide-react";
import { useFinanceiroDashboard, VehicleFinanceInfo } from "@/hooks/useFinanceiroDashboard";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type PeriodFilter = 'ultimos7' | 'ultimos30' | 'mes' | 'ano';
type ModalType = 'preso' | 'atrasado' | 'saidaHoje' | null;

export default function AdminFinanceiro() {
  const { metrics, metaConfig, loading, lastUpdate, refetch, saveMetaConfig } = useFinanceiroDashboard();
  const [period, setPeriod] = useState<PeriodFilter>('ultimos30');
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [showPainelMetas, setShowPainelMetas] = useState(false);
  const [vehicleModal, setVehicleModal] = useState<ModalType>(null);
  const [tempMeta, setTempMeta] = useState(metaConfig.metaMensal);
  const [tempDias, setTempDias] = useState(metaConfig.diasUteis);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const handleSaveMeta = async () => {
    const success = await saveMetaConfig(tempMeta, tempDias);
    if (success) {
      toast.success("Metas atualizadas!");
      setShowMetaModal(false);
    } else {
      toast.error("Erro ao salvar metas");
    }
  };

  const percentualPotencial = metrics.metaMensal > 0 
    ? ((metrics.realizado + metrics.aprovadoPatio) / metrics.metaMensal) * 100 
    : 0;

  const getVehicleList = (): { title: string; vehicles: VehicleFinanceInfo[]; color: string } => {
    switch (vehicleModal) {
      case 'preso':
        return { title: 'Veículos no Pátio (Preso)', vehicles: metrics.vehiclesPreso, color: 'amber' };
      case 'atrasado':
        return { title: 'Veículos Atrasados', vehicles: metrics.vehiclesAtrasado, color: 'red' };
      case 'saidaHoje':
        return { title: 'Saída Prevista Hoje', vehicles: metrics.vehiclesSaidaHoje, color: 'emerald' };
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
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💰</span>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard Financeiro</h1>
              <p className="text-sm text-muted-foreground">
                Última atualização: {format(lastUpdate, "dd/MM/yyyy, HH:mm:ss", { locale: ptBR })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ultimos7">Últimos 7 dias</SelectItem>
                <SelectItem value="ultimos30">Últimos 30 dias</SelectItem>
                <SelectItem value="mes">Este Mês</SelectItem>
                <SelectItem value="ano">Este Ano</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={refetch} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
            <Button variant="outline" onClick={() => {
              setTempMeta(metaConfig.metaMensal);
              setTempDias(metaConfig.diasUteis);
              setShowMetaModal(true);
            }} className="gap-2">
              <Settings className="w-4 h-4" />
              Configurar Metas
            </Button>
            <Button onClick={() => setShowPainelMetas(true)} className="gap-2 bg-primary">
              <LayoutDashboard className="w-4 h-4" />
              Abrir Painel de Metas
            </Button>
          </div>
        </div>

        {/* Meta Mensal Card */}
        <Card className="bg-card border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Meta Mensal</p>
                  <p className="text-sm text-muted-foreground">Acompanhamento do faturamento</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{metrics.percentualMeta.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">
                  da meta atingida
                </p>
                <p className="text-xs text-muted-foreground">
                  Se tudo aprovado sair: {percentualPotencial.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Progress Bar with segments */}
            <div className="relative h-8 bg-muted rounded-lg overflow-hidden mb-4">
              {/* Realizado */}
              <div 
                className="absolute h-full bg-amber-500 transition-all"
                style={{ width: `${Math.min(metrics.percentualMeta, 100)}%` }}
              />
              {/* Aprovado no pátio (potencial) */}
              <div 
                className="absolute h-full bg-muted-foreground/30 transition-all"
                style={{ 
                  left: `${Math.min(metrics.percentualMeta, 100)}%`,
                  width: `${Math.min(percentualPotencial - metrics.percentualMeta, 100 - metrics.percentualMeta)}%` 
                }}
              />
              {/* Labels on bar */}
              <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-medium text-white">
                <span>{formatCurrency(metrics.realizado)}</span>
                <span className="text-muted-foreground">{formatCurrency(metrics.aprovadoPatio)}</span>
              </div>
            </div>

            {/* Meta breakdown */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="text-center border-r border-border">
                <p className="text-xs text-amber-500 font-medium">Meta Mensal</p>
                <p className="text-lg font-bold">{formatCurrency(metrics.metaMensal)}</p>
                <p className="text-xs text-muted-foreground">Faltam {metrics.diasRestantes} dias de trabalho</p>
              </div>
              <div className="text-center border-r border-border">
                <p className="text-xs text-muted-foreground">Realizado</p>
                <p className="text-lg font-bold text-primary">{formatCurrency(metrics.realizado)}</p>
              </div>
              <div className="text-center border-r border-border">
                <p className="text-xs text-muted-foreground">Aprovado (Pátio)</p>
                <p className="text-lg font-bold">{formatCurrency(metrics.aprovadoPatio)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-amber-500 font-medium">Média/Dia p/ Atingir</p>
                <p className="text-lg font-bold text-amber-500">{formatCurrency(metrics.mediaDiaria)}</p>
              </div>
            </div>

            {/* Projeção */}
            <div className="mt-4 p-4 bg-violet-500/10 rounded-lg border border-violet-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-violet-500">Projeção de Fechamento</p>
                  <p className="text-xs text-muted-foreground">
                    Baseado no ritmo atual: {formatCurrency(metrics.realizado / Math.max(metrics.diasTrabalhados, 1))}/dia 
                    ({metrics.diasTrabalhados} dias trabalhados) × {metrics.diasRestantes} dias restantes
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-violet-500">{formatCurrency(metrics.projecao)}</p>
                  <p className={`text-sm ${metrics.projecao >= metrics.metaMensal ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {((metrics.projecao / metrics.metaMensal) * 100).toFixed(1)}% da meta
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Faturado */}
          <Card className="bg-card border hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-primary font-medium uppercase tracking-wide">FATURADO</p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(metrics.faturado)}</p>
                  <p className="text-xs text-muted-foreground">Total entregue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Médio */}
          <Card className="bg-card border hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-blue-500 font-medium uppercase tracking-wide">TICKET MÉDIO</p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(metrics.ticketMedio)}</p>
                  <p className="text-xs text-muted-foreground">Por veículo</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Saída Hoje */}
          <Card className="bg-card border hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-emerald-500 font-medium uppercase tracking-wide">SAÍDA HOJE</p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(metrics.saidaHoje)}</p>
                  <p className="text-xs text-muted-foreground">Previsão de entrega</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Atrasado */}
          <Card 
            className="bg-card border hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setVehicleModal('atrasado')}
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-destructive font-medium uppercase tracking-wide">ATRASADO</p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(metrics.atrasado)}</p>
                  <p className="text-xs text-muted-foreground">{metrics.vehiclesAtrasado.length} veículos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preso */}
          <Card 
            className="bg-card border hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setVehicleModal('preso')}
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-amber-500 font-medium uppercase tracking-wide">PRESO</p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(metrics.preso)}</p>
                  <p className="text-xs text-muted-foreground">{metrics.vehiclesPreso.length} veículos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preso já movido acima */}

          {/* Entregues */}
          <Card className="bg-card border hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-emerald-500 font-medium uppercase tracking-wide">ENTREGUES</p>
                  <p className="text-2xl font-bold mt-1">{metrics.entregues}</p>
                  <p className="text-xs text-muted-foreground">Veículos finalizados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Saída Hoje */}
          <Card 
            className="bg-card border hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setVehicleModal('saidaHoje')}
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-emerald-500 font-medium uppercase tracking-wide">SAÍDA HOJE</p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(metrics.saidaHoje)}</p>
                  <p className="text-xs text-muted-foreground">{metrics.vehiclesSaidaHoje.length} veículos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Meta Config Modal */}
        <Dialog open={showMetaModal} onOpenChange={setShowMetaModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurar Metas Mensais
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium">Meta Mensal (R$)</label>
                <Input
                  type="number"
                  value={tempMeta}
                  onChange={(e) => setTempMeta(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Dias Úteis no Mês</label>
                <Input
                  type="number"
                  value={tempDias}
                  onChange={(e) => setTempDias(parseInt(e.target.value) || 0)}
                />
              </div>
              <Button className="w-full" onClick={handleSaveMeta}>
                Salvar Metas
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Painel de Metas Modal */}
        <Dialog open={showPainelMetas} onOpenChange={setShowPainelMetas}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5" />
                Painel de Metas
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Meta</p>
                  <p className="text-xl font-bold">{formatCurrency(metrics.metaMensal)}</p>
                </div>
                <div className="p-4 bg-emerald-500/10 rounded-lg text-center">
                  <p className="text-sm text-emerald-500">Realizado</p>
                  <p className="text-xl font-bold text-emerald-500">{formatCurrency(metrics.realizado)}</p>
                </div>
                <div className="p-4 bg-violet-500/10 rounded-lg text-center">
                  <p className="text-sm text-violet-500">Projeção</p>
                  <p className="text-xl font-bold text-violet-500">{formatCurrency(metrics.projecao)}</p>
                </div>
                <div className="p-4 bg-amber-500/10 rounded-lg text-center">
                  <p className="text-sm text-amber-500">Faltam</p>
                  <p className="text-xl font-bold text-amber-500">{formatCurrency(Math.max(0, metrics.metaMensal - metrics.realizado))}</p>
                </div>
              </div>
              <Progress value={metrics.percentualMeta} className="h-4" />
              <p className="text-center text-sm text-muted-foreground">
                {metrics.percentualMeta.toFixed(1)}% da meta atingida
              </p>
            </div>
          </DialogContent>
        </Dialog>

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
