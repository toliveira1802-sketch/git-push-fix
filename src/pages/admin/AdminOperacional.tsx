import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Car, 
  ExternalLink,
  ChevronUp,
  ArrowRight,
  CalendarClock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/contexts/CompanyContext";
import { cn } from "@/lib/utils";
import { differenceInDays } from "date-fns";

interface StatusCounts {
  diagnostico: number;
  orcamento: number;
  aguardando_aprovacao: number;
  aguardando_peca: number;
  pronto_iniciar: number;
  em_execucao: number;
  pronto: number;
}

interface StageMetrics {
  stage: string;
  label: string;
  avgDays: number;
  count: number;
  isBottleneck: boolean;
}

interface DelayedVehicle {
  id: string;
  plate: string;
  model: string;
  daysDelayed: number;
}

export default function AdminOperacional() {
  const { currentCompany } = useCompany();
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    diagnostico: 0,
    orcamento: 0,
    aguardando_aprovacao: 0,
    aguardando_peca: 0,
    pronto_iniciar: 0,
    em_execucao: 0,
    pronto: 0,
  });
  const [capacidade, setCapacidade] = useState({ atual: 0, maxima: 20 });
  const [fluxoCount, setFluxoCount] = useState(0);
  const [retornoCount, setRetornoCount] = useState(0);
  const [terceiroCount, setTerceiroCount] = useState(0);
  const [agendadosHoje, setAgendadosHoje] = useState(0);
  const [delayedVehicles, setDelayedVehicles] = useState<DelayedVehicle[]>([]);
  const [stageMetrics, setStageMetrics] = useState<StageMetrics[]>([]);
  const [isStatusOpen, setIsStatusOpen] = useState(true);
  const [isDelayedOpen, setIsDelayedOpen] = useState(true);
  const [isMetricsOpen, setIsMetricsOpen] = useState(true);
  const [filterConsultor, setFilterConsultor] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch active service orders (excluding 'entregue')
      const { data: orders, error } = await supabase
        .from('ordens_servico')
        .select(`
          id,
          status,
          created_at,
          estimated_completion,
          em_terceiros,
          veiculos!inner(plate, model)
        `)
        .neq('status', 'entregue');

      if (error) throw error;

      // Count by status
      const counts: StatusCounts = {
        diagnostico: 0,
        orcamento: 0,
        aguardando_aprovacao: 0,
        aguardando_peca: 0,
        pronto_iniciar: 0,
        em_execucao: 0,
        pronto: 0,
      };

      let terceirosCount = 0;
      const delayed: DelayedVehicle[] = [];
      const stageData: Record<string, { totalDays: number; count: number }> = {};

      orders?.forEach((order: any) => {
        const status = order.status as keyof StatusCounts;
        if (counts[status] !== undefined) {
          counts[status]++;
        }

        if (order.em_terceiros) terceirosCount++;

        // Calculate days in yard
        const daysInYard = differenceInDays(new Date(), new Date(order.created_at));
        
        // Track stage metrics
        if (!stageData[order.status]) {
          stageData[order.status] = { totalDays: 0, count: 0 };
        }
        stageData[order.status].totalDays += daysInYard;
        stageData[order.status].count++;

        // Check if delayed (> 5 days and has estimated completion passed)
        if (order.estimated_completion) {
          const estimatedDate = new Date(order.estimated_completion);
          if (new Date() > estimatedDate) {
            const daysDelayed = differenceInDays(new Date(), estimatedDate);
            delayed.push({
              id: order.id,
              plate: order.veiculos?.plate || '',
              model: order.veiculos?.model || '',
              daysDelayed,
            });
          }
        } else if (daysInYard > 7) {
          delayed.push({
            id: order.id,
            plate: order.veiculos?.plate || '',
            model: order.veiculos?.model || '',
            daysDelayed: daysInYard,
          });
        }
      });

      setStatusCounts(counts);
      setTerceiroCount(terceirosCount);
      setDelayedVehicles(delayed.sort((a, b) => b.daysDelayed - a.daysDelayed));

      // Calculate total capacity
      const totalActive = Object.values(counts).reduce((sum, c) => sum + c, 0);
      setCapacidade(prev => ({ ...prev, atual: totalActive }));
      setFluxoCount(counts.em_execucao);

      // Fetch capacity config
      const { data: config } = await supabase
        .from('system_config')
        .select('value')
        .eq('key', 'patio_capacidade')
        .maybeSingle();

      if (config?.value) {
        const configValue = config.value as { maxima?: number };
        setCapacidade(prev => ({ ...prev, maxima: configValue.maxima || 20 }));
      }

      // Calculate stage metrics
      const stageLabels: Record<string, string> = {
        diagnostico: 'Diagnóstico',
        orcamento: 'Orçamentos',
        aguardando_aprovacao: 'Aguard. Aprovação',
        aguardando_peca: 'Aguard. Peças',
        pronto_iniciar: 'Pronto pra Iniciar',
        em_execucao: 'Em Execução',
        pronto: 'Prontos',
      };

      // Calculate overall average to find bottlenecks
      let totalAvg = 0;
      let stageCount = 0;
      Object.values(stageData).forEach(s => {
        if (s.count > 0) {
          totalAvg += s.totalDays / s.count;
          stageCount++;
        }
      });
      const overallAvg = stageCount > 0 ? totalAvg / stageCount : 0;

      const metrics: StageMetrics[] = Object.entries(stageLabels).map(([key, label]) => {
        const data = stageData[key] || { totalDays: 0, count: 0 };
        const avgDays = data.count > 0 ? data.totalDays / data.count : 0;
        return {
          stage: key,
          label,
          avgDays: Math.round(avgDays * 10) / 10,
          count: data.count,
          isBottleneck: avgDays > overallAvg && data.count > 0,
        };
      });

      setStageMetrics(metrics);

      // Fetch retorno alerts (45 days)
      const { data: alerts } = await supabase
        .from('gestao_alerts')
        .select('id')
        .eq('tipo', 'retorno_45_dias')
        .eq('lido', false);

      setRetornoCount(alerts?.length || 0);

      // Fetch today's appointments
      const today = new Date().toISOString().split('T')[0];
      const { data: appointments } = await supabase
        .from('agendamentos')
        .select('id')
        .eq('scheduled_date', today)
        .eq('status', 'agendado');

      setAgendadosHoje(appointments?.length || 0);

    } catch (error) {
      console.error('Error fetching operational data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCapacityStatus = () => {
    const percentage = (capacidade.atual / capacidade.maxima) * 100;
    if (percentage <= 50) return { ok: true, label: 'CAPACIDADE OK', color: 'text-emerald-500' };
    if (percentage <= 80) return { ok: true, label: 'ATENÇÃO', color: 'text-amber-500' };
    return { ok: false, label: 'OFICINA CHEIA', color: 'text-destructive' };
  };

  const capacityStatus = getCapacityStatus();

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
        {/* Header with Status Badges */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{currentCompany?.name || 'Oficina Doctor Auto'}</h1>
              <p className="text-slate-400 text-sm">Gestão de Pátio em Tempo Real</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Capacidade */}
              <div className={cn(
                "flex items-center gap-3 rounded-full px-5 py-2.5 border-2",
                capacityStatus.ok 
                  ? "bg-emerald-500/10 border-emerald-500/30" 
                  : "bg-destructive/10 border-destructive/30"
              )}>
                <CheckCircle className={cn("w-5 h-5", capacityStatus.ok ? "text-emerald-400" : "text-destructive")} />
                <div className="text-sm">
                  <span className={cn("font-bold", capacityStatus.ok ? "text-emerald-400" : "text-destructive")}>
                    {capacityStatus.label}
                  </span>
                  <p className="text-xs text-slate-400">
                    Capacidade: {capacidade.atual}/{capacidade.maxima} ({Math.round((capacidade.atual / capacidade.maxima) * 100)}%)
                  </p>
                  <p className="text-xs text-slate-500">Clique para ver placas</p>
                </div>
              </div>

              {/* Fluxo */}
              <div className="flex items-center gap-3 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full px-5 py-2.5">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <div className="text-sm">
                  <span className="font-bold text-emerald-400">FLUXO OK</span>
                  <p className="text-xs text-slate-400">🔧 Em Execução: {fluxoCount}</p>
                  <p className="text-xs text-slate-500">Clique para ver placas</p>
                </div>
              </div>

              {/* Retorno */}
              <div className={cn(
                "flex items-center gap-3 rounded-full px-5 py-2.5 border-2",
                retornoCount > 0 
                  ? "bg-destructive/10 border-destructive/30" 
                  : "bg-slate-700/50 border-slate-600"
              )}>
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold",
                  retornoCount > 0 ? "bg-destructive text-white" : "bg-slate-600 text-slate-300"
                )}>
                  {retornoCount}
                </div>
                <div className="text-sm">
                  <span className={cn("font-bold", retornoCount > 0 ? "text-destructive" : "text-slate-400")}>
                    RETORNO
                  </span>
                  <p className="text-xs text-slate-400">Na oficina</p>
                </div>
              </div>

              {/* Terceiros/Fora da Loja */}
              <div className={cn(
                "flex items-center gap-3 rounded-full px-5 py-2.5 border-2",
                terceiroCount > 0 
                  ? "bg-purple-500/10 border-purple-500/30" 
                  : "bg-slate-700/50 border-slate-600"
              )}>
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold",
                  terceiroCount > 0 ? "bg-purple-500 text-white" : "bg-slate-600 text-slate-300"
                )}>
                  {terceiroCount}
                </div>
                <div className="text-sm">
                  <span className={cn("font-bold", terceiroCount > 0 ? "text-purple-400" : "text-slate-400")}>
                    FORA DA LOJA
                  </span>
                  <p className="text-xs text-slate-400">Externos</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Pátio */}
        <Collapsible open={isStatusOpen} onOpenChange={setIsStatusOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">Status Pátio</CardTitle>
                    <Select value={filterConsultor} onValueChange={setFilterConsultor}>
                      <SelectTrigger className="w-[180px] h-8 bg-background" onClick={(e) => e.stopPropagation()}>
                        <SelectValue placeholder="Todos Consultores" />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        <SelectItem value="all">Todos Consultores</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <ChevronUp className={cn("w-5 h-5 transition-transform", !isStatusOpen && "rotate-180")} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Diagnóstico */}
                  <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800/50">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Diagnóstico</p>
                    <p className="text-3xl font-bold mt-1">{statusCounts.diagnostico}</p>
                    <p className="text-xs text-muted-foreground">em análise</p>
                  </div>

                  {/* Orçamentos Pendentes */}
                  <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                    <p className="text-xs font-medium text-amber-600">Orçamentos Pendentes</p>
                    <p className="text-3xl font-bold mt-1 text-amber-600">{statusCounts.orcamento}</p>
                    <p className="text-xs text-amber-600/70">aguardando consultor</p>
                  </div>

                  {/* Aguard. Aprovação */}
                  <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                    <p className="text-xs font-medium text-orange-600">Aguard. Aprovação</p>
                    <p className="text-3xl font-bold mt-1 text-orange-600">{statusCounts.aguardando_aprovacao}</p>
                    <p className="text-xs text-orange-600/70">pendente</p>
                  </div>

                  {/* Aguard. Peças */}
                  <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                    <p className="text-xs font-medium text-red-600">Aguard. Peças</p>
                    <p className="text-3xl font-bold mt-1 text-red-600">{statusCounts.aguardando_peca}</p>
                    <p className="text-xs text-red-600/70">esperando</p>
                  </div>

                  {/* Pronto pra Iniciar */}
                  <div className="p-4 rounded-lg bg-lime-50 dark:bg-lime-900/20">
                    <p className="text-xs font-medium text-lime-600">Pronto pra Iniciar</p>
                    <p className="text-3xl font-bold mt-1 text-lime-600">{statusCounts.pronto_iniciar}</p>
                    <p className="text-xs text-lime-600/70">aguardando</p>
                  </div>

                  {/* Em Execução */}
                  <div className="p-4 rounded-lg bg-cyan-50 dark:bg-cyan-900/20">
                    <p className="text-xs font-medium text-cyan-600">Em Execução</p>
                    <p className="text-3xl font-bold mt-1 text-cyan-600">{statusCounts.em_execucao}</p>
                    <p className="text-xs text-cyan-600/70">trabalhando</p>
                  </div>

                  {/* Prontos */}
                  <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                    <p className="text-xs font-medium text-emerald-600">Prontos</p>
                    <p className="text-3xl font-bold mt-1 text-emerald-600">{statusCounts.pronto}</p>
                    <p className="text-xs text-emerald-600/70">aguardando retirada</p>
                  </div>

                  {/* Agendados Hoje */}
                  <div className="p-4 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <p className="text-xs font-medium text-blue-600">Agendados Hoje</p>
                    <p className="text-3xl font-bold mt-1 text-blue-600">{agendadosHoje}</p>
                    <p className="text-xs text-blue-600/70">para entrar</p>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Veículos Atrasados */}
        <Collapsible open={isDelayedOpen} onOpenChange={setIsDelayedOpen}>
          <Card className="border-destructive/30">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    Veículos Atrasados
                  </CardTitle>
                  <ChevronUp className={cn("w-5 h-5 transition-transform", !isDelayedOpen && "rotate-180")} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Clock className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                      VEÍCULOS ATRASADOS
                    </p>
                    <p className="text-sm text-destructive">Previsão de entrega ultrapassada</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-destructive">{delayedVehicles.length}</p>
                    <p className="text-xs text-destructive">críticos</p>
                  </div>
                </div>

                {delayedVehicles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {delayedVehicles.slice(0, 5).map((v) => (
                      <div key={v.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-muted-foreground" />
                          <span className="font-mono font-medium">{v.plate}</span>
                          <span className="text-sm text-muted-foreground">{v.model}</span>
                        </div>
                        <Badge variant="destructive" className="text-xs">
                          {v.daysDelayed} dias
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Tempo Médio por Etapa */}
        <Collapsible open={isMetricsOpen} onOpenChange={setIsMetricsOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Tempo Médio de Permanência por Etapa
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Análise de gargalos operacionais</p>
                  </div>
                  <ChevronUp className={cn("w-5 h-5 transition-transform", !isMetricsOpen && "rotate-180")} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {stageMetrics.map((metric) => (
                    <div 
                      key={metric.stage}
                      className={cn(
                        "p-4 rounded-lg border relative",
                        metric.isBottleneck 
                          ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" 
                          : "bg-muted/30"
                      )}
                    >
                      {metric.isBottleneck && (
                        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive flex items-center justify-center">
                          <span className="text-white text-xs font-bold">!</span>
                        </div>
                      )}
                      <p className={cn(
                        "text-xs font-medium truncate",
                        metric.isBottleneck ? "text-red-600" : "text-muted-foreground"
                      )}>
                        {metric.label}
                      </p>
                      <p className={cn(
                        "text-2xl font-bold mt-1",
                        metric.isBottleneck ? "text-red-600" : ""
                      )}>
                        {metric.avgDays}
                      </p>
                      <p className={cn(
                        "text-xs",
                        metric.isBottleneck ? "text-red-600/70" : "text-muted-foreground"
                      )}>
                        dias médio
                      </p>
                      <p className={cn(
                        "text-xs mt-1",
                        metric.isBottleneck ? "text-red-600/70" : "text-muted-foreground"
                      )}>
                        ({metric.count} veículos)
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 rounded-lg bg-muted/50 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <p className="text-sm">
                    <span className="font-medium">Gargalos identificados:</span>{" "}
                    Etapas marcadas com <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-destructive text-white text-xs font-bold">!</span>{" "}
                    estão acima do tempo médio geral e requerem atenção.
                  </p>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>
    </AdminLayout>
  );
}