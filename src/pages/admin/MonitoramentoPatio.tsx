import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Car,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart3,
  RefreshCw,
  Wrench,
  MapPin,
  User,
  ArrowLeft
} from "lucide-react";
import { LayoutPatio, type Area } from "@/components/patio/LayoutPatio";

export default function MonitoramentoPatio() {
  const navigate = useNavigate();
  
  // Estado das áreas (baseado no layout real da oficina)
  const [areas, setAreas] = useState<Area[]>([
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
  const [showGrid, setShowGrid] = useState(true);
  
  // Auto-refresh a cada 30 segundos
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      console.log("Atualizando dados do pátio...");
      // Aqui faria fetch da API real
    }, 30000);
    
    return () => clearInterval(interval);
  }, [autoRefresh]);
  
  // Estatísticas
  const stats = {
    total: areas.length,
    livres: areas.filter(a => a.status === "livre").length,
    ocupados: areas.filter(a => a.status === "ocupado").length,
    manutencao: areas.filter(a => a.status === "manutencao").length,
    reservados: areas.filter(a => a.status === "reservado").length,
    taxaOcupacao: ((areas.filter(a => a.status === "ocupado").length / areas.length) * 100).toFixed(0)
  };
  
  const veiculosEmAtendimento = areas.filter(a => a.veiculo);
  
  const handleAreaClick = (area: Area) => {
    if (area.veiculo) {
      // Poderia navegar para detalhes da OS
      console.log("Área clicada:", area);
    }
  };
  
  const handleRefresh = () => {
    console.log("Atualizando manualmente...");
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <Badge variant="outline" className="text-xs font-mono">
                  MONITORAMENTO ATIVO
                </Badge>
              </div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <MapPin className="h-6 w-6 text-primary" />
                Monitoramento de Pátio
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="auto-refresh"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
              <Label htmlFor="auto-refresh" className="text-sm">Auto-refresh</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="show-grid"
                checked={showGrid}
                onCheckedChange={setShowGrid}
              />
              <Label htmlFor="show-grid" className="text-sm">Mostrar grid</Label>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">TOTAL</span>
              </div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-muted-foreground">LIVRES</span>
              </div>
              <div className="text-2xl font-bold text-emerald-600">{stats.livres}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <Car className="w-4 h-4 text-red-500" />
                <span className="text-xs text-muted-foreground">OCUPADOS</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{stats.ocupados}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <Wrench className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-muted-foreground">MANUTENÇÃO</span>
              </div>
              <div className="text-2xl font-bold text-amber-600">{stats.manutencao}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">RESERVADOS</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{stats.reservados}</div>
            </CardContent>
          </Card>
        </div>

        {/* Taxa de Ocupação */}
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Taxa de Ocupação:</span>
            <Badge 
              variant="outline"
              className={
                parseInt(stats.taxaOcupacao) > 80 
                  ? "border-red-500 text-red-600" 
                  : parseInt(stats.taxaOcupacao) > 50 
                    ? "border-amber-500 text-amber-600" 
                    : "border-emerald-500 text-emerald-600"
              }
            >
              {stats.taxaOcupacao}%
            </Badge>
          </div>
        </div>

        {/* Layout Interativo */}
        <LayoutPatio
          areas={areas}
          onAreaClick={handleAreaClick}
          showGrid={showGrid}
        />

        {/* Veículos em Atendimento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              Veículos em Atendimento ({veiculosEmAtendimento.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {veiculosEmAtendimento.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhum veículo em atendimento no momento
              </p>
            ) : (
              <div className="space-y-3">
                {veiculosEmAtendimento.map((area) => (
                  <div
                    key={area.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border hover:border-primary transition-colors cursor-pointer"
                    onClick={() => handleAreaClick(area)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
                        <Car className="w-6 h-6 text-red-500" />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold font-mono">{area.veiculo?.placa}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">{area.veiculo?.modelo}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {area.nome}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {area.veiculo?.cliente}
                          </span>
                          <span className="flex items-center gap-1">
                            <Wrench className="w-3 h-3" />
                            {area.veiculo?.servico}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Entrada</div>
                        <div className="text-sm font-medium">{area.veiculo?.entrada}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Previsão</div>
                        <div className="text-sm font-bold text-primary">{area.veiculo?.previsaoSaida}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
