import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Car, Plus, ArrowLeft, MoreVertical, Wrench } from "lucide-react";
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

interface Veiculo {
  id: string;
  marca: string;
  modelo: string;
  ano: string;
  placa: string;
  cor: string;
  emServico: boolean;
  patioStatus?: PatioStatusInfo;
}

// Mock data com status do pátio
const veiculosMock: Veiculo[] = [
  {
    id: "1",
    marca: "Honda",
    modelo: "Civic",
    ano: "2022",
    placa: "ABC-1234",
    cor: "Preto",
    emServico: true,
    patioStatus: {
      etapaId: "em_execucao",
      local: "Elevador 5",
      osNumero: "2025-00042",
      servico: "Revisão Completa + Troca de Óleo",
      entrada: "09:15",
      previsaoSaida: "16:00",
      valorAprovado: 1250.00,
    },
  },
  {
    id: "2",
    marca: "Toyota",
    modelo: "Corolla",
    ano: "2021",
    placa: "XYZ-5678",
    cor: "Branco",
    emServico: false,
  },
];

const Veiculos = () => {
  const navigate = useNavigate();
  const [veiculos, setVeiculos] = useState<Veiculo[]>(veiculosMock);
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

  // Mock dados da OS para o resumo
  const mockOSItens: OSItem[] = [
    { id: "1", descricao: "Óleo Motor 5W30 Sintético", tipo: "peca", valor: 89.90, quantidade: 4, status: "aprovado" },
    { id: "2", descricao: "Filtro de Óleo", tipo: "peca", valor: 45.00, quantidade: 1, status: "aprovado" },
    { id: "3", descricao: "Filtro de Ar", tipo: "peca", valor: 65.00, quantidade: 1, status: "aprovado" },
    { id: "4", descricao: "Mão de Obra - Revisão", tipo: "servico", valor: 350.00, quantidade: 1, status: "aprovado" },
    { id: "5", descricao: "Pastilhas de Freio Dianteiras", tipo: "peca", valor: 189.00, quantidade: 1, status: "pendente" },
    { id: "6", descricao: "Alinhamento e Balanceamento", tipo: "servico", valor: 120.00, quantidade: 1, status: "recusado" },
  ];

  const handleVerOSResumo = (veiculo: Veiculo) => {
    if (!veiculo.patioStatus) return;
    
    const itensAprovados = mockOSItens.filter(i => i.status === "aprovado");
    const itensPendentes = mockOSItens.filter(i => i.status === "pendente");
    const itensRecusados = mockOSItens.filter(i => i.status === "recusado");
    
    const resumo: OSResumoData = {
      osNumero: veiculo.patioStatus.osNumero,
      veiculo: {
        placa: veiculo.placa,
        modelo: `${veiculo.marca} ${veiculo.modelo}`,
      },
      servico: veiculo.patioStatus.servico,
      entrada: veiculo.patioStatus.entrada,
      previsaoSaida: veiculo.patioStatus.previsaoSaida,
      itens: mockOSItens,
      totalAprovado: itensAprovados.reduce((sum, i) => sum + (i.valor * i.quantidade), 0),
      totalPendente: itensPendentes.reduce((sum, i) => sum + (i.valor * i.quantidade), 0),
      totalRecusado: itensRecusados.reduce((sum, i) => sum + (i.valor * i.quantidade), 0),
    };
    
    setSelectedOSResumo(resumo);
    setOsResumoOpen(true);
  };

  const handleAddVeiculo = () => {
    if (!novoVeiculo.marca || !novoVeiculo.modelo || !novoVeiculo.placa) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const veiculo: Veiculo = {
      id: Date.now().toString(),
      ...novoVeiculo,
      emServico: false,
    };

    setVeiculos([...veiculos, veiculo]);
    setNovoVeiculo({ marca: "", modelo: "", ano: "", placa: "", cor: "" });
    setDialogOpen(false);
    toast.success("Veículo adicionado com sucesso!");
  };

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
        {veiculos.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <Car className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Nenhum veículo cadastrado</h2>
            <p className="text-muted-foreground text-center mb-6">
              Adicione seu primeiro veículo para acompanhar serviços e manutenções.
            </p>
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Veículo
            </Button>
          </div>
        ) : (
          /* Vehicle Cards */
          veiculos.map((veiculo) => (
            <Card 
              key={veiculo.id} 
              className={`relative overflow-hidden ${
                veiculo.emServico ? "border-primary/50" : ""
              }`}
            >
              {/* Status indicator */}
              {veiculo.emServico && (
                <div className="absolute top-0 right-0 w-3 h-3 bg-primary rounded-full m-3 animate-pulse" />
              )}
              
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    veiculo.emServico 
                      ? "bg-primary/20" 
                      : "bg-muted"
                  }`}>
                    <Car className={`w-7 h-7 ${
                      veiculo.emServico ? "text-primary" : "text-muted-foreground"
                    }`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">
                        {veiculo.marca} {veiculo.modelo}
                      </h3>
                      {veiculo.emServico && (
                        <Badge className="bg-primary text-primary-foreground text-xs">
                          <Wrench className="w-3 h-3 mr-1" />
                          Em serviço
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span>{veiculo.ano}</span>
                      <span>{veiculo.cor}</span>
                      <span className="font-mono">{veiculo.placa}</span>
                    </div>
                    
                    {/* Status do Pátio - Novo componente */}
                    {veiculo.emServico && veiculo.patioStatus && (
                      <VeiculoPatioStatus 
                        status={veiculo.patioStatus} 
                        onVerOS={() => handleVerOSResumo(veiculo)}
                      />
                    )}
                  </div>
                  
                  <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
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
