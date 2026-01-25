import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { mockUsers, mockVehicles, MockUser, MockVehicle } from '@/lib/mock-data'
import { formatPlate } from '@/lib/utils'
import { AdminLayout } from '@/components/layout/AdminLayout'
import {
  Search,
  Plus,
  Car,
  User,
  Phone,
  Mail,
  ArrowRight
} from 'lucide-react'

interface SearchResult {
  type: 'client' | 'vehicle';
  client: MockUser;
  vehicle?: MockVehicle;
}

export default function NovaOS() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [showQuickRegister, setShowQuickRegister] = useState(false)
  
  // Quick register form
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    email: '',
    vehicleBrand: '',
    vehicleModel: '',
    vehicleYear: '',
    vehiclePlate: '',
    vehicleColor: ''
  })

  // Get all clients
  const clients = mockUsers.filter((u) => u.role === 'user')

  // Unified search - searches by client name, vehicle plate, vehicle model
  const searchResults = useMemo(() => {
    if (!search.trim()) return []
    
    const searchLower = search.toLowerCase()
    const results: SearchResult[] = []
    
    // Search through vehicles (includes plate, model, brand)
    mockVehicles.forEach(vehicle => {
      const client = clients.find(c => c.id === vehicle.user_id)
      if (!client) return
      
      const matchesPlate = vehicle.plate.toLowerCase().includes(searchLower)
      const matchesModel = vehicle.model.toLowerCase().includes(searchLower)
      const matchesBrand = vehicle.brand.toLowerCase().includes(searchLower)
      const matchesClientName = client.full_name?.toLowerCase().includes(searchLower)
      
      if (matchesPlate || matchesModel || matchesBrand || matchesClientName) {
        results.push({
          type: 'vehicle',
          client,
          vehicle
        })
      }
    })
    
    // Add clients without matching vehicles (if they match by name)
    clients.forEach(client => {
      const matchesName = client.full_name?.toLowerCase().includes(searchLower)
      const alreadyInResults = results.some(r => r.client.id === client.id)
      
      if (matchesName && !alreadyInResults) {
        // Get first vehicle of this client if any
        const clientVehicle = mockVehicles.find(v => v.user_id === client.id)
        results.push({
          type: 'client',
          client,
          vehicle: clientVehicle
        })
      }
    })
    
    return results
  }, [search, clients])

  const handleSelectResult = (result: SearchResult) => {
    // Navigate to OS details page directly with client and vehicle data
    const osId = 'os-' + Date.now()
    navigate(`/admin/os/${osId}?new=true&clientId=${result.client.id}${result.vehicle ? `&vehicleId=${result.vehicle.id}` : ''}`)
  }

  const handleQuickRegister = () => {
    // In real app, would save to database
    const newClientId = 'client-' + Date.now()
    const newVehicleId = 'vehicle-' + Date.now()
    
    // Simulate creation and navigate
    const osId = 'os-' + Date.now()
    navigate(`/admin/os/${osId}?new=true`)
    
    setShowQuickRegister(false)
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Nova Ordem de Serviço</h1>
          <p className="text-muted-foreground">
            Busque por cliente, placa ou veículo para iniciar
          </p>
        </div>

        {/* Search Box */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Digite nome do cliente, placa ou modelo do veículo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-14 text-lg"
                autoFocus
              />
            </div>

            {/* Quick Register Button */}
            <div className="mt-4 flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => setShowQuickRegister(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Cadastro Rápido (Novo Cliente)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {search.trim() && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground px-1">
              {searchResults.length} resultado(s) encontrado(s)
            </p>

            {searchResults.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground mb-4">
                    Nenhum resultado para "{search}"
                  </p>
                  <Button onClick={() => setShowQuickRegister(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Cadastrar Novo Cliente
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {searchResults.map((result, index) => (
                  <Card 
                    key={`${result.client.id}-${result.vehicle?.id || index}`}
                    className="hover:bg-accent/50 transition-colors cursor-pointer group"
                    onClick={() => handleSelectResult(result)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          {result.vehicle ? (
                            <Car className="h-6 w-6 text-primary" />
                          ) : (
                            <User className="h-6 w-6 text-primary" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {result.client.full_name}
                          </p>
                          {result.vehicle ? (
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="font-mono">
                                {formatPlate(result.vehicle.plate)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {result.vehicle.brand} {result.vehicle.model} ({result.vehicle.year})
                              </span>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              {result.client.phone || result.client.email}
                            </p>
                          )}
                        </div>

                        {/* Arrow */}
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty State - when no search */}
        {!search.trim() && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Car className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-lg font-medium mb-2">Comece a digitar para buscar</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                Busque pelo nome do cliente, placa do veículo ou modelo do carro
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Register Dialog */}
      <Dialog open={showQuickRegister} onOpenChange={setShowQuickRegister}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Cadastro Rápido
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Client Section */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Dados do Cliente
              </h3>
              <div className="grid gap-3">
                <div>
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    placeholder="Nome do cliente"
                    value={newClient.name}
                    onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="phone">Telefone *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        placeholder="(11) 99999-9999"
                        value={newClient.phone}
                        onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@exemplo.com"
                        value={newClient.email}
                        onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Section */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Car className="h-4 w-4" />
                Dados do Veículo
              </h3>
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="brand">Marca *</Label>
                    <Input
                      id="brand"
                      placeholder="Ex: Volkswagen"
                      value={newClient.vehicleBrand}
                      onChange={(e) => setNewClient(prev => ({ ...prev, vehicleBrand: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">Modelo *</Label>
                    <Input
                      id="model"
                      placeholder="Ex: Golf GTI"
                      value={newClient.vehicleModel}
                      onChange={(e) => setNewClient(prev => ({ ...prev, vehicleModel: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="year">Ano</Label>
                    <Input
                      id="year"
                      placeholder="2024"
                      value={newClient.vehicleYear}
                      onChange={(e) => setNewClient(prev => ({ ...prev, vehicleYear: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="plate">Placa *</Label>
                    <Input
                      id="plate"
                      placeholder="ABC-1234"
                      value={newClient.vehiclePlate}
                      onChange={(e) => setNewClient(prev => ({ ...prev, vehiclePlate: e.target.value.toUpperCase() }))}
                      className="font-mono"
                    />
                  </div>
                  <div>
                    <Label htmlFor="color">Cor</Label>
                    <Input
                      id="color"
                      placeholder="Preto"
                      value={newClient.vehicleColor}
                      onChange={(e) => setNewClient(prev => ({ ...prev, vehicleColor: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuickRegister(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleQuickRegister}
              disabled={!newClient.name || !newClient.phone || !newClient.vehicleBrand || !newClient.vehicleModel || !newClient.vehiclePlate}
              className="gap-2"
            >
              <ArrowRight className="h-4 w-4" />
              Criar e Abrir OS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}