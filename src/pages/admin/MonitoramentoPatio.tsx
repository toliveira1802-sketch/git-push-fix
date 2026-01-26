import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Car,
  Calendar,
  RefreshCw,
  MapPin,
  ArrowLeft,
  LayoutGrid,
  Map,
  GripVertical,
  XCircle,
  AlertTriangle,
  DollarSign,
  Loader2,
  Search,
  ClipboardCheck
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { LayoutPatio, type Area as LayoutArea } from "@/components/patio/LayoutPatio";
import { usePatioKanban, type VeiculoKanban } from "@/hooks/usePatioKanban";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { KanbanCard } from "@/components/patio/KanbanCard";


// Layout da oficina - estrutura fixa (sem veículos mockados)
const layoutAreas: LayoutArea[] = [
  // Elevadores (coluna esquerda)
  { id: "elev-7", nome: "Elevador 7", tipo: "elevador", status: "livre", x: 0, y: 33, width: 3, height: 2 },
  { id: "elev-6", nome: "Elevador 6", tipo: "elevador", status: "livre", x: 0, y: 30, width: 3, height: 2 },
  { id: "elev-5", nome: "Elevador 5", tipo: "elevador", status: "livre", x: 0, y: 27, width: 3, height: 2 },
  { id: "elev-4", nome: "Elevador 4", tipo: "elevador", status: "livre", x: 0, y: 24, width: 3, height: 2 },
  { id: "elev-3", nome: "Elevador 3", tipo: "elevador", status: "manutencao", x: 0, y: 21, width: 3, height: 2 },
  { id: "elev-2", nome: "Elevador 2", tipo: "elevador", status: "livre", x: 0, y: 18, width: 3, height: 2 },
  { id: "elev-1", nome: "Elevador 1", tipo: "elevador", status: "livre", x: 0, y: 15, width: 3, height: 2 },
  { id: "box-ar", nome: "Box Ar-cond.", tipo: "box", status: "livre", x: 0, y: 10, width: 3, height: 4 },
  
  // Boxes (centro superior)
  { id: "box-d", nome: "Box D", tipo: "box", status: "livre", x: 5, y: 33, width: 4, height: 3 },
  { id: "box-e", nome: "Box E", tipo: "box", status: "livre", x: 10, y: 33, width: 4, height: 3 },
  
  // Boxes A, B, C (direita - mesmo tamanho de D e E)
  { id: "box-a", nome: "Box A", tipo: "box", status: "livre", x: 15, y: 29, width: 4, height: 3 },
  { id: "box-b", nome: "Box B", tipo: "box", status: "livre", x: 15, y: 22, width: 4, height: 3 },
  { id: "box-c", nome: "Box C", tipo: "box", status: "livre", x: 15, y: 19, width: 4, height: 3 },
  
  // Elevadores (direita superior)
  { id: "elev-8", nome: "Elevador 8", tipo: "elevador", status: "livre", x: 15, y: 33, width: 5, height: 3 },
  
  // Elevador Diagnóstico
  { id: "elev-diag", nome: "Elevador Diagnóstico", tipo: "elevador", status: "livre", x: 15, y: 25, width: 5, height: 3 },
  
  // REMAP e VCDS
  { id: "remap", nome: "REMAP/VCDS", tipo: "area", status: "livre", x: 8, y: 10, width: 4, height: 7 },
  
  // Dinamômetro
  { id: "dinamometro", nome: "Dinamômetro", tipo: "area", status: "livre", x: 13, y: 10, width: 5, height: 7 },
  
  // Rampa de Alinhamento
  { id: "rampa", nome: "Rampa Alinhamento", tipo: "area", status: "livre", x: 13, y: 0, width: 5, height: 9 },
  
  // Recepção (menor)
  { id: "loja", nome: "Recepção", tipo: "area", status: "livre", x: 0, y: 0, width: 7, height: 7 }
];

