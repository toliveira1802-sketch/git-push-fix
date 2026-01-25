import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  RefreshCw, Search, Clock, FileText, Package, CheckCircle, Wrench, Car, 
  AlertTriangle, TrendingUp, Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { differenceInDays } from "date-fns";

interface WorkflowEtapa {
  id: string;
  nome: string;
  ordem: number;
  cor: string;
  icone: string;
}

interface VehicleInWorkflow {
  id: string;
  plate: string;
  model: string;
  brand: string | null;
  status: string;
  mechanic_name: string | null;
  client_name: string | null;
  days_in_stage: number;
  appointment_id: string | null;
  final_price: number;
  created_at: string;
}

const etapaIcons: Record<string, React.ElementType> = {
  'search': Search,
  'file-text': FileText,
  'clock': Clock,
  'package': Package,
  'check-circle': CheckCircle,
  'wrench': Wrench,
  'car': Car,
};

export default function AdminOperacional() {
  const [etapas, setEtapas] = useState<WorkflowEtapa[]>([]);
  const [vehiclesByEtapa, setVehiclesByEtapa] = useState<Record<string, VehicleInWorkflow[]>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEtapa, setSelectedEtapa] = useState<WorkflowEtapa | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMechanic, setFilterMechanic] = useState<string>("all");
  const [mechanics, setMechanics] = useState<{ id: string; name: string }[]>([]);
  const [capacidade, setCapacidade] = useState({ atual: 0, maxima: 20 });
  const [showDelayedModal, setShowDelayedModal] = useState(false);

  const fetchData = async () => {
    try {
      // Fetch workflow etapas
      const { data: etapasData } = await supabase
        .from('workflow_etapas')
        .select('*')
        .eq('is_active', true)
        .order('ordem');

      if (etapasData) {
        setEtapas(etapasData);
      }

      // Fetch mechanics
      const { data: mechanicsData } = await supabase
        .from('mechanics')
        .select('id, name')
        .eq('is_active', true);

      if (mechanicsData) {
        setMechanics(mechanicsData);
      }

      // Map mock data for now - will connect to real appointments later
      const grouped: Record<string, VehicleInWorkflow[]> = {};
      let totalVehicles = 0;

      etapasData?.forEach(etapa => {
        grouped[etapa.id] = [];
      });

      setVehiclesByEtapa(grouped);
      setCapacidade(prev => ({ ...prev, atual: totalVehicles }));

      // Fetch config for max capacity
      const { data: config } = await supabase
        .from('system_config')
        .select('value')
        .eq('key', 'patio_capacidade')
        .maybeSingle();

      if (config?.value) {
        const configValue = config.value as { maxima?: number };
        setCapacidade(prev => ({ ...prev, maxima: configValue.maxima || 20 }));
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getCapacidadeStatus = () => {
    const percentage = (capacidade.atual / capacidade.maxima) * 100;
    if (percentage <= 75) return { color: 'bg-emerald-500', label: 'CAPACIDADE OK', textColor: 'text-emerald-500' };
    if (percentage <= 100) return { color: 'bg-amber-500', label: 'ATENÇÃO', textColor: 'text-amber-500' };
    return { color: 'bg-destructive', label: 'OFICINA CHEIA', textColor: 'text-destructive' };
  };

  const capacidadeStatus = getCapacidadeStatus();

  const getDelayedVehicles = () => {
    const delayed: VehicleInWorkflow[] = [];
    Object.values(vehiclesByEtapa).forEach(vehicles => {
      vehicles.forEach(v => {
        if (v.days_in_stage > 5) delayed.push(v);
      });
    });
    return delayed.sort((a, b) => b.days_in_stage - a.days_in_stage);
  };

  const getDaysBadgeColor = (days: number) => {
    if (days <= 2) return 'bg-emerald-500/20 text-emerald-500';
    if (days <= 5) return 'bg-amber-500/20 text-amber-500';
    return 'bg-destructive/20 text-destructive';
  };

  const filteredVehicles = (vehicles: VehicleInWorkflow[]) => {
    return vehicles.filter(v => {
      const matchesSearch = searchTerm === "" || 
        v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.client_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesMechanic = filterMechanic === "all" || v.mechanic_name === filterMechanic;
      
      return matchesSearch && matchesMechanic;
    });
  };

  const getMaxCountEtapa = () => {
    let maxCount = 0;
    let maxEtapaId = "";
    etapas.forEach(etapa => {
      const count = vehiclesByEtapa[etapa.id]?.length || 0;
      if (count > maxCount) {
        maxCount = count;
        maxEtapaId = etapa.id;
      }
    });
    return maxEtapaId;
  };

  const maxEtapaId = getMaxCountEtapa();

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
            <h1 className="text-2xl font-bold text-foreground">Dashboard Operacional</h1>
            <p className="text-muted-foreground">
              Visão em tempo real do fluxo da oficina
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDelayedModal(true)}
              className="gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Ver Atrasados ({getDelayedVehicles().length})
            </Button>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Capacity Alert */}
        <Card className="border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${capacidadeStatus.color} animate-pulse`} />
                <span className={`font-semibold ${capacidadeStatus.textColor}`}>
                  {capacidadeStatus.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-muted-foreground" />
                <span className="text-lg font-bold">
                  {capacidade.atual} / {capacidade.maxima}
                </span>
                <span className="text-muted-foreground">veículos</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por placa, modelo ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterMechanic} onValueChange={setFilterMechanic}>
            <SelectTrigger className="w-[200px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar mecânico" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os mecânicos</SelectItem>
              {mechanics.map(m => (
                <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Workflow Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {etapas.map((etapa) => {
            const IconComponent = etapaIcons[etapa.icone || 'clock'] || Clock;
            const vehicles = filteredVehicles(vehiclesByEtapa[etapa.id] || []);
            const isBottleneck = etapa.id === maxEtapaId && vehicles.length > 0;
            
            return (
              <Card
                key={etapa.id}
                className={`cursor-pointer hover:border-primary/50 transition-all ${
                  isBottleneck ? 'ring-2 ring-destructive border-destructive' : ''
                }`}
                onClick={() => setSelectedEtapa(etapa)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${etapa.cor}20` }}
                    >
                      <IconComponent 
                        className="w-4 h-4" 
                        style={{ color: etapa.cor }}
                      />
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" style={{ color: etapa.cor }}>
                    {vehicles.length}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {etapa.nome}
                  </p>
                  {isBottleneck && (
                    <Badge variant="destructive" className="mt-2 text-xs">
                      Gargalo
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tempo Médio Diagnóstico</p>
                  <p className="text-2xl font-bold">1.5 dias</p>
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tempo Médio Execução</p>
                  <p className="text-2xl font-bold">3.2 dias</p>
                </div>
                <Wrench className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Atrasados (&gt;5 dias)</p>
                  <p className="text-2xl font-bold text-destructive">
                    {getDelayedVehicles().length}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modal - Vehicles by Etapa */}
        <Dialog open={!!selectedEtapa} onOpenChange={() => setSelectedEtapa(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedEtapa && (
                  <>
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${selectedEtapa.cor}20` }}
                    >
                      {(() => {
                        const Icon = etapaIcons[selectedEtapa.icone || 'clock'] || Clock;
                        return <Icon className="w-4 h-4" style={{ color: selectedEtapa.cor }} />;
                      })()}
                    </div>
                    {selectedEtapa.nome}
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              {selectedEtapa && filteredVehicles(vehiclesByEtapa[selectedEtapa.id] || [])
                .sort((a, b) => b.days_in_stage - a.days_in_stage)
                .map((vehicle) => (
                  <Card key={vehicle.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-lg">{vehicle.plate}</p>
                        <p className="text-sm text-muted-foreground">
                          {vehicle.brand} {vehicle.model}
                        </p>
                        {vehicle.client_name && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Cliente: {vehicle.client_name}
                          </p>
                        )}
                        {vehicle.mechanic_name && (
                          <p className="text-xs text-muted-foreground">
                            Mecânico: {vehicle.mechanic_name}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge className={getDaysBadgeColor(vehicle.days_in_stage)}>
                          há {vehicle.days_in_stage} dias
                        </Badge>
                        {vehicle.final_price > 0 && (
                          <p className="text-sm font-medium mt-2">
                            R$ {vehicle.final_price.toLocaleString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              {selectedEtapa && filteredVehicles(vehiclesByEtapa[selectedEtapa.id] || []).length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum veículo nesta etapa
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal - Delayed Vehicles */}
        <Dialog open={showDelayedModal} onOpenChange={setShowDelayedModal}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Veículos Atrasados (&gt;5 dias)
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              {getDelayedVehicles().map((vehicle) => (
                <Card key={vehicle.id} className="p-4 border-destructive/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-lg">{vehicle.plate}</p>
                      <p className="text-sm text-muted-foreground">
                        {vehicle.brand} {vehicle.model}
                      </p>
                      {vehicle.client_name && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Cliente: {vehicle.client_name}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge className="bg-destructive/20 text-destructive">
                        há {vehicle.days_in_stage} dias
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-2">
                        Status: {vehicle.status}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
              {getDelayedVehicles().length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  🎉 Nenhum veículo atrasado!
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
