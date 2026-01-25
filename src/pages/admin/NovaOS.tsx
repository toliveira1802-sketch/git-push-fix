import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { formatPlate } from '@/lib/utils'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import {
  Search,
  Plus,
  Car,
  User,
  Phone,
  Mail,
  ArrowRight,
  Loader2
} from 'lucide-react'

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string | null;
}

interface Vehicle {
  id: string;
  client_id: string;
  plate: string;
  brand: string;
  model: string;
  year: number | null;
  color: string | null;
}

interface SearchResult {
  type: 'client' | 'vehicle';
  client: Client;
  vehicle?: Vehicle;
}

export default function NovaOS() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [showQuickRegister, setShowQuickRegister] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  
  // Data from Supabase
  const [clients, setClients] = useState<Client[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  
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

  // Fetch clients and vehicles
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [clientsRes, vehiclesRes] = await Promise.all([
          supabase.from('clients').select('id, name, phone, email').eq('status', 'active'),
          supabase.from('vehicles').select('id, client_id, plate, brand, model, year, color').eq('is_active', true)
        ])
        
        if (clientsRes.error) throw clientsRes.error
        if (vehiclesRes.error) throw vehiclesRes.error
        
        setClients(clientsRes.data || [])
        setVehicles(vehiclesRes.data || [])
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast.error('Erro ao carregar clientes e veículos')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // Unified search - searches by client name, vehicle plate, vehicle model
  const searchResults = useMemo(() => {
    if (!search.trim()) return []
    
    const searchLower = search.toLowerCase()
    const results: SearchResult[] = []
    
    // Search through vehicles (includes plate, model, brand)
    vehicles.forEach(vehicle => {
      const client = clients.find(c => c.id === vehicle.client_id)
      if (!client) return
      
      const matchesPlate = vehicle.plate.toLowerCase().includes(searchLower)
      const matchesModel = vehicle.model.toLowerCase().includes(searchLower)
      const matchesBrand = vehicle.brand.toLowerCase().includes(searchLower)
      const matchesClientName = client.name?.toLowerCase().includes(searchLower)
      
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
      const matchesName = client.name?.toLowerCase().includes(searchLower)
      const matchesPhone = client.phone?.includes(search)
      const alreadyInResults = results.some(r => r.client.id === client.id)
      
      if ((matchesName || matchesPhone) && !alreadyInResults) {
        // Get first vehicle of this client if any
        const clientVehicle = vehicles.find(v => v.client_id === client.id)
        results.push({
          type: 'client',
          client,
          vehicle: clientVehicle
        })
      }
    })
    
    return results.slice(0, 20) // Limit results
  }, [search, clients, vehicles])

  // Generate order number
  const generateOrderNumber = async (): Promise<string> => {
    const year = new Date().getFullYear()
    
    // Get the latest order number for this year
    const { data, error } = await supabase
      .from('service_orders')
      .select('order_number')
      .like('order_number', `${year}-%`)
      .order('order_number', { ascending: false })
      .limit(1)
    
    if (error) throw error
    
    let nextNumber = 1
    if (data && data.length > 0) {
      const lastNumber = data[0].order_number
      const parts = lastNumber.split('-')
      if (parts.length === 2) {
        nextNumber = parseInt(parts[1], 10) + 1
      }
    }
    
    return `${year}-${nextNumber.toString().padStart(5, '0')}`
  }

  const handleSelectResult = async (result: SearchResult) => {
    if (!result.vehicle) {
      toast.error('Selecione um veículo para criar a OS')
      return
    }
    
    setIsCreating(true)
    try {
      const orderNumber = await generateOrderNumber()
      
      // Create the service order
      const { data, error } = await supabase
        .from('service_orders')
        .insert({
          order_number: orderNumber,
          client_id: result.client.id,
          vehicle_id: result.vehicle.id,
          status: 'orcamento',
          entry_km: result.vehicle.year ? null : null, // Will be filled later
        })
        .select('id')
        .single()
      
      if (error) throw error
      
      toast.success(`OS ${orderNumber} criada!`)
      navigate(`/admin/os/${data.id}?new=true`)
    } catch (error) {
      console.error('Erro ao criar OS:', error)
      toast.error('Erro ao criar ordem de serviço')
    } finally {
      setIsCreating(false)
    }
  }

  const handleQuickRegister = async () => {
    if (!newClient.name || !newClient.phone || !newClient.vehiclePlate || !newClient.vehicleBrand || !newClient.vehicleModel) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    
    setIsCreating(true)
    try {
      // 1. Create client
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .insert({
          name: newClient.name,
          phone: newClient.phone,
          email: newClient.email || null,
          status: 'active',
          registration_source: 'admin'
        })
        .select('id')
        .single()
      
      if (clientError) throw clientError
      
      // 2. Create vehicle
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .insert({
          client_id: clientData.id,
          plate: newClient.vehiclePlate.toUpperCase(),
          brand: newClient.vehicleBrand,
          model: newClient.vehicleModel,
          year: newClient.vehicleYear ? parseInt(newClient.vehicleYear) : null,
          color: newClient.vehicleColor || null,
          is_active: true
        })
        .select('id')
        .single()
      
      if (vehicleError) throw vehicleError
      
      // 3. Create service order
      const orderNumber = await generateOrderNumber()
      const { data: osData, error: osError } = await supabase
        .from('service_orders')
        .insert({
          order_number: orderNumber,
          client_id: clientData.id,
          vehicle_id: vehicleData.id,
          status: 'orcamento'
        })
        .select('id')
        .single()
      
      if (osError) throw osError
      
      toast.success(`Cliente, veículo e OS ${orderNumber} criados!`)
      setShowQuickRegister(false)
      navigate(`/admin/os/${osData.id}?new=true`)
    } catch (error) {
      console.error('Erro ao criar:', error)
      toast.error('Erro ao criar cliente/veículo')
    } finally {
      setIsCreating(false)
    }
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
              {isLoading && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
              )}
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
                            {result.client.name}
                          </p>
                          {result.vehicle ? (
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge variant="outline" className="font-mono">
                                {formatPlate(result.vehicle.plate)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {result.vehicle.brand} {result.vehicle.model} {result.vehicle.year && `(${result.vehicle.year})`}
                              </span>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              {result.client.phone || result.client.email}
                              <span className="text-amber-600 ml-2">(sem veículo cadastrado)</span>
                            </p>
                          )}
                        </div>

                        {/* Arrow */}
                        {isCreating ? (
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        ) : (
                          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        )}
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
              {clients.length > 0 && (
                <p className="text-xs text-muted-foreground mt-4">
                  {clients.length} clientes • {vehicles.length} veículos cadastrados
                </p>
              )}
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
              disabled={!newClient.name || !newClient.phone || !newClient.vehicleBrand || !newClient.vehicleModel || !newClient.vehiclePlate || isCreating}
              className="gap-2"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              Criar e Abrir OS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