export default function MonitoramentoPatio() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'kanban' | 'mapa'>('kanban');
  const [showGrid, setShowGrid] = useState(true);
  const [areas] = useState<LayoutArea[]>(layoutAreas);
  
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { etapas: etapasWorkflow, loading, totalEntreguesMes, moverVeiculo, refetch } = usePatioKanban();
  const [draggedVeiculoKanban, setDraggedVeiculoKanban] = useState<{ veiculo: VeiculoKanban; fromEtapaId: string } | null>(null);
  const [dragOverEtapa, setDragOverEtapa] = useState<string | null>(null);
  const [filtroPlaca, setFiltroPlaca] = useState("");

  // Filtrar etapas por placa
  const etapasFiltradas = filtroPlaca.trim()
    ? etapasWorkflow.map(etapa => ({
        ...etapa,
        veiculos: etapa.veiculos.filter(v => 
          v.placa.toLowerCase().includes(filtroPlaca.toLowerCase())
        )
      }))
    : etapasWorkflow;

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      refetch();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);
  
  const veiculosEmAtendimento = areas.filter(a => a.veiculo);
  
  // Total de veículos no pátio = todos no workflow EXCETO os que estão "em terceiros" e "entregue"
  const todosVeiculos = etapasWorkflow.flatMap(e => e.veiculos);
  const veiculosNoPatio = todosVeiculos.filter(v => !v.emTerceiros);
  const totalVeiculosPatio = veiculosNoPatio.length;
  
  // Encontrar gargalo (etapa com mais veículos, exceto entregue)
  const etapasAtivas = etapasWorkflow.filter(e => e.id !== 'entregue');
  const gargalo = etapasAtivas.length > 0 
    ? etapasAtivas.reduce((max, etapa) => 
        etapa.veiculos.length > max.veiculos.length ? etapa : max
      , etapasAtivas[0])
    : { titulo: '-', veiculos: [] };
  
  const handleAreaClick = (area: LayoutArea) => {
    if (area.veiculo) {
      console.log("Área clicada:", area);
    }
  };

  // Handlers para drag and drop do Kanban
  const handleDragStart = (veiculo: VeiculoKanban, fromEtapaId: string) => {
    setDraggedVeiculoKanban({ veiculo, fromEtapaId });
  };

  const handleDragEnd = () => {
    setDraggedVeiculoKanban(null);
    setDragOverEtapa(null);
  };

  const handleDragOver = (e: React.DragEvent, etapaId: string) => {
    e.preventDefault();
    setDragOverEtapa(etapaId);
  };

  const handleDragLeave = () => {
    setDragOverEtapa(null);
  };

  const handleDrop = async (e: React.DragEvent, toEtapaId: string) => {
    e.preventDefault();
    if (!draggedVeiculoKanban) return;
    
    const { veiculo, fromEtapaId } = draggedVeiculoKanban;
    
    if (fromEtapaId === toEtapaId) {
      setDraggedVeiculoKanban(null);
      setDragOverEtapa(null);
      return;
    }
    
    // Mover veículo e persistir no banco
    await moverVeiculo(veiculo.id, fromEtapaId, toEtapaId);
    
    setDraggedVeiculoKanban(null);
    setDragOverEtapa(null);
  };

  // Componente Kanban com Drag and Drop
  const KanbanView = () => {
    return (
      <div className="space-y-3">
        {/* Filtro de placa */}
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por placa..."
            value={filtroPlaca}
            onChange={(e) => setFiltroPlaca(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-3 min-w-max">
            {etapasFiltradas.map((etapa) => (
              <Card 
                key={etapa.id} 
                className={`w-72 shrink-0 border transition-all ${etapa.color} ${
                  dragOverEtapa === etapa.id ? 'ring-2 ring-primary ring-offset-2' : ''
                }`}
                onDragOver={(e) => handleDragOver(e, etapa.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, etapa.id)}
              >
              <CardHeader className="pb-2 px-3 pt-3">
                <CardTitle className="text-xs flex items-center justify-between">
                  {etapa.titulo}
                  <Badge variant="secondary" className="text-[10px] px-1.5">{etapa.veiculos.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <ScrollArea className="h-[450px]">
                  <div className="space-y-2 pr-1">
                    {etapa.veiculos.length === 0 ? (
                      <div className="text-xs text-muted-foreground text-center py-6 border-2 border-dashed border-muted rounded-lg">
                        {dragOverEtapa === etapa.id ? 'Solte aqui' : 'Vazio'}
                      </div>
                    ) : (
                      etapa.veiculos.map((veiculo, idx) => (
                        <KanbanCard
                          key={veiculo.id + idx}
                          veiculo={veiculo}
                          isDragging={draggedVeiculoKanban?.veiculo.id === veiculo.id}
                          onDragStart={() => handleDragStart(veiculo, etapa.id)}
                          onDragEnd={handleDragEnd}
                          onUpdate={refetch}
                        />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ))}
          </div>
        </div>
      </div>
    );
  };

  // Veículos não alocados no mapa = veículos que não estão em "entregue" (ainda no pátio)
  const veiculosNaoAlocados = etapasWorkflow
    .filter(e => e.id !== 'entregue')
    .flatMap(e => e.veiculos);

  // Componente Mapa com lista lateral
  const MapaView = () => (
    <div className="flex gap-4 flex-col lg:flex-row">
      {/* Mapa original */}
      <div className="flex-1">
        <LayoutPatio
          areas={areas}
          onAreaClick={handleAreaClick}
          showGrid={showGrid}
        />
      </div>
      
      {/* Lista de veículos no pátio */}
      <div className="w-full lg:w-72">
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Car className="w-4 h-4" />
              Veículos no Pátio ({veiculosNaoAlocados.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] lg:h-[600px]">
              <div className="space-y-2 pr-2">
                {veiculosNaoAlocados.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum veículo no pátio
                  </p>
                ) : (
                  veiculosNaoAlocados.map((veiculo) => (
                    <div
                      key={veiculo.id}
                      className="p-3 rounded-lg border bg-card hover:border-primary hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-2">
                        <Car className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-mono font-bold text-sm">{veiculo.placa}</p>
                          <p className="text-xs text-muted-foreground truncate">{veiculo.modelo}</p>
                          <p className="text-xs text-muted-foreground truncate">{veiculo.cliente}</p>
                          <Badge variant="outline" className="text-[10px] mt-1">
                            {veiculo.servico}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <MapPin className="h-6 w-6 text-primary" />
                Pátio
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {viewMode === 'mapa' && (
              <div className="flex items-center gap-2">
                <Switch id="show-grid" checked={showGrid} onCheckedChange={setShowGrid} />
                <Label htmlFor="show-grid" className="text-sm">Grid</Label>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
              <Label htmlFor="auto-refresh" className="text-sm">Auto-refresh</Label>
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate('/admin/checklist')}>
              <ClipboardCheck className="h-4 w-4" />
              Checklist
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={refetch} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Carregando...' : 'Atualizar'}
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Indicadores */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Agendamentos do Dia */}
          <Card className="border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-500">3</p>
                  <p className="text-xs text-muted-foreground">Agendamentos do Dia</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Faturado no Mês (Entregues) */}
          <Card className="border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">
                    R$ {totalEntreguesMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground">Faturado (Mês)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cancelados */}
          <Card className="border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-500">0</p>
                  <p className="text-xs text-muted-foreground">Cancelados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gargalo */}
          <Card className="border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-lg font-bold text-orange-500">{gargalo.titulo}</p>
                  <p className="text-xs text-muted-foreground">Gargalo ({gargalo.veiculos.length})</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Total no pátio */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" />
            <span className="text-lg font-semibold">{totalVeiculosPatio} veículos no pátio</span>
          </div>
        </div>

        {/* Tabs de visualização */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'kanban' | 'mapa')}>
          <TabsList>
            <TabsTrigger value="kanban" className="gap-2">
              <LayoutGrid className="w-4 h-4" />
              Kanban
            </TabsTrigger>
            <TabsTrigger value="mapa" className="gap-2">
              <Map className="w-4 h-4" />
              Mapa
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="mapa" className="mt-4">
            <MapaView />
          </TabsContent>
          
          <TabsContent value="kanban" className="mt-4">
            <KanbanView />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
