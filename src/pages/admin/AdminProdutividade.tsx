import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, TrendingUp } from "lucide-react";
import { useProdutividadeDashboard } from "@/hooks/useProdutividadeDashboard";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminProdutividade() {
  const [semana, setSemana] = useState(1);
  const [filtroMecanico, setFiltroMecanico] = useState("todos");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const { metrics, mechanics, loading, lastUpdate, refetch } = useProdutividadeDashboard(semana);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getProgressColor = (percentual: number) => {
    if (percentual >= 80) return 'bg-emerald-500';
    if (percentual >= 50) return 'bg-amber-500';
    return 'bg-destructive';
  };

  const filteredMechanics = mechanics.filter(m => {
    if (filtroMecanico !== "todos" && m.id !== filtroMecanico) return false;
    return true;
  });

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
            <h1 className="text-2xl font-bold text-foreground">Dashboard de Produtividade</h1>
            <p className="text-sm text-muted-foreground">
              Métricas individuais e por recurso
            </p>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">
              Última atualização: {format(lastUpdate, "HH:mm:ss", { locale: ptBR })}
            </p>
            <Button variant="outline" onClick={refetch} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Termômetro de Meta Mensal */}
        <Card className="bg-card border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="font-semibold text-primary">Termômetro de Meta Mensal</span>
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Progresso</span>
              <span className="text-lg font-bold">{metrics.percentualMeta.toFixed(1)}%</span>
            </div>

            <Progress value={Math.min(metrics.percentualMeta, 100)} className="h-4 mb-6" />

            <div className="grid grid-cols-4 gap-4">
              <div className="p-3 border rounded-lg">
                <p className="text-xs text-muted-foreground">Meta</p>
                <p className="text-lg font-bold">{formatCurrency(metrics.meta)}</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-xs text-muted-foreground">Realizado</p>
                <p className="text-lg font-bold text-primary">{formatCurrency(metrics.realizado)}</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-xs text-muted-foreground">Projeção</p>
                <p className="text-lg font-bold text-emerald-500">{formatCurrency(metrics.projecao)}</p>
                <p className="text-xs text-muted-foreground">{((metrics.projecao / metrics.meta) * 100).toFixed(1)}% da meta</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-xs text-muted-foreground">Faltam</p>
                <p className="text-lg font-bold text-destructive">{formatCurrency(metrics.faltam)}</p>
                <p className="text-xs text-muted-foreground">{metrics.diasRestantes} dias restantes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filtros */}
        <div className="flex flex-wrap gap-4">
          <Select value={filtroMecanico} onValueChange={setFiltroMecanico}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todos Mecânicos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos Mecânicos</SelectItem>
              {mechanics.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todas Categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas Categorias</SelectItem>
              <SelectItem value="mecanica">Mecânica</SelectItem>
              <SelectItem value="eletrica">Elétrica</SelectItem>
              <SelectItem value="funilaria">Funilaria</SelectItem>
            </SelectContent>
          </Select>

          <Tabs value={semana.toString()} onValueChange={(v) => setSemana(parseInt(v))}>
            <TabsList>
              <TabsTrigger value="1">Semana 1</TabsTrigger>
              <TabsTrigger value="2">Semana 2</TabsTrigger>
              <TabsTrigger value="3">Semana 3</TabsTrigger>
              <TabsTrigger value="4">Semana 4</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Ranking de Mecânicos */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            🏆 Ranking de Mecânicos
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMechanics.map((mechanic) => (
              <Card 
                key={mechanic.id} 
                className={`border-2 ${
                  mechanic.ranking === 1 ? 'border-amber-400' :
                  mechanic.ranking === 2 ? 'border-slate-400' :
                  mechanic.ranking === 3 ? 'border-amber-600' : 'border-border'
                }`}
              >
                <CardContent className="pt-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{mechanic.emoji}</span>
                      <span className="font-semibold">{mechanic.name.split(' ')[0]}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">#{mechanic.ranking}</span>
                  </div>

                  {/* Métricas */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">$ Valor Produzido</span>
                      <span className="font-bold text-primary">{formatCurrency(mechanic.valorProduzido)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">🚗 Carros Atendidos</span>
                      <span className="font-bold">{mechanic.carrosAtendidos}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">$ Ticket Médio</span>
                      <span className="font-bold">{formatCurrency(mechanic.ticketMedio)}</span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Meta Mensal</span>
                      <span className="font-medium">{mechanic.percentualMeta.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${getProgressColor(mechanic.percentualMeta)}`}
                        style={{ width: `${Math.min(mechanic.percentualMeta, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                      <span>{formatCurrency(mechanic.valorProduzido)}</span>
                      <span>Meta: {formatCurrency(mechanic.metaMensal)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
