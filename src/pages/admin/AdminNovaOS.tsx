import { useState } from "react";
import { useNavigate } from "@/hooks/useNavigate";
import { 
  UserPlus, Search, Car, User, Phone, ArrowLeft, ArrowRight, 
  Loader2, CheckCircle, Zap, Users
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type FlowType = "select" | "quick" | "existing";

interface ClienteEncontrado {
  id: string;
  name: string;
  phone: string;
  email?: string;
  vehicles: {
    id: string;
    brand: string;
    model: string;
    plate: string;
    year?: number;
    km?: number;
  }[];
}

export default function NovaOS() {
  const navigate = useNavigate();
  const [flowType, setFlowType] = useState<FlowType>("select");
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Cliente Rápido - dados do formulário
  const [quickForm, setQuickForm] = useState({
    name: "",
    phone: "",
    brand: "",
    model: "",
    plate: "",
  });

  // Cliente Existente - busca e seleção
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<ClienteEncontrado[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClienteEncontrado | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<ClienteEncontrado["vehicles"][0] | null>(null);

  // Buscar cliente por telefone ou placa
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error("Digite um telefone ou placa para buscar");
      return;
    }

    setIsSearching(true);
    setSearchResults([]);
    setSelectedClient(null);
    setSelectedVehicle(null);

    try {
      const searchClean = searchTerm.replace(/\D/g, ""); // Remove não-números para telefone
      const searchUpper = searchTerm.toUpperCase().replace(/[^A-Z0-9]/g, ""); // Limpa placa

      // Buscar por telefone
      const { data: clientsByPhone, error: phoneError } = await supabase
        .from("clientes")
        .select(`
          id, name, phone, email,
          veiculos (id, brand, model, plate, year, km)
        `)
        .ilike("phone", `%${searchClean}%`)
        .limit(10);

      if (phoneError) throw phoneError;

      // Buscar por placa
      const { data: vehiclesByPlate, error: plateError } = await supabase
        .from("veiculos")
        .select(`
          id, brand, model, plate, year, km,
          clientes:client_id (id, name, phone, email)
        `)
        .ilike("plate", `%${searchUpper}%`)
        .limit(10);

      if (plateError) throw plateError;

      // Combinar resultados
      const clientsMap = new Map<string, ClienteEncontrado>();

      // Adicionar clientes encontrados por telefone
        clientsByPhone?.forEach((client: any) => {
        clientsMap.set(client.id, {
          id: client.id,
          name: client.name,
          phone: client.phone,
          email: client.email,
          vehicles: client.veiculos || [],
        });
      });

      // Adicionar clientes encontrados por placa
      vehiclesByPlate?.forEach((vehicle: any) => {
        const client = vehicle.clientes;
        if (client) {
          if (clientsMap.has(client.id)) {
            // Cliente já existe, verificar se veículo já está na lista
            const existing = clientsMap.get(client.id)!;
            if (!existing.vehicles.find((v) => v.id === vehicle.id)) {
              existing.vehicles.push({
                id: vehicle.id,
                brand: vehicle.brand,
                model: vehicle.model,
                plate: vehicle.plate,
                year: vehicle.year,
                km: vehicle.km,
              });
            }
          } else {
            clientsMap.set(client.id, {
              id: client.id,
              name: client.name,
              phone: client.phone,
              email: client.email,
              vehicles: [{
                id: vehicle.id,
                brand: vehicle.brand,
                model: vehicle.model,
                plate: vehicle.plate,
                year: vehicle.year,
                km: vehicle.km,
              }],
            });
          }
        }
      });

      const results = Array.from(clientsMap.values());
      setSearchResults(results);

      if (results.length === 0) {
        toast.info("Nenhum cliente encontrado. Use 'Cliente Rápido' para cadastrar.");
      }
    } catch (error) {
      console.error("Erro na busca:", error);
      toast.error("Erro ao buscar cliente");
    } finally {
      setIsSearching(false);
    }
  };

  // Selecionar cliente e veículo
  const handleSelectClient = (client: ClienteEncontrado, vehicle?: ClienteEncontrado["vehicles"][0]) => {
    setSelectedClient(client);
    if (vehicle) {
      setSelectedVehicle(vehicle);
    } else if (client.vehicles.length === 1) {
      setSelectedVehicle(client.vehicles[0]);
    } else {
      setSelectedVehicle(null);
    }
  };

  // Criar OS - Cliente Rápido
  const handleCreateQuickOS = async () => {
    if (!quickForm.name.trim()) {
      toast.error("Nome do cliente é obrigatório");
      return;
    }
    if (!quickForm.plate.trim()) {
      toast.error("Placa do veículo é obrigatória");
      return;
    }
    if (!quickForm.model.trim()) {
      toast.error("Modelo do veículo é obrigatório");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Criar cliente
      const { data: newClient, error: clientError } = await supabase
        .from("clientes")
        .insert({
          name: quickForm.name.trim(),
          phone: quickForm.phone.trim() || "Não informado",
          status: "active",
        })
        .select("id")
        .single();

      if (clientError) throw clientError;

      // 2. Criar veículo
      const { data: newVehicle, error: vehicleError } = await supabase
        .from("veiculos")
        .insert({
          client_id: newClient.id,
          brand: quickForm.brand.trim() || "Não informado",
          model: quickForm.model.trim(),
          plate: quickForm.plate.toUpperCase().replace(/[^A-Z0-9]/g, ""),
          is_active: true,
        })
        .select("id")
        .single();

      if (vehicleError) throw vehicleError;

      // 3. Criar OS (order_number é gerado automaticamente pelo trigger)
      // order_number is auto-generated by database trigger
      const { data: newOS, error: osError } = await supabase
        .from("ordens_servico")
        .insert({
          client_id: newClient.id,
          vehicle_id: newVehicle.id,
          status: "diagnostico",
          order_number: "", // Will be overwritten by trigger
        } as any)
        .select("id, order_number")
        .single();

      if (osError) throw osError;

      toast.success(`OS ${newOS.order_number} criada com sucesso!`);
      
      // Redirecionar para detalhes da OS
      navigate(`/admin/os-ultimate/${newOS.id}`);

    } catch (error) {
      console.error("Erro ao criar OS:", error);
      toast.error("Erro ao criar OS. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Criar OS - Cliente Existente
  const handleCreateExistingOS = async () => {
    if (!selectedClient) {
      toast.error("Selecione um cliente");
      return;
    }
    if (!selectedVehicle) {
      toast.error("Selecione um veículo");
      return;
    }

    setIsLoading(true);

    try {
      // Criar OS com cliente e veículo existentes
      // order_number is auto-generated by database trigger
      const { data: newOS, error: osError } = await supabase
        .from("ordens_servico")
        .insert({
          client_id: selectedClient.id,
          vehicle_id: selectedVehicle.id,
          status: "diagnostico",
          order_number: "", // Will be overwritten by trigger
        } as any)
        .select("id, order_number")
        .single();

      if (osError) throw osError;

      toast.success(`OS ${newOS.order_number} criada com sucesso!`);
      
      // Redirecionar para detalhes da OS
      navigate(`/admin/os-ultimate/${newOS.id}`);

    } catch (error) {
      console.error("Erro ao criar OS:", error);
      toast.error("Erro ao criar OS. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/ordens-servico")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Nova Ordem de Serviço</h1>
            <p className="text-muted-foreground">Escolha como deseja abrir a OS</p>
          </div>
        </div>

        {/* Etapa 1: Seleção do tipo */}
        {flowType === "select" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => setFlowType("quick")}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Cliente Rápido</CardTitle>
                <CardDescription>
                  Cadastro rápido para novos clientes. Preencha apenas nome, veículo e placa.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button className="w-full">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Novo Cliente
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => setFlowType("existing")}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Cliente Existente</CardTitle>
                <CardDescription>
                  Busque por telefone ou placa para clientes já cadastrados.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button variant="outline" className="w-full">
                  <Search className="w-4 h-4 mr-2" />
                  Buscar Cliente
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Etapa 2A: Cliente Rápido */}
        {flowType === "quick" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Cliente Rápido
                  </CardTitle>
                  <CardDescription>Preencha os dados básicos para abrir a OS</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setFlowType("select")}>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Voltar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dados do Cliente */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Dados do Cliente
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      placeholder="Nome do cliente"
                      value={quickForm.name}
                      onChange={(e) => setQuickForm({ ...quickForm, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      placeholder="(11) 99999-9999"
                      value={quickForm.phone}
                      onChange={(e) => setQuickForm({ ...quickForm, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Dados do Veículo */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  Dados do Veículo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Marca</Label>
                    <Input
                      id="brand"
                      placeholder="Ex: Honda"
                      value={quickForm.brand}
                      onChange={(e) => setQuickForm({ ...quickForm, brand: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Modelo *</Label>
                    <Input
                      id="model"
                      placeholder="Ex: Civic"
                      value={quickForm.model}
                      onChange={(e) => setQuickForm({ ...quickForm, model: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plate">Placa *</Label>
                    <Input
                      id="plate"
                      placeholder="ABC1D23"
                      value={quickForm.plate}
                      onChange={(e) => setQuickForm({ ...quickForm, plate: e.target.value.toUpperCase() })}
                      maxLength={7}
                    />
                  </div>
                </div>
              </div>

              {/* Botão de Ação */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setFlowType("select")}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateQuickOS} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4 mr-2" />
                  )}
                  Abrir OS
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Etapa 2B: Cliente Existente */}
        {flowType === "existing" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    Cliente Existente
                  </CardTitle>
                  <CardDescription>Busque por telefone ou placa do veículo</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setFlowType("select")}>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Voltar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Campo de Busca */}
              <div className="flex gap-2">
                <Input
                  placeholder="Digite telefone ou placa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Resultados da Busca */}
              {searchResults.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-sm text-muted-foreground">
                    {searchResults.length} cliente(s) encontrado(s)
                  </h3>
                  {searchResults.map((client) => (
                    <Card 
                      key={client.id}
                      className={`cursor-pointer transition-colors ${
                        selectedClient?.id === client.id ? "border-primary bg-primary/5" : "hover:border-muted-foreground/50"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{client.name}</span>
                              {selectedClient?.id === client.id && (
                                <CheckCircle className="w-4 h-4 text-primary" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <Phone className="w-3 h-3" />
                              {client.phone}
                            </div>
                          </div>
                        </div>

                        {/* Veículos do cliente */}
                        <div className="mt-3 space-y-2">
                          <p className="text-xs text-muted-foreground">Veículos:</p>
                          <div className="flex flex-wrap gap-2">
                            {client.vehicles.map((vehicle) => (
                              <Badge
                                key={vehicle.id}
                                variant={selectedVehicle?.id === vehicle.id ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectClient(client, vehicle);
                                }}
                              >
                                <Car className="w-3 h-3 mr-1" />
                                {vehicle.brand} {vehicle.model} - {vehicle.plate}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Cliente e Veículo Selecionados */}
              {selectedClient && selectedVehicle && (
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                  <h3 className="font-medium text-green-700 dark:text-green-400 mb-2">
                    ✓ Selecionado para nova OS:
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Cliente</p>
                      <p className="font-medium">{selectedClient.name}</p>
                      <p className="text-muted-foreground">{selectedClient.phone}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Veículo</p>
                      <p className="font-medium">{selectedVehicle.brand} {selectedVehicle.model}</p>
                      <p className="text-muted-foreground">{selectedVehicle.plate}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Botão de Ação */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setFlowType("select")}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreateExistingOS} 
                  disabled={isLoading || !selectedClient || !selectedVehicle}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4 mr-2" />
                  )}
                  Abrir OS
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
