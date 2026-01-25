import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { mockServiceOrders, getVehicleById, getUserById, OrderStatus } from '@/lib/mock-data'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ClipboardList, Search, Plus, Filter, ChevronRight } from 'lucide-react'
import { AdminLayout } from '@/components/layout/AdminLayout'

const statusConfig: Record<OrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  open: { label: 'Aberta', variant: 'secondary' },
  in_progress: { label: 'Em andamento', variant: 'default' },
  waiting_parts: { label: 'Aguardando peças', variant: 'outline' },
  waiting_approval: { label: 'Aguardando aprovação', variant: 'outline' },
  completed: { label: 'Concluída', variant: 'default' },
  cancelled: { label: 'Cancelada', variant: 'destructive' },
}

export default function OrdensServico() {
  const navigate = useNavigate()
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')

  const filteredOrders = mockServiceOrders.filter((order) => {
    const vehicle = getVehicleById(order.vehicle_id)
    const user = getUserById(order.user_id)

    const matchesSearch =
      order.order_number.toLowerCase().includes(search.toLowerCase()) ||
      vehicle?.plate.toLowerCase().includes(search.toLowerCase()) ||
      user?.full_name?.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const statusFilters: { value: OrderStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'Todas' },
    { value: 'open', label: 'Abertas' },
    { value: 'in_progress', label: 'Em andamento' },
    { value: 'waiting_approval', label: 'Aguard. aprovação' },
    { value: 'completed', label: 'Concluídas' },
  ]

  const basePath = location.pathname.includes('/gestao') ? '/gestao' : '/admin'

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ClipboardList className="h-6 w-6" />
              Ordens de Serviço
            </h1>
            <p className="text-muted-foreground">
              {filteredOrders.length} ordem(ns) encontrada(s)
            </p>
          </div>
          <Button onClick={() => navigate(`${basePath}/nova-os`)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova OS
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número, placa ou cliente..."
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

        {/* Orders List */}
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const vehicle = getVehicleById(order.vehicle_id)
            const user = getUserById(order.user_id)
            const status = statusConfig[order.status]

            return (
              <Card 
                key={order.id} 
                className="hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => navigate(`${basePath}/os/${order.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold">{order.order_number}</span>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      {vehicle && (
                        <p className="text-sm">
                          {vehicle.brand} {vehicle.model} • {vehicle.plate}
                        </p>
                      )}
                      {user && (
                        <p className="text-sm text-muted-foreground">{user.full_name}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Criada em {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatCurrency(order.total)}</p>
                      <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {filteredOrders.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">Nenhuma ordem de serviço encontrada</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
