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
  CheckCircle,
  Clock,
  BarChart3,
  RefreshCw,
  Wrench,
  MapPin,
  User,
  ArrowLeft,
  LayoutGrid,
  Map,
  GripVertical
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Types
type StatusArea = "livre" | "ocupado" | "manutencao" | "reservado";

interface VeiculoInfo {
  id: string;
  placa: string;
  modelo: string;
  cliente: string;
  servico: string;
  entrada: string;
  previsaoSaida: string;
}

interface Area {
  id: string;
  nome: string;
  tipo: "elevador" | "box" | "rampa" | "area";
  status: StatusArea;
  x: number;
  y: number;
  width: number;
  height: number;
  veiculo?: VeiculoInfo;
}

// Mock veículos não alocados
const mockVeiculosNaoAlocados: VeiculoInfo[] = [
  { id: 'v1', placa: 'MNO-7890', modelo: 'Fiat Argo 2023', cliente: 'Roberto Lima', servico: 'Troca de pastilhas', entrada: '11:30', previsaoSaida: '14:00' },
  { id: 'v2', placa: 'PQR-1234', modelo: 'VW Polo 2022', cliente: 'Fernanda Costa', servico: 'Revisão 20.000km', entrada: '12:00', previsaoSaida: '17:00' },
  { id: 'v3', placa: 'STU-5678', modelo: 'Hyundai Creta 2024', cliente: 'Lucas Mendes', servico: 'Diagnóstico', entrada: '13:00', previsaoSaida: '15:00' },
];

const statusConfig: Record<StatusArea, { bg: string; border: string; text: string; icon: React.ElementType }> = {
  livre: { bg: "bg-emerald-500/20", border: "border-emerald-500/50", text: "text-emerald-600", icon: CheckCircle },
  ocupado: { bg: "bg-red-500/20", border: "border-red-500/50", text: "text-red-600", icon: Car },
  manutencao: { bg: "bg-amber-500/20", border: "border-amber-500/50", text: "text-amber-600", icon: Wrench },
  reservado: { bg: "bg-blue-500/20", border: "border-blue-500/50", text: "text-blue-600", icon: Clock },
};

