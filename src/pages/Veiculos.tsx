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

interface Veiculo {
  id: string;
  marca: string;
  modelo: string;
  ano: string;
  placa: string;
  cor: string;
  emServico: boolean;
}

const veiculosMock: Veiculo[] = [
  {
    id: "1",
    marca: "Honda",
    modelo: "Civic",
    ano: "2022",
    placa: "ABC-1234",
    cor: "Preto",
    emServico: true,
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
  const [novoVeiculo, setNovoVeiculo] = useState({
    marca: "",
    modelo: "",
    ano: "",
    placa: "",
    cor: "",
  });

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
            <Button size="sm" className="bg-red-600 hover:bg-red-700">
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
                className="w-full bg-red-600 hover:bg-red-700"
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
            <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mb-4">
              <Car className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Nenhum veículo cadastrado</h2>
            <p className="text-muted-foreground text-center mb-6">
              Adicione seu primeiro veículo para acompanhar serviços e manutenções.
            </p>
            <Button 
              className="bg-red-600 hover:bg-red-700"
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
                veiculo.emServico ? "border-red-500/50" : ""
              }`}
            >
              {/* Status indicator */}
              {veiculo.emServico && (
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full m-3 animate-pulse" />
              )}
              
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    veiculo.emServico 
                      ? "bg-red-600/20" 
                      : "bg-muted"
                  }`}>
                    <Car className={`w-7 h-7 ${
                      veiculo.emServico ? "text-red-500" : "text-muted-foreground"
                    }`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">
                        {veiculo.marca} {veiculo.modelo}
                      </h3>
                      {veiculo.emServico && (
                        <Badge className="bg-red-600 text-white text-xs">
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
                    
                    {veiculo.emServico && (
                      <div className="mt-3 p-2 bg-red-500/10 rounded-lg">
                        <p className="text-xs text-red-400">
                          🔧 Lavagem Completa • Previsão: Hoje às 16:00
                        </p>
                      </div>
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

      <BottomNavigation />
    </div>
  );
};

export default Veiculos;
