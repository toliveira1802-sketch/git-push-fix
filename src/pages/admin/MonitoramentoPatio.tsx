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
  ArrowLeft,
  LayoutGrid,
  Map,
  GripVertical
} from "lucide-react";
import { LayoutPatio, type Area as LayoutArea } from "@/components/patio/LayoutPatio";

interface VeiculoNaoAlocado {
  id: string;
  placa: string;
  modelo: string;
  cliente: string;
  servico: string;
  entrada: string;
  previsaoSaida: string;
}

// Mock veículos não alocados
const mockVeiculosNaoAlocados: VeiculoNaoAlocado[] = [
  { id: 'v1', placa: 'MNO-7890', modelo: 'Fiat Argo 2023', cliente: 'Roberto Lima', servico: 'Troca de pastilhas', entrada: '11:30', previsaoSaida: '14:00' },
  { id: 'v2', placa: 'PQR-1234', modelo: 'VW Polo 2022', cliente: 'Fernanda Costa', servico: 'Revisão 20.000km', entrada: '12:00', previsaoSaida: '17:00' },
  { id: 'v3', placa: 'STU-5678', modelo: 'Hyundai Creta 2024', cliente: 'Lucas Mendes', servico: 'Diagnóstico', entrada: '13:00', previsaoSaida: '15:00' },
];

export default function MonitoramentoPatio() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'kanban' | 'mapa'>('mapa');
  const [veiculosNaoAlocados, setVeiculosNaoAlocados] = useState<VeiculoNaoAlocado[]>(mockVeiculosNaoAlocados);
  const [draggedVeiculo, setDraggedVeiculo] = useState<VeiculoNaoAlocado | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  
  // Estado das áreas (layout original da oficina)
  const [areas, setAreas] = useState<LayoutArea[]>([
    // Elevadores (coluna esquerda)
    { id: "elev-7", nome: "Elevador 7", tipo: "elevador", status: "livre", x: 0, y: 33, width: 3, height: 2 },
    { id: "elev-6", nome: "Elevador 6", tipo: "elevador", status: "ocupado", x: 0, y: 30, width: 3, height: 2,
      veiculo: { placa: "ABC-1234", modelo: "Gol 2020", cliente: "João Silva", servico: "Troca de óleo", entrada: "08:30", previsaoSaida: "10:00" }
    },
    { id: "elev-5", nome: "Elevador 5", tipo: "elevador", status: "ocupado", x: 0, y: 27, width: 3, height: 2,
      veiculo: { placa: "XYZ-5678", modelo: "Civic 2019", cliente: "Maria Santos", servico: "Revisão completa", entrada: "09:15", previsaoSaida: "16:00" }
    },
    { id: "elev-4", nome: "Elevador 4", tipo: "elevador", status: "livre", x: 0, y: 24, width: 3, height: 2 },
    { id: "elev-3", nome: "Elevador 3", tipo: "elevador", status: "manutencao", x: 0, y: 21, width: 3, height: 2 },
    { id: "elev-2", nome: "Elevador 2", tipo: "elevador", status: "livre", x: 0, y: 18, width: 3, height: 2 },
    { id: "elev-1", nome: "Elevador 1", tipo: "elevador", status: "livre", x: 0, y: 15, width: 3, height: 2 },
    { id: "box-ar", nome: "Box Ar-cond.", tipo: "box", status: "livre", x: 0, y: 10, width: 3, height: 4 },
    
    // Boxes (centro superior)
    { id: "box-d", nome: "Box D", tipo: "box", status: "livre", x: 5, y: 33, width: 4, height: 3 },
    { id: "box-e", nome: "Box E", tipo: "box", status: "reservado", x: 10, y: 33, width: 4, height: 3 },
    
    // Elevadores (direita superior)
    { id: "elev-8", nome: "Elevador 8", tipo: "elevador", status: "ocupado", x: 15, y: 33, width: 5, height: 3,
      veiculo: { placa: "DEF-9012", modelo: "Corolla 2021", cliente: "Pedro Costa", servico: "Alinhamento", entrada: "10:00", previsaoSaida: "11:30" }
    },
    
    // Elevador Diagnóstico
    { id: "elev-diag", nome: "Elevador Diagnóstico", tipo: "elevador", status: "livre", x: 15, y: 24, width: 5, height: 4 },
    
    // REMAP e VCDS
    { id: "remap", nome: "REMAP/VCDS", tipo: "area", status: "reservado", x: 11, y: 10, width: 4, height: 7 },
    
    // Dinamômetro
    { id: "dinamometro", nome: "Dinamômetro", tipo: "area", status: "livre", x: 15, y: 10, width: 5, height: 7 },
    
    // Rampa de Alinhamento
    { id: "rampa", nome: "Rampa Alinhamento", tipo: "area", status: "ocupado", x: 15, y: 0, width: 5, height: 9,
      veiculo: { placa: "GHI-3456", modelo: "HB20 2022", cliente: "Ana Lima", servico: "Alinhamento 3D", entrada: "07:00", previsaoSaida: "08:00" }
    },
    
    // Loja/Sala
    { id: "loja", nome: "Recepção", tipo: "area", status: "livre", x: 0, y: 0, width: 10, height: 9 }
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
  
  const handleAreaClick = (area: LayoutArea) => {
    if (area.veiculo) {
      console.log("Área clicada:", area);
    }
  };

  // Componente Kanban
  const KanbanView = () => {
    const veiculosAguardando = veiculosNaoAlocados.map(v => ({
      placa: v.placa,
      modelo: v.modelo,
      cliente: v.cliente,
      servico: v.servico,
      entrada: v.entrada,
      previsaoSaida: v.previsaoSaida,
    }));
    
    const veiculosAtendimento = veiculosEmAtendimento.map(a => a.veiculo!);
    
    const colunas = [
      { id: 'aguardando', titulo: 'Aguardando', veiculos: veiculosAguardando, color: 'bg-muted' },
      { id: 'em-atendimento', titulo: 'Em Atendimento', veiculos: veiculosAtendimento, color: 'bg-amber-500/10' },
      { id: 'finalizado', titulo: 'Finalizado', veiculos: [] as typeof veiculosAtendimento, color: 'bg-emerald-500/10' },
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
                        key={veiculo.placa + idx}
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
      
      {/* Lista de veículos não alocados */}
      <div className="w-full lg:w-72">
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Car className="w-4 h-4" />
              Aguardando Alocação ({veiculosNaoAlocados.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] lg:h-[600px]">
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
                      onDragStart={() => setDraggedVeiculo(veiculo)}
                      onDragEnd={() => setDraggedVeiculo(null)}
                      className="p-3 rounded-lg border bg-card cursor-grab active:cursor-grabbing hover:border-primary hover:shadow-md transition-all"
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
