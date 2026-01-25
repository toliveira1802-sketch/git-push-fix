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
  Wrench,
  MapPin,
  ArrowLeft,
  LayoutGrid,
  Map,
  GripVertical,
  CalendarClock,
  XCircle,
  AlertTriangle
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
    
    // Boxes A, B, C (direita - mesmo tamanho de D e E)
    { id: "box-a", nome: "Box A", tipo: "box", status: "livre", x: 15, y: 29, width: 4, height: 3 },
    { id: "box-b", nome: "Box B", tipo: "box", status: "livre", x: 15, y: 22, width: 4, height: 3 },
    { id: "box-c", nome: "Box C", tipo: "box", status: "livre", x: 15, y: 19, width: 4, height: 3 },
    
    // Elevadores (direita superior)
    { id: "elev-8", nome: "Elevador 8", tipo: "elevador", status: "ocupado", x: 15, y: 33, width: 5, height: 3,
      veiculo: { placa: "DEF-9012", modelo: "Corolla 2021", cliente: "Pedro Costa", servico: "Alinhamento", entrada: "10:00", previsaoSaida: "11:30" }
    },
    
    // Elevador Diagnóstico
    { id: "elev-diag", nome: "Elevador Diagnóstico", tipo: "elevador", status: "livre", x: 15, y: 25, width: 5, height: 3 },
    
    // REMAP e VCDS
    { id: "remap", nome: "REMAP/VCDS", tipo: "area", status: "reservado", x: 8, y: 10, width: 4, height: 7 },
    
    // Dinamômetro
    { id: "dinamometro", nome: "Dinamômetro", tipo: "area", status: "livre", x: 13, y: 10, width: 5, height: 7 },
    
    // Rampa de Alinhamento
    { id: "rampa", nome: "Rampa Alinhamento", tipo: "area", status: "ocupado", x: 13, y: 0, width: 5, height: 9,
      veiculo: { placa: "GHI-3456", modelo: "HB20 2022", cliente: "Ana Lima", servico: "Alinhamento 3D", entrada: "07:00", previsaoSaida: "08:00" }
    },
    
    // Recepção (menor)
    { id: "loja", nome: "Recepção", tipo: "area", status: "livre", x: 0, y: 0, width: 7, height: 7 }
  ]);
  
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      console.log("Atualizando dados do pátio...");
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);
  
  const veiculosEmAtendimento = areas.filter(a => a.veiculo);
  
  // Dados do workflow (mock) - veículos em cada etapa
  const etapasWorkflow = [
    { id: 'diagnostico', titulo: 'Diagnóstico', color: 'bg-purple-500/10 border-purple-500/30', veiculos: [
      { placa: 'ABC-1234', modelo: 'Gol 2020', cliente: 'João Silva', servico: 'Verificar barulho', entrada: '08:30', emTerceiros: false },
    ]},
    { id: 'orcamento', titulo: 'Orçamento', color: 'bg-blue-500/10 border-blue-500/30', veiculos: [
      { placa: 'XYZ-5678', modelo: 'Civic 2019', cliente: 'Maria Santos', servico: 'Revisão completa', entrada: '09:15', emTerceiros: false },
    ]},
    { id: 'aguardando-apv', titulo: 'Aguardando Aprovação', color: 'bg-amber-500/10 border-amber-500/30', veiculos: [
      { placa: 'DEF-9012', modelo: 'Corolla 2021', cliente: 'Pedro Costa', servico: 'Suspensão', entrada: '10:00', emTerceiros: false },
      { placa: 'MNO-7890', modelo: 'Fiat Argo', cliente: 'Roberto Lima', servico: 'Freios', entrada: '11:30', emTerceiros: false },
    ]},
    { id: 'aguardando-peca', titulo: 'Aguardando Peça', color: 'bg-orange-500/10 border-orange-500/30', veiculos: [
      { placa: 'GHI-3456', modelo: 'HB20 2022', cliente: 'Ana Lima', servico: 'Embreagem', entrada: '07:00', emTerceiros: true }, // Em terceiros
    ]},
    { id: 'execucao', titulo: 'Em Execução', color: 'bg-cyan-500/10 border-cyan-500/30', veiculos: [
      { placa: 'PQR-1234', modelo: 'VW Polo', cliente: 'Fernanda Costa', servico: 'Motor', entrada: '12:00', emTerceiros: false },
      { placa: 'STU-5678', modelo: 'Hyundai Creta', cliente: 'Lucas Mendes', servico: 'Injeção', entrada: '13:00', emTerceiros: false },
    ]},
    { id: 'teste', titulo: 'Em Teste', color: 'bg-indigo-500/10 border-indigo-500/30', veiculos: [] },
    { id: 'pronto', titulo: 'Pronto', color: 'bg-emerald-500/10 border-emerald-500/30', veiculos: [
      { placa: 'JKL-0000', modelo: 'Onix 2023', cliente: 'Carlos Oliveira', servico: 'Revisão', entrada: '06:00', emTerceiros: false },
    ]},
    { id: 'entregue', titulo: 'Entregue', color: 'bg-muted border-muted-foreground/20', veiculos: [] },
  ];
  
  // Total de veículos no pátio = todos no workflow EXCETO os que estão "em terceiros" e "entregue"
  const todosVeiculos = etapasWorkflow.flatMap(e => e.veiculos);
  const veiculosNoPatio = todosVeiculos.filter(v => !v.emTerceiros);
  const totalVeiculosPatio = veiculosNoPatio.length;
  
  // Encontrar gargalo (etapa com mais veículos, exceto entregue)
  const etapasAtivas = etapasWorkflow.filter(e => e.id !== 'entregue');
  const gargalo = etapasAtivas.reduce((max, etapa) => 
    etapa.veiculos.length > max.veiculos.length ? etapa : max
  , etapasAtivas[0]);
  
  const handleAreaClick = (area: LayoutArea) => {
    if (area.veiculo) {
      console.log("Área clicada:", area);
    }
  };

  // Componente Kanban
  const KanbanView = () => {
    return (
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-max">
          {etapasWorkflow.map((etapa) => (
            <Card key={etapa.id} className={`w-56 shrink-0 border ${etapa.color}`}>
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
                      <p className="text-xs text-muted-foreground text-center py-6">
                        Vazio
                      </p>
                    ) : (
                      etapa.veiculos.map((veiculo, idx) => (
                        <div
                          key={veiculo.placa + idx}
                          className="p-2 rounded-lg border bg-card hover:shadow-md transition-shadow cursor-pointer"
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <Car className="w-3 h-3 text-primary" />
                            <span className="font-mono font-bold text-xs">{veiculo.placa}</span>
                          </div>
                          <p className="text-xs truncate">{veiculo.modelo}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{veiculo.cliente}</p>
                          <Badge variant="outline" className="text-[10px] mt-1.5 w-full justify-center">
                            {veiculo.servico}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ))}
        </div>
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

          {/* Reagendados */}
          <Card className="border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <CalendarClock className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-500">1</p>
                  <p className="text-xs text-muted-foreground">Reagendados</p>
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
