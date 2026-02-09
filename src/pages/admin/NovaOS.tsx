import { useState, useEffect } from 'react'
import { useNavigate } from '@/hooks/useNavigate'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/integrations/supabase/client'
import { formatPlate, formatCurrency } from '@/lib/utils'
import {
    ClipboardList,
    ArrowLeft,
    Search,
    Plus,
    Car,
    User,
    Check,
    Loader2,
} from 'lucide-react'

type Step = 'client' | 'vehicle' | 'services' | 'review'

interface Cliente {
  id: string;
  name: string;
  email: string | null;
  phone: string;
}

interface Veiculo {
  id: string;
  client_id: string;
  brand: string;
  model: string;
  plate: string;
  year: number | null;
}

interface Servico {
  id: string;
  nome: string;
  descricao: string | null;
  valor_base: number | null;
}

export default function NovaOS() {
    const navigate = useNavigate()
    const [step, setStep] = useState<Step>('client')
    const [searchClient, setSearchClient] = useState('')
    const [selectedClient, setSelectedClient] = useState<Cliente | null>(null)
    const [selectedVehicle, setSelectedVehicle] = useState<Veiculo | null>(null)
    const [selectedServices, setSelectedServices] = useState<Servico[]>([])
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(true)

    const [clientes, setClientes] = useState<Cliente[]>([])
    const [veiculos, setVeiculos] = useState<Veiculo[]>([])
    const [servicos, setServicos] = useState<Servico[]>([])

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            const [cRes, vRes, sRes] = await Promise.all([
                supabase.from("clientes").select("id, name, email, phone"),
                supabase.from("veiculos").select("id, client_id, brand, model, plate, year"),
                supabase.from("catalogo_servicos").select("id, nome, descricao, valor_base").eq("is_active", true),
            ])
            setClientes(cRes.data ?? [])
            setVeiculos(vRes.data ?? [])
            setServicos(sRes.data ?? [])
            setLoading(false)
        }
        fetchData()
    }, [])

    const filteredClients = clientes.filter((c) =>
        c.name?.toLowerCase().includes(searchClient.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchClient.toLowerCase()) ||
        c.phone?.includes(searchClient)
    )

    const clientVehicles = selectedClient
        ? veiculos.filter((v) => v.client_id === selectedClient.id)
        : []

    const total = selectedServices.reduce((acc, s) => acc + (s.valor_base || 0), 0)

    const handleCreateOS = () => {
        const mockOSId = 'os-' + Date.now()
        const currentPath = window.location.pathname
        const basePath = currentPath.includes('/gestao') ? '/gestao' : '/admin'
        navigate(`${basePath}/os/${mockOSId}?new=true`)
    }

    const toggleService = (service: Servico) => {
        if (selectedServices.find((s) => s.id === service.id)) {
            setSelectedServices(selectedServices.filter((s) => s.id !== service.id))
        } else {
            setSelectedServices([...selectedServices, service])
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ClipboardList className="h-6 w-6" />
                        Nova Ordem de Serviço
                    </h1>
                    <p className="text-muted-foreground">
                        Passo {step === 'client' ? 1 : step === 'vehicle' ? 2 : step === 'services' ? 3 : 4} de 4
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {['client', 'vehicle', 'services', 'review'].map((s, i) => (
                    <div key={s} className="flex items-center gap-2 flex-1">
                        <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${step === s
                                    ? 'bg-primary text-primary-foreground'
                                    : ['client', 'vehicle', 'services', 'review'].indexOf(step) > i
                                        ? 'bg-green-500 text-white'
                                        : 'bg-muted text-muted-foreground'
                                }`}
                        >
                            {['client', 'vehicle', 'services', 'review'].indexOf(step) > i ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                i + 1
                            )}
                        </div>
                        {i < 3 && <div className="flex-1 h-1 bg-muted rounded" />}
                    </div>
                ))}
            </div>

            {step === 'client' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Selecionar Cliente
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar cliente por nome, email ou telefone..."
                                value={searchClient}
                                onChange={(e) => setSearchClient(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <div className="space-y-2 max-h-80 overflow-y-auto">
                            {filteredClients.map((client) => (
                                <div
                                    key={client.id}
                                    onClick={() => {
                                        setSelectedClient(client)
                                        setStep('vehicle')
                                    }}
                                    className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-accent ${selectedClient?.id === client.id ? 'border-primary bg-primary/5' : ''}`}
                                >
                                    <p className="font-medium">{client.name}</p>
                                    <p className="text-sm text-muted-foreground">{client.email || client.phone}</p>
                                </div>
                            ))}
                            {filteredClients.length === 0 && (
                                <p className="text-center py-8 text-muted-foreground">Nenhum cliente encontrado</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {step === 'vehicle' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Car className="h-5 w-5" />
                            Selecionar Veículo
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Cliente: <strong>{selectedClient?.name}</strong>
                        </p>

                        <div className="space-y-2">
                            {clientVehicles.length === 0 ? (
                                <p className="text-center py-8 text-muted-foreground">
                                    Cliente não possui veículos cadastrados
                                </p>
                            ) : (
                                clientVehicles.map((vehicle) => (
                                    <div
                                        key={vehicle.id}
                                        onClick={() => {
                                            setSelectedVehicle(vehicle)
                                            setStep('services')
                                        }}
                                        className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-accent ${selectedVehicle?.id === vehicle.id ? 'border-primary bg-primary/5' : ''}`}
                                    >
                                        <p className="font-medium">
                                            {vehicle.brand} {vehicle.model} ({vehicle.year || "-"})
                                        </p>
                                        <Badge variant="outline">{formatPlate(vehicle.plate)}</Badge>
                                    </div>
                                ))
                            )}
                        </div>

                        <Button variant="outline" onClick={() => setStep('client')}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Voltar
                        </Button>
                    </CardContent>
                </Card>
            )}

            {step === 'services' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Adicionar Serviços</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Veículo: <strong>{selectedVehicle?.brand} {selectedVehicle?.model}</strong>
                        </p>

                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {servicos.map((service) => {
                                const isSelected = selectedServices.find((s) => s.id === service.id)
                                return (
                                    <div
                                        key={service.id}
                                        onClick={() => toggleService(service)}
                                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'border-primary bg-primary/5' : 'hover:bg-accent'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">{service.nome}</p>
                                                <p className="text-sm text-muted-foreground">{service.descricao || ""}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold">{formatCurrency(service.valor_base || 0)}</p>
                                                {isSelected && <Check className="h-4 w-4 text-primary ml-auto" />}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                            {servicos.length === 0 && (
                                <p className="text-center py-8 text-muted-foreground">Nenhum serviço cadastrado</p>
                            )}
                        </div>

                        {selectedServices.length > 0 && (
                            <div className="p-4 bg-muted rounded-lg">
                                <div className="flex justify-between font-medium">
                                    <span>Total ({selectedServices.length} serviço(s))</span>
                                    <span>{formatCurrency(total)}</span>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setStep('vehicle')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Voltar
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={() => setStep('review')}
                                disabled={selectedServices.length === 0}
                            >
                                Revisar OS
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {step === 'review' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Revisar Ordem de Serviço</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">Cliente</p>
                                <p className="font-medium">{selectedClient?.name}</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">Veículo</p>
                                <p className="font-medium">
                                    {selectedVehicle?.brand} {selectedVehicle?.model} - {formatPlate(selectedVehicle?.plate || '')}
                                </p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground mb-2">Serviços</p>
                                {selectedServices.map((s) => (
                                    <div key={s.id} className="flex justify-between text-sm">
                                        <span>{s.nome}</span>
                                        <span>{formatCurrency(s.valor_base || 0)}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                                    <span>Total</span>
                                    <span>{formatCurrency(total)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Observações</Label>
                            <Input
                                id="notes"
                                placeholder="Observações adicionais..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setStep('services')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Voltar
                            </Button>
                            <Button className="flex-1" onClick={handleCreateOS}>
                                <Plus className="h-4 w-4 mr-2" />
                                Criar OS
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
