import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Car, Plus, ArrowLeft, MoreVertical, Wrench, Loader2 } from "lucide-react";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { VeiculoPatioStatus, type PatioStatusInfo } from "@/components/veiculos/VeiculoPatioStatus";
import { OSResumoDialog, type OSResumoData, type OSItem } from "@/components/veiculos/OSResumoDialog";
import { useClientData, type ClientVehicle, type ClientServiceHistory } from "@/hooks/useClientData";

// Mapping from DB status to workflow stage
const statusToEtapa: Record<string, string> = {
  'orcamento': 'orcamento',
  'aguardando_aprovacao': 'aguardando_aprovacao',
  'aprovado': 'pronto_iniciar',
  'em_execucao': 'em_execucao',
  'em_teste': 'em_teste',
  'pronto': 'pronto_retirada',
  'pronto_retirada': 'pronto_retirada',
  'diagnostico': 'diagnostico',
  'aguardando_peca': 'aguardando_peca',
};

const Veiculos = () => {
  const navigate = useNavigate();
  const { vehicles, serviceHistory, loading, getActiveServiceOrder } = useClientData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [osResumoOpen, setOsResumoOpen] = useState(false);
  const [selectedOSResumo, setSelectedOSResumo] = useState<OSResumoData | null>(null);
  const [novoVeiculo, setNovoVeiculo] = useState({
    marca: "",
    modelo: "",
    ano: "",
    placa: "",
    cor: "",
  });

  // Build patio status from active service order
  const getPatioStatus = (vehicle: ClientVehicle): PatioStatusInfo | undefined => {
    const activeOrder = getActiveServiceOrder(vehicle.plate);
    if (!activeOrder) return undefined;

    const etapaId = statusToEtapa[activeOrder.order_status.toLowerCase()] || 'diagnostico';
    
    // Calculate approved value from items
    const valorAprovado = activeOrder.items
      .filter(item => item.status === 'aprovado')
      .reduce((sum, item) => sum + (item.total_price || 0), 0);

    return {
      etapaId,
      osNumero: activeOrder.order_number,
      servico: activeOrder.problem_description || 'Serviço em andamento',
      entrada: new Date(activeOrder.order_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      previsaoSaida: 'A definir',
      valorAprovado: valorAprovado > 0 ? valorAprovado : undefined,
    };
  };

  const handleVerOSResumo = (vehicle: ClientVehicle, activeOrder: ClientServiceHistory) => {
    const itensAprovados = activeOrder.items.filter(i => i.status === 'aprovado');
    const itensPendentes = activeOrder.items.filter(i => i.status === 'pendente' || i.status === 'orcamento');
    const itensRecusados = activeOrder.items.filter(i => i.status === 'recusado');
    
    const resumo: OSResumoData = {
      osNumero: activeOrder.order_number,
      veiculo: {
        placa: vehicle.plate,
        modelo: `${vehicle.brand} ${vehicle.model}`,
      },
      servico: activeOrder.problem_description || 'Serviço em andamento',
      entrada: new Date(activeOrder.order_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      previsaoSaida: 'A definir',
      itens: activeOrder.items.map(item => ({
        id: item.id,
        descricao: item.description,
        tipo: item.type as 'peca' | 'servico',
        valor: item.unit_price,
        quantidade: item.quantity || 1,
        status: (item.status === 'aprovado' ? 'aprovado' : 
                item.status === 'recusado' ? 'recusado' : 'pendente') as 'aprovado' | 'recusado' | 'pendente',
      })),
      totalAprovado: itensAprovados.reduce((sum, i) => sum + (i.total_price || 0), 0),
      totalPendente: itensPendentes.reduce((sum, i) => sum + (i.total_price || 0), 0),
      totalRecusado: itensRecusados.reduce((sum, i) => sum + (i.total_price || 0), 0),
    };
    
    setSelectedOSResumo(resumo);
    setOsResumoOpen(true);
  };

  const handleAddVeiculo = () => {
    if (!novoVeiculo.marca || !novoVeiculo.modelo || !novoVeiculo.placa) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    // For now just show a message - real implementation would call Supabase
    toast.info("Para cadastrar um veículo, entre em contato com a oficina.");
    setNovoVeiculo({ marca: "", modelo: "", ano: "", placa: "", cor: "" });
    setDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">Meus Veículos</h1>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[90%] rounded-xl">
            <DialogHeader>
              <DialogTitle>Adicionar Veículo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="marca">Marca *</Label>
                  <Select
                    value={novoVeiculo.marca}
                    onValueChange={(value) =>
                      setNovoVeiculo({ ...novoVeiculo, marca: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Honda">Honda</SelectItem>
                      <SelectItem value="Toyota">Toyota</SelectItem>
                      <SelectItem value="Volkswagen">Volkswagen</SelectItem>
                      <SelectItem value="Chevrolet">Chevrolet</SelectItem>
                      <SelectItem value="Ford">Ford</SelectItem>
                      <SelectItem value="Fiat">Fiat</SelectItem>
                      <SelectItem value="Hyundai">Hyundai</SelectItem>
                      <SelectItem value="Jeep">Jeep</SelectItem>
                      <SelectItem value="Nissan">Nissan</SelectItem>
                      <SelectItem value="Renault">Renault</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modelo">Modelo *</Label>
                  <Input
                    id="modelo"
                    placeholder="Ex: Civic"
                    value={novoVeiculo.modelo}
                    onChange={(e) =>
                      setNovoVeiculo({ ...novoVeiculo, modelo: e.target.value })
                    }
                    maxLength={50}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ano">Ano</Label>
                  <Input
                    id="ano"
                    placeholder="Ex: 2022"
                    value={novoVeiculo.ano}
                    onChange={(e) =>
                      setNovoVeiculo({ ...novoVeiculo, ano: e.target.value })
                    }
                    maxLength={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cor">Cor</Label>
                  <Select
                    value={novoVeiculo.cor}
                    onValueChange={(value) =>
                      setNovoVeiculo({ ...novoVeiculo, cor: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Preto">Preto</SelectItem>
                      <SelectItem value="Branco">Branco</SelectItem>
                      <SelectItem value="Prata">Prata</SelectItem>
                      <SelectItem value="Cinza">Cinza</SelectItem>
                      <SelectItem value="Vermelho">Vermelho</SelectItem>
                      <SelectItem value="Azul">Azul</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="placa">Placa *</Label>
                <Input
                  id="placa"
                  placeholder="Ex: ABC-1234"
                  value={novoVeiculo.placa}
                  onChange={(e) =>
                    setNovoVeiculo({ ...novoVeiculo, placa: e.target.value.toUpperCase() })
                  }
                  maxLength={8}
                />
              </div>
              <Button
                className="w-full bg-primary hover:bg-primary/90"
                onClick={handleAddVeiculo}
              >
                Adicionar Veículo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      {/* Main Content */}
      <main className="p-4 pb-24 max-w-2xl mx-auto space-y-4">
        {vehicles.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <Car className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Nenhum veículo cadastrado</h2>
            <p className="text-muted-foreground text-center mb-6">
              Seus veículos aparecerão aqui quando você realizar serviços na oficina.
            </p>
          </div>
        ) : (
          /* Vehicle Cards */
          vehicles.map((veiculo) => {
            const activeOrder = getActiveServiceOrder(veiculo.plate);
            const emServico = !!activeOrder;
            const patioStatus = getPatioStatus(veiculo);

            return (
              <Card 
                key={veiculo.id} 
                className={`relative overflow-hidden ${
                  emServico ? "border-primary/50" : ""
                }`}
              >
                {/* Status indicator */}
                {emServico && (
                  <div className="absolute top-0 right-0 w-3 h-3 bg-primary rounded-full m-3 animate-pulse" />
                )}
                
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                      emServico 
                        ? "bg-primary/20" 
                        : "bg-muted"
                    }`}>
                      <Car className={`w-7 h-7 ${
                        emServico ? "text-primary" : "text-muted-foreground"
                      }`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">
                          {veiculo.brand} {veiculo.model}
                        </h3>
                        {emServico && (
                          <Badge className="bg-primary text-primary-foreground text-xs">
                            <Wrench className="w-3 h-3 mr-1" />
                            Em serviço
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        {veiculo.year && <span>{veiculo.year}</span>}
                        {veiculo.color && <span>{veiculo.color}</span>}
                        <span className="font-mono">{veiculo.plate}</span>
                      </div>
                      
                      {/* Status do Pátio */}
                      {emServico && patioStatus && activeOrder && (
                        <VeiculoPatioStatus 
                          status={patioStatus} 
                          onVerOS={() => handleVerOSResumo(veiculo, activeOrder)}
                        />
                      )}
                    </div>
                    
                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </main>

      {/* Dialog de Resumo da OS */}
      <OSResumoDialog 
        open={osResumoOpen} 
        onOpenChange={setOsResumoOpen} 
        data={selectedOSResumo} 
      />

      <BottomNavigation />
    </div>
  );
};

export default Veiculos;
