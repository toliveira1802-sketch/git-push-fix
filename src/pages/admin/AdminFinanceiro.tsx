import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, TrendingUp, TrendingDown, Car, Calendar, 
  Target, RefreshCw, Settings, AlertTriangle, Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear } from "date-fns";

interface FinanceMetrics {
  faturado: number;
  ticketMedio: number;
  saidaHoje: number;
  atrasado: number;
  preso: number;
  entregues: number;
}

interface MetaConfig {
  metaMensal: number;
  diasUteis: number;
  diasTrabalhados: number;
}

type PeriodFilter = 'hoje' | 'semana' | 'mes' | 'ano';

export default function AdminFinanceiro() {
  const [metrics, setMetrics] = useState<FinanceMetrics>({
    faturado: 0,
    ticketMedio: 0,
    saidaHoje: 0,
    atrasado: 0,
    preso: 0,
    entregues: 0,
  });
  const [period, setPeriod] = useState<PeriodFilter>('mes');
  const [loading, setLoading] = useState(true);
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [metaConfig, setMetaConfig] = useState<MetaConfig>({
    metaMensal: 100000,
    diasUteis: 22,
    diasTrabalhados: 10,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      let startDate: Date;
      let endDate: Date = today;

      switch (period) {
        case 'hoje':
          startDate = today;
          break;
        case 'semana':
          startDate = startOfWeek(today, { weekStartsOn: 1 });
          endDate = endOfWeek(today, { weekStartsOn: 1 });
          break;
        case 'mes':
          startDate = startOfMonth(today);
          endDate = endOfMonth(today);
          break;
        case 'ano':
          startDate = startOfYear(today);
          break;
        default:
          startDate = startOfMonth(today);
      }

      // For now, using mock data as we don't have faturamento table yet
      // This will be connected to real data later
      setMetrics({
        faturado: 75000,
        ticketMedio: 1250,
        saidaHoje: 8500,
        atrasado: 12000,
        preso: 45000,
        entregues: 60,
      });

      // Fetch meta config
      const { data: configData } = await supabase
        .from('system_config')
        .select('value')
        .eq('key', 'meta_mensal')
        .maybeSingle();

      if (configData?.value) {
        const val = configData.value as { valor?: number; dias_uteis?: number };
        setMetaConfig(prev => ({
          ...prev,
          metaMensal: val.valor || 100000,
          diasUteis: val.dias_uteis || 22,
        }));
      }

    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast.error("Erro ao carregar dados financeiros");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  const handleSaveMeta = async () => {
    try {
      const { error } = await supabase
        .from('system_config')
        .upsert({
          key: 'meta_mensal',
          value: {
            valor: metaConfig.metaMensal,
            dias_uteis: metaConfig.diasUteis,
          },
        });

      if (error) throw error;

      toast.success("Metas atualizadas!");
      setShowMetaModal(false);
    } catch (error) {
      console.error('Error saving meta:', error);
      toast.error("Erro ao salvar metas");
    }
  };

  const metaDiaria = metaConfig.diasUteis > 0 
    ? metaConfig.metaMensal / metaConfig.diasUteis 
    : 0;
  
  const projecaoMensal = metaConfig.diasTrabalhados > 0 
    ? (metrics.faturado / metaConfig.diasTrabalhados) * metaConfig.diasUteis 
    : 0;

  const percentualMeta = metaConfig.metaMensal > 0 
    ? (metrics.faturado / metaConfig.metaMensal) * 100 
    : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

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
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard Financeiro</h1>
            <p className="text-muted-foreground">
              Métricas e indicadores financeiros
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
              <SelectTrigger className="w-[150px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="semana">Esta Semana</SelectItem>
                <SelectItem value="mes">Este Mês</SelectItem>
                <SelectItem value="ano">Este Ano</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setShowMetaModal(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Metas
            </Button>
            <Button variant="outline" onClick={fetchData}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Meta Progress */}
        {period === 'mes' && (
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Meta Mensal</p>
                  <p className="text-2xl font-bold">{formatCurrency(metaConfig.metaMensal)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Projeção</p>
                  <p className={`text-2xl font-bold ${projecaoMensal >= metaConfig.metaMensal ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {formatCurrency(projecaoMensal)}
                  </p>
                </div>
              </div>
              <Progress value={Math.min(percentualMeta, 100)} className="h-3" />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>{percentualMeta.toFixed(1)}% atingido</span>
                <span>{metaConfig.diasTrabalhados} de {metaConfig.diasUteis} dias</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="cursor-pointer hover:border-emerald-500/50 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                FATURADO
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-emerald-500">
                {formatCurrency(metrics.faturado)}
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary/50 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                TICKET MÉDIO
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(metrics.ticketMedio)}
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-amber-500/50 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                SAÍDA HOJE
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-amber-500">
                {formatCurrency(metrics.saidaHoje)}
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-destructive/50 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <AlertTriangle className="w-4 h-4" />
                ATRASADO
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-destructive">
                {formatCurrency(metrics.atrasado)}
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-violet-500/50 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Car className="w-4 h-4" />
                PRESO
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-violet-500">
                {formatCurrency(metrics.preso)}
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-emerald-500/50 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Car className="w-4 h-4" />
                ENTREGUES
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{metrics.entregues}</p>
              <p className="text-xs text-muted-foreground">veículos</p>
            </CardContent>
          </Card>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Indicadores de Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Meta Diária</span>
                <span className="font-bold">{formatCurrency(metaDiaria)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Média Diária Atual</span>
                <span className={`font-bold ${
                  (metrics.faturado / metaConfig.diasTrabalhados) >= metaDiaria 
                    ? 'text-emerald-500' : 'text-amber-500'
                }`}>
                  {formatCurrency(metrics.faturado / Math.max(metaConfig.diasTrabalhados, 1))}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Falta para Meta</span>
                <span className={`font-bold ${
                  metrics.faturado >= metaConfig.metaMensal ? 'text-emerald-500' : 'text-destructive'
                }`}>
                  {metrics.faturado >= metaConfig.metaMensal 
                    ? '✓ Meta Atingida!' 
                    : formatCurrency(metaConfig.metaMensal - metrics.faturado)
                  }
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-destructive" />
                Alertas Financeiros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {metrics.atrasado > 0 && (
                <div className="flex items-center gap-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <div className="flex-1">
                    <p className="font-medium text-destructive">Valor em Atraso</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(metrics.atrasado)} parados
                    </p>
                  </div>
                </div>
              )}
              {projecaoMensal < metaConfig.metaMensal && period === 'mes' && (
                <div className="flex items-center gap-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <TrendingDown className="w-5 h-5 text-amber-500" />
                  <div className="flex-1">
                    <p className="font-medium text-amber-500">Projeção Abaixo da Meta</p>
                    <p className="text-sm text-muted-foreground">
                      Faltam {formatCurrency(metaConfig.metaMensal - projecaoMensal)}
                    </p>
                  </div>
                </div>
              )}
              {metrics.atrasado === 0 && projecaoMensal >= metaConfig.metaMensal && (
                <div className="flex items-center gap-3 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  <div className="flex-1">
                    <p className="font-medium text-emerald-500">Tudo em Ordem! 🎉</p>
                    <p className="text-sm text-muted-foreground">
                      Projeção acima da meta, sem atrasos
                    </p>
                  </div>
                </div>
              )}
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
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Meta Mensal (R$)</label>
                  <Input
                    type="number"
                    value={metaConfig.metaMensal}
                    onChange={(e) => setMetaConfig(prev => ({ 
                      ...prev, 
                      metaMensal: parseFloat(e.target.value) || 0 
                    }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Dias Úteis no Mês</label>
                  <Input
                    type="number"
                    value={metaConfig.diasUteis}
                    onChange={(e) => setMetaConfig(prev => ({ 
                      ...prev, 
                      diasUteis: parseInt(e.target.value) || 0 
                    }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Dias Trabalhados</label>
                  <Input
                    type="number"
                    value={metaConfig.diasTrabalhados}
                    onChange={(e) => setMetaConfig(prev => ({ 
                      ...prev, 
                      diasTrabalhados: parseInt(e.target.value) || 0 
                    }))}
                  />
                </div>
                <Button className="w-full" onClick={handleSaveMeta}>
                  Salvar Metas
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
