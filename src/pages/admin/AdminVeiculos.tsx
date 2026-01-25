import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  Car, 
  User, 
  Star, 
  Megaphone, 
  Filter,
  ChevronDown,
  ChevronUp,
  Phone,
  Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  color: string;
  km: number;
  lastService: string;
  interested: boolean;
  selectedForPromo: boolean;
}

interface ClientWithVehicles {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicles: Vehicle[];
}

// Mock data - clientes com veículos
const mockClientsWithVehicles: ClientWithVehicles[] = [
  {
    id: 'client-1',
    name: 'João Silva',
    phone: '11999887766',
    email: 'joao.silva@email.com',
    vehicles: [
      { id: 'v1', brand: 'Volkswagen', model: 'Golf GTI', year: 2020, plate: 'ABC-1234', color: 'Preto', km: 45000, lastService: '2024-01-15', interested: true, selectedForPromo: false },
      { id: 'v2', brand: 'Honda', model: 'Civic', year: 2019, plate: 'DEF-5678', color: 'Prata', km: 62000, lastService: '2024-01-10', interested: false, selectedForPromo: false },
    ]
  },
  {
    id: 'client-2',
    name: 'Maria Santos',
    phone: '11988776655',
    email: 'maria.santos@email.com',
    vehicles: [
      { id: 'v3', brand: 'Toyota', model: 'Corolla', year: 2021, plate: 'GHI-9012', color: 'Branco', km: 28000, lastService: '2024-01-20', interested: true, selectedForPromo: false },
    ]
  },
  {
    id: 'client-3',
    name: 'Carlos Oliveira',
    phone: '11977665544',
    email: 'carlos.oliveira@email.com',
    vehicles: [
      { id: 'v4', brand: 'BMW', model: '320i', year: 2022, plate: 'JKL-3456', color: 'Azul', km: 15000, lastService: '2024-01-18', interested: true, selectedForPromo: false },
      { id: 'v5', brand: 'Mercedes', model: 'C200', year: 2021, plate: 'MNO-7890', color: 'Preto', km: 32000, lastService: '2023-12-20', interested: false, selectedForPromo: false },
      { id: 'v6', brand: 'Audi', model: 'A4', year: 2020, plate: 'PQR-1234', color: 'Cinza', km: 48000, lastService: '2023-11-15', interested: true, selectedForPromo: false },
    ]
  },
  {
    id: 'client-4',
    name: 'Ana Costa',
    phone: '11966554433',
    email: 'ana.costa@email.com',
    vehicles: [
      { id: 'v7', brand: 'Fiat', model: 'Argo', year: 2023, plate: 'STU-5678', color: 'Vermelho', km: 8000, lastService: '2024-01-22', interested: false, selectedForPromo: false },
    ]
  },
];

