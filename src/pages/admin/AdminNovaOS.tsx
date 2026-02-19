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

      // Buscar por telefone na tabela clients
      const { data: clientsByPhone, error: phoneError } = await supabase
        .from("clients" as any)
        .select(`id, nome, telefone, email`)
        .ilike("telefone", `%${searchClean}%`)
        .limit(10);

      if (phoneError) throw phoneError;

      // Buscar veículos de cada cliente encontrado
      const clientIds = (clientsByPhone || []).map((c: any) => c.id);
      let vehiclesForClients: any[] = [];
      if (clientIds.length > 0) {
        const { data: vData } = await supabase
          .from("vehicles" as any)
          .select("id, brand, model, plate, year, km_atual, user_id")
          .in("user_id", clientIds);
        vehiclesForClients = vData || [];
      }

      // Buscar por placa na tabela vehicles
      const { data: vehiclesByPlate, error: plateError } = await supabase
        .from("vehicles" as any)
        .select(`id, brand, model, plate, year, km_atual, user_id`)
        .ilike("plate", `%${searchUpper}%`)
        .limit(10);

      if (plateError) throw plateError;

      // Buscar clientes dos veículos encontrados por placa
      const ownerIds = (vehiclesByPlate || []).map((v: any) => v.user_id).filter(Boolean);
      let ownersData: any[] = [];
      if (ownerIds.length > 0) {
        const { data: oData } = await supabase
          .from("clients" as any)
          .select("id, nome, telefone, email")
          .in("id", ownerIds);
        ownersData = oData || [];
      }

      // Combinar resultados
      const clientsMap = new Map<string, ClienteEncontrado>();

      // Adicionar clientes encontrados por telefone
      (clientsByPhone as any[])?.forEach((client: any) => {
        const clientVehicles = vehiclesForClients.filter((v: any) => v.user_id === client.id);
        clientsMap.set(client.id, {
          id: client.id,
          name: client.nome,
          phone: client.telefone,
          email: client.email,
          vehicles: clientVehicles.map((v: any) => ({
            id: v.id, brand: v.brand, model: v.model, plate: v.plate, year: v.year, km: v.km_atual,
          })),
        });
      });

      // Adicionar clientes encontrados por placa
      (vehiclesByPlate as any[])?.forEach((vehicle: any) => {
        const owner = ownersData.find((o: any) => o.id === vehicle.user_id);
        if (owner) {
          if (clientsMap.has(owner.id)) {
            const existing = clientsMap.get(owner.id)!;
            if (!existing.vehicles.find((v) => v.id === vehicle.id)) {
              existing.vehicles.push({
                id: vehicle.id, brand: vehicle.brand, model: vehicle.model,
                plate: vehicle.plate, year: vehicle.year, km: vehicle.km_atual,
              });
            }
          } else {
            clientsMap.set(owner.id, {
              id: owner.id, name: owner.nome, phone: owner.telefone, email: owner.email,
              vehicles: [{
                id: vehicle.id, brand: vehicle.brand, model: vehicle.model,
                plate: vehicle.plate, year: vehicle.year, km: vehicle.km_atual,
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
      const plateClean = quickForm.plate.toUpperCase().replace(/[^A-Z0-9]/g, "");
      const vehicleDesc = `${quickForm.brand.trim() || ''} ${quickForm.model.trim()}`.trim();

      // 1. Criar cliente na tabela clients
      const { data: newClient, error: clientError } = await supabase
        .from("clients" as any)
        .insert({
          nome: quickForm.name.trim(),
          telefone: quickForm.phone.trim() || "Não informado",
          status: "ativo",
          origem_cadastro: 'oficina',
        })
        .select("id")
        .single();

      if (clientError) throw clientError;

      // 2. Criar veículo na tabela vehicles
      const { data: newVehicle, error: vehicleError } = await supabase
        .from("vehicles" as any)
        .insert({
          user_id: newClient.id,
          brand: quickForm.brand.trim() || "Não informado",
          model: quickForm.model.trim(),
          plate: plateClean,
          is_active: true,
        })
        .select("id")
        .single();

      if (vehicleError) throw vehicleError;

      // 3. Criar OS com dados desnormalizados
      const { data: newOS, error: osError } = await supabase
        .from("ordens_servico")
        .insert({
          client_name: quickForm.name.trim(),
          client_phone: quickForm.phone.trim() || null,
          plate: plateClean,
          vehicle: vehicleDesc,
          status: "diagnostico",
        } as any)
        .select("id, numero_os")
        .single();

      if (osError) throw osError;

      toast.success(`OS ${newOS.numero_os} criada com sucesso!`);
      
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
      const vehicleDesc = `${selectedVehicle.brand || ''} ${selectedVehicle.model || ''}`.trim();

      // Criar OS com dados desnormalizados
      const { data: newOS, error: osError } = await supabase
        .from("ordens_servico")
        .insert({
          client_name: selectedClient.name,
          client_phone: selectedClient.phone,
          plate: selectedVehicle.plate,
          vehicle: vehicleDesc,
          status: "diagnostico",
        } as any)
        .select("id, numero_os")
        .single();

      if (osError) throw osError;

      toast.success(`OS ${newOS.numero_os} criada com sucesso!`);
      
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
