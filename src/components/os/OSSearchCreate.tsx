import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from '@/hooks/useNavigate'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { formatPlate } from '@/lib/utils'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
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

interface OSSearchCreateProps {
  onOSCreated?: (osId: string) => void;
}

export function OSSearchCreate({ onOSCreated }: OSSearchCreateProps) {
  const navigate = useNavigate()
  const { session } = useAuth()
  const [search, setSearch] = useState('')
  const [showQuickRegister, setShowQuickRegister] = useState(false)
  const [showAddVehicle, setShowAddVehicle] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  
  // Data from Supabase
  const [clients, setClients] = useState<Client[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  
  // Quick register form (new client + vehicle)
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

  // Add vehicle form (for existing client)
  const [newVehicle, setNewVehicle] = useState({
    brand: '',
    model: '',
    year: '',
    plate: '',
    color: ''
  })

  // Fetch clients and vehicles
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [clientsRes, vehiclesRes] = await Promise.all([
          (supabase as any).from('clients').select('id, nome, telefone, email').eq('status', 'ativo'),
          (supabase as any).from('vehicles').select('id, user_id, plate, brand, model, year, color').eq('is_active', true)
        ])

        if (clientsRes.error) throw clientsRes.error
        if (vehiclesRes.error) throw vehiclesRes.error

        // Mapear colunas PT -> EN
        setClients((clientsRes.data || []).map((c: any) => ({ id: c.id, name: c.nome, phone: c.telefone, email: c.email })))
        setVehicles((vehiclesRes.data || []).map((v: any) => ({ id: v.id, client_id: v.user_id, plate: v.plate, brand: v.brand, model: v.model, year: v.year, color: v.color })))
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

  // Generate order number — numero_os no banco
  const generateOrderNumber = async (): Promise<string> => {
    const year = new Date().getFullYear()

    const { data, error } = await supabase
      .from('ordens_servico')
      .select('numero_os')
      .like('numero_os', `OS-${year}-%`)
      .order('numero_os', { ascending: false })
      .limit(1)

    if (error) throw error

    let nextNumber = 1
    if (data && data.length > 0) {
      const lastNum = data[0].numero_os
      const match = lastNum.match(/(\d+)$/)
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1
      }
    }

    return `OS-${year}-${nextNumber.toString().padStart(3, '0')}`
  }

  const handleSelectResult = async (result: SearchResult) => {
    // Se cliente não tem veículo, abrir diálogo para adicionar
    if (!result.vehicle) {
      setSelectedClient(result.client)
      setNewVehicle({ brand: '', model: '', year: '', plate: '', color: '' })
      setShowAddVehicle(true)
      return
    }
    
    await createOS(result.client.id, result.vehicle.id)
  }

  const createOS = async (clientId: string, vehicleId: string) => {
    setIsCreating(true)
    try {
      const orderNumber = await generateOrderNumber()

      // Buscar nome do cliente e dados do veículo para desnormalizar
      const clientData = clients.find(c => c.id === clientId)
      const vehicleData = vehicles.find(v => v.id === vehicleId)
      const vehicleDesc = vehicleData ? `${vehicleData.brand} ${vehicleData.model}` : ''

      // Create the service order (dados desnormalizados)
      const { data, error } = await supabase
        .from('ordens_servico')
        .insert({
          numero_os: orderNumber,
          client_name: clientData?.name || '',
          client_phone: clientData?.phone || null,
          plate: vehicleData?.plate || '',
          vehicle: vehicleDesc,
          status: 'orcamento',
        } as any)
        .select('id')
        .single()

      if (error) throw error

      toast.success(`OS ${orderNumber} criada!`)
      
      if (onOSCreated) {
        onOSCreated(data.id)
      } else {
        navigate(`/admin/os/${data.id}?new=true`)
      }
    } catch (error) {
      console.error('Erro ao criar OS:', error)
      toast.error('Erro ao criar ordem de serviço')
    } finally {
      setIsCreating(false)
    }
  }

  const handleAddVehicleAndCreateOS = async () => {
    if (!selectedClient || !newVehicle.plate || !newVehicle.brand || !newVehicle.model) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    
    setIsCreating(true)
    try {
      // 1. Create vehicle
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .insert({
          user_id: selectedClient.id,
          plate: newVehicle.plate.toUpperCase(),
          brand: newVehicle.brand,
          model: newVehicle.model,
          year: newVehicle.year ? parseInt(newVehicle.year) : null,
          color: newVehicle.color || null,
          is_active: true
        })
        .select('id')
        .single()
      
      if (vehicleError) throw vehicleError
      
      // 2. Create OS
      setShowAddVehicle(false)
      await createOS(selectedClient.id, vehicleData.id)
    } catch (error) {
      console.error('Erro ao criar veículo:', error)
      toast.error('Erro ao criar veículo')
      setIsCreating(false)
    }
  }

  const handleQuickRegister = async () => {
    if (!newClient.name || !newClient.phone || !newClient.vehiclePlate || !newClient.vehicleBrand || !newClient.vehicleModel) {
      toast.error('Preencha nome, telefone, placa, marca e modelo')
      return
    }

    if (!session) {
      toast.error('Você precisa estar logado para cadastrar clientes')
      return
    }
    
    setIsCreating(true)
    try {
      // 1. Criar cliente na tabela clients
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .insert({
          nome: newClient.name.trim(),
          telefone: newClient.phone.replace(/\D/g, ''),
          email: newClient.email?.trim() || null,
          status: 'ativo',
          origem_cadastro: 'oficina',
        })
        .select('id')
        .single()

      if (clientError) throw new Error(`Erro ao criar cliente: ${clientError.message}`)
      const clientId = clientData.id

      // 2. Criar veículo na tabela vehicles
      const vehicleYear = newClient.vehicleYear ? Number(newClient.vehicleYear) : null
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .insert({
          user_id: clientId,
          plate: newClient.vehiclePlate.trim().toUpperCase(),
          brand: newClient.vehicleBrand.trim(),
          model: newClient.vehicleModel.trim(),
          year: vehicleYear,
          color: newClient.vehicleColor?.trim() || null,
          is_active: true,
        })
        .select('id')
        .single()

      if (vehicleError) {
        await (supabase as any).from('clients').delete().eq('id', clientId)
        throw new Error(`Erro ao criar veículo: ${vehicleError.message}`)
      }
      const vehicleId = vehicleData.id

      // 3. Gerar número de OS e criar OS (dados desnormalizados)
      const orderNumber = await generateOrderNumber()
      const vehicleDesc = `${newClient.vehicleBrand.trim()} ${newClient.vehicleModel.trim()}`

      const { data: osData, error: osError } = await supabase
        .from('ordens_servico')
        .insert({
          numero_os: orderNumber,
          client_name: newClient.name.trim(),
          client_phone: newClient.phone.replace(/\D/g, '') || null,
          plate: newClient.vehiclePlate.trim().toUpperCase(),
          vehicle: vehicleDesc,
          status: 'orcamento',
        } as any)
        .select('id')
        .single()

      if (osError) {
        await (supabase as any).from('vehicles').delete().eq('id', vehicleId)
        await (supabase as any).from('clients').delete().eq('id', clientId)
        throw new Error(`Erro ao criar OS: ${osError.message}`)
      }

      // Atualizar lista local
      setClients(prev => [...prev, { id: clientId, name: newClient.name, phone: newClient.phone, email: newClient.email || null }])
      setVehicles(prev => [...prev, { 
        id: vehicleId, 
        client_id: clientId, 
        plate: newClient.vehiclePlate.toUpperCase(), 
        brand: newClient.vehicleBrand, 
        model: newClient.vehicleModel, 
        year: vehicleYear,
        color: newClient.vehicleColor || null 
      }])
      
      toast.success(`Cliente, veículo e OS ${orderNumber} criados!`)
      setShowQuickRegister(false)
      setNewClient({ name: '', phone: '', email: '', vehiclePlate: '', vehicleBrand: '', vehicleModel: '', vehicleYear: undefined, vehicleColor: '' })

      if (onOSCreated) {
        onOSCreated(osData.id)
      }


    } catch (err: any) {
      console.error('handleQuickRegister error:', err)
      toast.error(err.message || 'Erro ao criar cliente/veículo/OS')
    } finally {
      setIsCreating(false)
    }
  }

  return (
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
                    <Label htmlFor="plate">Placa *</Label>
                    <Input
                      id="plate"
                      placeholder="ABC-1234"
                      value={newClient.vehiclePlate}
                      onChange={(e) => setNewClient(prev => ({ ...prev, vehiclePlate: e.target.value.toUpperCase() }))}
                      maxLength={8}
                    />
                  </div>
                  <div>
                    <Label htmlFor="year">Ano</Label>
                    <Input
                      id="year"
                      type="number"
                      placeholder="2024"
                      value={newClient.vehicleYear}
                      onChange={(e) => setNewClient(prev => ({ ...prev, vehicleYear: e.target.value }))}
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
            <Button onClick={handleQuickRegister} disabled={isCreating} className="gap-2">
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Criar Cliente e OS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Vehicle Dialog (for existing client) */}
      <Dialog open={showAddVehicle} onOpenChange={setShowAddVehicle}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Adicionar Veículo
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedClient && (
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="font-medium">{selectedClient.name}</p>
                <p className="text-sm text-muted-foreground">{selectedClient.phone}</p>
              </div>
            )}

            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="vBrand">Marca *</Label>
                  <Input
                    id="vBrand"
                    placeholder="Ex: Volkswagen"
                    value={newVehicle.brand}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, brand: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="vModel">Modelo *</Label>
                  <Input
                    id="vModel"
                    placeholder="Ex: Golf GTI"
                    value={newVehicle.model}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, model: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="vPlate">Placa *</Label>
                  <Input
                    id="vPlate"
                    placeholder="ABC-1234"
                    value={newVehicle.plate}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, plate: e.target.value.toUpperCase() }))}
                    maxLength={8}
                  />
                </div>
                <div>
                  <Label htmlFor="vYear">Ano</Label>
                  <Input
                    id="vYear"
                    type="number"
                    placeholder="2024"
                    value={newVehicle.year}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, year: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="vColor">Cor</Label>
                  <Input
                    id="vColor"
                    placeholder="Preto"
                    value={newVehicle.color}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, color: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddVehicle(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddVehicleAndCreateOS} disabled={isCreating} className="gap-2">
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Criar Veículo e OS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