export default function AdminVeiculos() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterInterested, setFilterInterested] = useState(false);
  const [clients, setClients] = useState<ClientWithVehicles[]>(mockClientsWithVehicles);
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set(mockClientsWithVehicles.map(c => c.id)));

  // Summary stats
  const totalClients = clients.length;
  const totalVehicles = clients.reduce((acc, c) => acc + c.vehicles.length, 0);
  const interestedVehicles = clients.reduce((acc, c) => acc + c.vehicles.filter(v => v.interested).length, 0);
  const selectedForPromo = clients.reduce((acc, c) => acc + c.vehicles.filter(v => v.selectedForPromo).length, 0);

  // Filter clients
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.vehicles.some(v => 
        v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    if (filterInterested) {
      return matchesSearch && client.vehicles.some(v => v.interested);
    }
    return matchesSearch;
  });

  const toggleClientExpand = (clientId: string) => {
    setExpandedClients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clientId)) {
        newSet.delete(clientId);
      } else {
        newSet.add(clientId);
      }
      return newSet;
    });
  };

  const toggleInterested = (clientId: string, vehicleId: string) => {
    setClients(prev => prev.map(client => {
      if (client.id === clientId) {
        return {
          ...client,
          vehicles: client.vehicles.map(v => 
            v.id === vehicleId ? { ...v, interested: !v.interested } : v
          )
        };
      }
      return client;
    }));
  };

  const togglePromoSelection = (clientId: string, vehicleId: string) => {
    setClients(prev => prev.map(client => {
      if (client.id === clientId) {
        return {
          ...client,
          vehicles: client.vehicles.map(v => 
            v.id === vehicleId ? { ...v, selectedForPromo: !v.selectedForPromo } : v
          )
        };
      }
      return client;
    }));
  };

  const handleCreatePromotion = () => {
    // Get selected vehicles with client info
    const selectedData = clients.flatMap(client => 
      client.vehicles
        .filter(v => v.selectedForPromo)
        .map(v => ({ client, vehicle: v }))
    );
    
    if (selectedData.length === 0) {
      return;
    }

    // Navigate to promotion page with selected data
    navigate('/admin/nova-promocao', { 
      state: { selectedVehicles: selectedData }
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const formatPlate = (plate: string) => {
    return plate.toUpperCase();
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Veículos</h1>
            <p className="text-muted-foreground">Cadastro de veículos por cliente</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{totalClients}</p>
                    <p className="text-xs text-muted-foreground">Clientes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Car className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{totalVehicles}</p>
                    <p className="text-xs text-muted-foreground">Veículos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Star className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{interestedVehicles}</p>
                    <p className="text-xs text-muted-foreground">Interesse</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Megaphone className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{selectedForPromo}</p>
                    <p className="text-xs text-muted-foreground">Promoção</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, placa, modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant={filterInterested ? "default" : "outline"}
            onClick={() => setFilterInterested(!filterInterested)}
            className="gap-2"
          >
            <Star className="w-4 h-4" />
            Com Interesse
          </Button>
        </div>

        {/* Promotion Action Bar */}
        {selectedForPromo > 0 && (
          <Card className="border-emerald-500/50 bg-emerald-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Megaphone className="w-5 h-5 text-emerald-500" />
                  <span className="font-medium text-foreground">
                    {selectedForPromo} veículo(s) selecionado(s) para promoção
                  </span>
                </div>
                <Button onClick={handleCreatePromotion} className="bg-emerald-600 hover:bg-emerald-700">
                  <Megaphone className="w-4 h-4 mr-2" />
                  Criar Promoção
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Clients List with Vehicles */}
        <div className="space-y-4">
          {filteredClients.map(client => (
            <Card key={client.id} className="border overflow-hidden">
              {/* Client Header */}
              <div 
                className="p-4 bg-muted/30 cursor-pointer flex items-center justify-between"
                onClick={() => toggleClientExpand(client.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{client.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {client.phone}
                      </span>
                      <span>•</span>
                      <span>{client.vehicles.length} veículo(s)</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {client.vehicles.some(v => v.interested) && (
                    <Badge variant="outline" className="border-amber-500/50 text-amber-500">
                      <Star className="w-3 h-3 mr-1" />
                      Interesse
                    </Badge>
                  )}
                  {expandedClients.has(client.id) ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Vehicles List */}
              {expandedClients.has(client.id) && (
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {(filterInterested ? client.vehicles.filter(v => v.interested) : client.vehicles).map(vehicle => (
                      <div key={vehicle.id} className="p-4 flex items-center gap-4">
                        {/* Promo Selection Checkbox */}
                        <div className="flex flex-col items-center gap-1">
                          <Checkbox
                            checked={vehicle.selectedForPromo}
                            onCheckedChange={() => togglePromoSelection(client.id, vehicle.id)}
                          />
                          <span className="text-[10px] text-muted-foreground">Promo</span>
                        </div>

                        {/* Vehicle Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">
                              {vehicle.brand} {vehicle.model}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {vehicle.year}
                            </Badge>
                            {vehicle.interested && (
                              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span className="font-mono">{formatPlate(vehicle.plate)}</span>
                            <span>•</span>
                            <span>{vehicle.color}</span>
                            <span>•</span>
                            <span>{vehicle.km.toLocaleString('pt-BR')} km</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Calendar className="w-3 h-3" />
                            <span>Último serviço: {formatDate(vehicle.lastService)}</span>
                          </div>
                        </div>

                        {/* Interest Toggle */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleInterested(client.id, vehicle.id)}
                          className={cn(
                            "gap-1",
                            vehicle.interested && "text-amber-500"
                          )}
                        >
                          <Star className={cn("w-4 h-4", vehicle.interested && "fill-amber-500")} />
                          <span className="hidden sm:inline">Interesse</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}

          {filteredClients.length === 0 && (
            <div className="text-center py-12">
              <Car className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum veículo encontrado</h3>
              <p className="text-muted-foreground">Tente ajustar os filtros de busca.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