export default function MonitoramentoPatio() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'kanban' | 'mapa'>('mapa');
  const [veiculosNaoAlocados, setVeiculosNaoAlocados] = useState<VeiculoInfo[]>(mockVeiculosNaoAlocados);
  const [draggedVeiculo, setDraggedVeiculo] = useState<VeiculoInfo | null>(null);
  
  const [areas, setAreas] = useState<Area[]>([
    // Linha superior - Elevadores 1-4
    { id: "elev-1", nome: "Elev. 1", tipo: "elevador", status: "livre", x: 0, y: 0, width: 2, height: 3 },
    { id: "elev-2", nome: "Elev. 2", tipo: "elevador", status: "ocupado", x: 2, y: 0, width: 2, height: 3,
      veiculo: { id: 'va', placa: "ABC-1234", modelo: "Gol 2020", cliente: "João Silva", servico: "Troca de óleo", entrada: "08:30", previsaoSaida: "10:00" }
    },
    { id: "elev-3", nome: "Elev. 3", tipo: "elevador", status: "ocupado", x: 4, y: 0, width: 2, height: 3,
      veiculo: { id: 'vb', placa: "XYZ-5678", modelo: "Civic 2019", cliente: "Maria Santos", servico: "Revisão completa", entrada: "09:15", previsaoSaida: "16:00" }
    },
    { id: "elev-4", nome: "Elev. 4", tipo: "elevador", status: "manutencao", x: 6, y: 0, width: 2, height: 3 },
    
    // Linha do meio - Elevadores 5-7 + Boxes
    { id: "elev-5", nome: "Elev. 5", tipo: "elevador", status: "livre", x: 0, y: 4, width: 2, height: 3 },
    { id: "elev-6", nome: "Elev. 6", tipo: "elevador", status: "ocupado", x: 2, y: 4, width: 2, height: 3,
      veiculo: { id: 'vc', placa: "DEF-9012", modelo: "Corolla 2021", cliente: "Pedro Costa", servico: "Alinhamento", entrada: "10:00", previsaoSaida: "11:30" }
    },
    { id: "elev-7", nome: "Elev. 7", tipo: "elevador", status: "livre", x: 4, y: 4, width: 2, height: 3 },
    { id: "box-a", nome: "Box A", tipo: "box", status: "reservado", x: 6, y: 4, width: 2, height: 3 },
    
    // Linha inferior - Rampa + Box Ar + Diagnóstico
    { id: "rampa", nome: "Rampa", tipo: "rampa", status: "ocupado", x: 0, y: 8, width: 3, height: 3,
      veiculo: { id: 'vd', placa: "GHI-3456", modelo: "HB20 2022", cliente: "Ana Lima", servico: "Alinhamento 3D", entrada: "07:00", previsaoSaida: "08:00" }
    },
    { id: "box-ar", nome: "Ar-cond.", tipo: "box", status: "livre", x: 3, y: 8, width: 2, height: 3 },
    { id: "diag", nome: "Diagnóstico", tipo: "area", status: "livre", x: 5, y: 8, width: 3, height: 3 },
  ]);
  
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      console.log("Atualizando dados do pátio...");
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);
  
  const stats = {
    total: areas.length,
    livres: areas.filter(a => a.status === "livre").length,
    ocupados: areas.filter(a => a.status === "ocupado").length,
    manutencao: areas.filter(a => a.status === "manutencao").length,
    reservados: areas.filter(a => a.status === "reservado").length,
  };
  
  const veiculosEmAtendimento = areas.filter(a => a.veiculo);
  
  const handleDragStart = (veiculo: VeiculoInfo) => {
    setDraggedVeiculo(veiculo);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDropOnArea = (area: Area) => {
    if (!draggedVeiculo || area.status !== 'livre') return;
    
    // Atualiza a área com o veículo
    setAreas(prev => prev.map(a => 
      a.id === area.id 
        ? { ...a, status: 'ocupado' as StatusArea, veiculo: draggedVeiculo }
        : a
    ));
    
    // Remove da lista de não alocados
    setVeiculosNaoAlocados(prev => prev.filter(v => v.id !== draggedVeiculo.id));
    setDraggedVeiculo(null);
  };
  
  const handleRemoveFromArea = (areaId: string) => {
    const area = areas.find(a => a.id === areaId);
    if (!area?.veiculo) return;
    
    // Devolve para não alocados
    setVeiculosNaoAlocados(prev => [...prev, area.veiculo!]);
    
    // Libera a área
    setAreas(prev => prev.map(a => 
      a.id === areaId 
        ? { ...a, status: 'livre' as StatusArea, veiculo: undefined }
        : a
    ));
  };

  // Componente do Mapa
  const MapaView = () => {
    const cellSize = 60;
    const gridCols = 8;
    const gridRows = 11;
    
    return (
      <div className="flex gap-4">
        {/* Mapa */}
        <div className="flex-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Map className="w-4 h-4" />
                Layout da Oficina
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TooltipProvider>
                <div 
                  className="relative bg-muted/30 rounded-lg border overflow-hidden"
                  style={{ width: gridCols * cellSize, height: gridRows * cellSize }}
                >
                  {/* Grid de fundo */}
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-10"
                    style={{
                      backgroundImage: `
                        linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                        linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
                      `,
                      backgroundSize: `${cellSize}px ${cellSize}px`,
                    }}
                  />
                  
                  {/* Áreas */}
                  {areas.map((area) => {
                    const config = statusConfig[area.status];
                    const Icon = config.icon;
                    const canDrop = area.status === 'livre' && draggedVeiculo;
                    
                    return (
                      <Tooltip key={area.id}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "absolute rounded-lg border-2 cursor-pointer transition-all duration-200",
                              "flex flex-col items-center justify-center gap-0.5 p-1",
                              "hover:scale-[1.02] hover:z-10 hover:shadow-lg",
                              config.bg, config.border,
                              canDrop && "ring-2 ring-primary ring-offset-2 animate-pulse"
                            )}
                            style={{
                              left: area.x * cellSize + 4,
                              top: area.y * cellSize + 4,
                              width: area.width * cellSize - 8,
                              height: area.height * cellSize - 8,
                            }}
                            onDragOver={handleDragOver}
                            onDrop={() => handleDropOnArea(area)}
                            onClick={() => area.veiculo && handleRemoveFromArea(area.id)}
                          >
                            <Icon className={cn("w-5 h-5", config.text)} />
                            <span className={cn("text-xs font-medium text-center leading-tight", config.text)}>
                              {area.nome}
                            </span>
                            {area.veiculo && (
                              <span className="text-[10px] font-mono font-bold bg-background/80 px-1 rounded">
                                {area.veiculo.placa}
                              </span>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <div className="space-y-1">
                            <p className="font-semibold">{area.nome}</p>
                            <p className="text-xs">Status: <span className={cn("capitalize", config.text)}>{area.status}</span></p>
                            {area.veiculo && (
                              <>
                                <hr className="my-1" />
                                <p className="text-xs font-bold">{area.veiculo.placa}</p>
                                <p className="text-xs">{area.veiculo.modelo}</p>
                                <p className="text-xs text-muted-foreground">{area.veiculo.cliente}</p>
                                <p className="text-xs text-muted-foreground">{area.veiculo.servico}</p>
                                <p className="text-xs text-primary">Clique para remover</p>
                              </>
                            )}
                            {area.status === 'livre' && (
                              <p className="text-xs text-emerald-600">Arraste um veículo aqui</p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </TooltipProvider>
              
              {/* Legenda */}
              <div className="flex items-center gap-4 mt-4 flex-wrap">
                {Object.entries(statusConfig).map(([status, config]) => (
                  <div key={status} className="flex items-center gap-1.5">
                    <div className={cn("w-3 h-3 rounded", config.bg, config.border, "border")} />
                    <span className="text-xs capitalize text-muted-foreground">{status}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Lista de veículos não alocados */}
        <div className="w-72">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Car className="w-4 h-4" />
                Aguardando Alocação ({veiculosNaoAlocados.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2 pr-2">
                  {veiculosNaoAlocados.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Todos os veículos alocados
                    </p>
                  ) : (
                    veiculosNaoAlocados.map((veiculo) => (
                      <div
                        key={veiculo.id}
                        draggable
                        onDragStart={() => handleDragStart(veiculo)}
                        className={cn(
                          "p-3 rounded-lg border bg-card cursor-grab active:cursor-grabbing",
                          "hover:border-primary hover:shadow-md transition-all",
                          draggedVeiculo?.id === veiculo.id && "opacity-50"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <GripVertical className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-mono font-bold text-sm">{veiculo.placa}</p>
                            <p className="text-xs text-muted-foreground truncate">{veiculo.modelo}</p>
                            <p className="text-xs text-muted-foreground truncate">{veiculo.cliente}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-[10px]">
                                {veiculo.entrada}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground truncate">
                                {veiculo.servico}
                              </span>
                            </div>
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
  };

  // Componente Kanban
  const KanbanView = () => {
    const colunas = [
      { id: 'aguardando', titulo: 'Aguardando', veiculos: veiculosNaoAlocados, color: 'bg-muted' },
      { id: 'em-atendimento', titulo: 'Em Atendimento', veiculos: veiculosEmAtendimento.map(a => a.veiculo!), color: 'bg-amber-500/10' },
      { id: 'finalizado', titulo: 'Finalizado', veiculos: [], color: 'bg-emerald-500/10' },
    ];
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {colunas.map((coluna) => (
          <Card key={coluna.id} className={coluna.color}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                {coluna.titulo}
                <Badge variant="secondary">{coluna.veiculos.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2 pr-2">
                  {coluna.veiculos.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Nenhum veículo
                    </p>
                  ) : (
                    coluna.veiculos.map((veiculo, idx) => (
                      <div
                        key={veiculo.id || idx}
                        className="p-3 rounded-lg border bg-card hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Car className="w-4 h-4 text-primary" />
                          <span className="font-mono font-bold">{veiculo.placa}</span>
                        </div>
                        <p className="text-sm">{veiculo.modelo}</p>
                        <p className="text-xs text-muted-foreground">{veiculo.cliente}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline" className="text-xs">
                            <Wrench className="w-3 h-3 mr-1" />
                            {veiculo.servico}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {veiculo.entrada} → {veiculo.previsaoSaida}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

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
            <div className="flex items-center gap-2">
              <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
              <Label htmlFor="auto-refresh" className="text-sm">Auto-refresh</Label>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Stats compacto */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{stats.total} posições</span>
          </div>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
            {stats.livres} livres
          </Badge>
          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">
            {stats.ocupados} ocupados
          </Badge>
          {stats.manutencao > 0 && (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
              {stats.manutencao} manutenção
            </Badge>
          )}
          {stats.reservados > 0 && (
            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
              {stats.reservados} reservados
            </Badge>
          )}
        </div>

        {/* Tabs de visualização */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'kanban' | 'mapa')}>
          <TabsList>
            <TabsTrigger value="mapa" className="gap-2">
              <Map className="w-4 h-4" />
              Mapa
            </TabsTrigger>
            <TabsTrigger value="kanban" className="gap-2">
              <LayoutGrid className="w-4 h-4" />
              Kanban
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
