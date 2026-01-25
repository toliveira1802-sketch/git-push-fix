import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { formatCurrency } from '@/lib/utils'
import { 
  Users, Search, Filter, ChevronRight, Phone, Mail, Car, 
  Calendar, DollarSign, UserPlus, UserCheck, UserX, TrendingUp
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface MockClient {
  id: string
  name: string
  email: string
  phone: string
  vehiclesCount: number
  totalSpent: number
  ordersCount: number
  lastServiceDate: string | null
  status: 'active' | 'inactive' | 'new'
  createdAt: string
}

// Mock CRM data
const mockClients: MockClient[] = [
  {
    id: 'client-1',
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 99988-7766',
    vehiclesCount: 2,
    totalSpent: 4580,
    ordersCount: 5,
    lastServiceDate: '2024-01-20',
    status: 'active',
    createdAt: '2023-06-15'
  },
  {
    id: 'client-2',
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    phone: '(11) 98877-6655',
    vehiclesCount: 1,
    totalSpent: 2100,
    ordersCount: 3,
    lastServiceDate: '2024-01-21',
    status: 'active',
    createdAt: '2023-08-20'
  },
  {
    id: 'client-3',
    name: 'Carlos Oliveira',
    email: 'carlos.oliveira@email.com',
    phone: '(11) 97766-5544',
    vehiclesCount: 1,
    totalSpent: 850,
    ordersCount: 1,
    lastServiceDate: '2024-01-22',
    status: 'new',
    createdAt: '2024-01-10'
  },
  {
    id: 'client-4',
    name: 'Ana Pereira',
    email: 'ana.pereira@email.com',
    phone: '(11) 96655-4433',
    vehiclesCount: 3,
    totalSpent: 12350,
    ordersCount: 12,
    lastServiceDate: '2024-01-15',
    status: 'active',
    createdAt: '2022-03-10'
  },
  {
    id: 'client-5',
    name: 'Roberto Mendes',
    email: 'roberto.mendes@email.com',
    phone: '(11) 95544-3322',
    vehiclesCount: 1,
    totalSpent: 350,
    ordersCount: 1,
    lastServiceDate: '2023-08-10',
    status: 'inactive',
    createdAt: '2023-05-20'
  },
  {
    id: 'client-6',
    name: 'Fernanda Lima',
    email: 'fernanda.lima@email.com',
    phone: '(11) 94433-2211',
    vehiclesCount: 2,
    totalSpent: 6780,
    ordersCount: 8,
    lastServiceDate: '2024-01-18',
    status: 'active',
    createdAt: '2022-11-05'
  },
]

type StatusFilter = 'all' | 'active' | 'inactive' | 'new'

const statusConfig = {
  active: { label: 'Ativo', variant: 'default' as const },
  inactive: { label: 'Inativo', variant: 'secondary' as const },
  new: { label: 'Novo', variant: 'outline' as const },
}

export default function Clientes() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const filteredClients = mockClients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.email.toLowerCase().includes(search.toLowerCase()) ||
      client.phone.includes(search)

    const matchesStatus = statusFilter === 'all' || client.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const statusFilters: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Ativos' },
    { value: 'new', label: 'Novos' },
    { value: 'inactive', label: 'Inativos' },
  ]

  // Summary stats
  const totalClients = mockClients.length
  const activeClients = mockClients.filter(c => c.status === 'active').length
  const newClients = mockClients.filter(c => c.status === 'new').length
  const totalRevenue = mockClients.reduce((sum, c) => sum + c.totalSpent, 0)

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6" />
              Clientes
            </h1>
            <p className="text-muted-foreground">
              {filteredClients.length} cliente(s) encontrado(s)
            </p>
          </div>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="bg-card border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Users className="h-4 w-4" />
                Total
              </div>
              <p className="text-2xl font-bold">{totalClients}</p>
            </CardContent>
          </Card>

          <Card className="bg-green-950/50 border-green-900">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-400 text-sm mb-1">
                <UserCheck className="h-4 w-4" />
                Ativos
              </div>
              <p className="text-2xl font-bold text-green-400">{activeClients}</p>
            </CardContent>
          </Card>

          <Card className="bg-blue-950/50 border-blue-900">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-blue-400 text-sm mb-1">
                <UserPlus className="h-4 w-4" />
                Novos
              </div>
              <p className="text-2xl font-bold text-blue-400">{newClients}</p>
            </CardContent>
          </Card>

          <Card className="bg-emerald-950/50 border-emerald-900">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-emerald-400 text-sm mb-1">
                <TrendingUp className="h-4 w-4" />
                Faturamento
              </div>
              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalRevenue)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          {statusFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={statusFilter === filter.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(filter.value)}
              className="shrink-0"
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Clients List */}
        <div className="space-y-3">
          {filteredClients.map((client) => {
            const status = statusConfig[client.status]

            return (
              <Card 
                key={client.id} 
                className="hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/admin/clientes/${client.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(client.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold truncate">{client.name}</span>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {client.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {client.phone}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                          <Car className="h-3 w-3" />
                          {client.vehiclesCount} veículo(s)
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {client.lastServiceDate 
                            ? `Último: ${format(new Date(client.lastServiceDate), 'dd/MM/yy', { locale: ptBR })}`
                            : 'Sem serviços'
                          }
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(client.totalSpent)} ({client.ordersCount} OS)
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {filteredClients.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">Nenhum cliente encontrado</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
